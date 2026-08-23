"""
Core RAG chain orchestration.
Combines vector retrieval, MongoDB tools, conversation memory, and LLM
into a production-grade conversational RAG pipeline.
"""

import logging
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.documents import Document

from config import config
from chains.prompts import CHAT_PROMPT, CONDENSE_QUESTION_PROMPT
from retrieval.vectorstore import get_retriever
from retrieval.mongo_tool import query_report_database
from memory.conversation import memory_manager

logger = logging.getLogger(__name__)


def _get_llm() -> ChatGoogleGenerativeAI:
    """Create the Google Gemini LLM instance."""
    return ChatGoogleGenerativeAI(
        model=config.LLM_MODEL,
        api_key=config.GOOGLE_API_KEY,
        temperature=config.LLM_TEMPERATURE,
        max_output_tokens=config.LLM_MAX_TOKENS,
    )


def _format_docs(docs: list[Document]) -> str:
    """Format retrieved documents into a context string."""
    if not docs:
        return "No relevant documents were found for this query."

    formatted = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        category = doc.metadata.get("category", "general")
        formatted.append(
            f"[Source {i}: {source} ({category})]\n{doc.page_content}"
        )
    return "\n\n---\n\n".join(formatted)


def _extract_sources(docs: list[Document]) -> list[dict]:
    """Extract source metadata from retrieved documents."""
    sources = []
    seen = set()
    for doc in docs:
        source_name = doc.metadata.get("source", "unknown")
        if source_name not in seen:
            seen.add(source_name)
            sources.append({
                "name": source_name,
                "category": doc.metadata.get("category", "general"),
            })
    return sources


def _is_report_query(question: str) -> bool:
    """Determine if the question is about live report data."""
    report_keywords = [
        "how many reports", "pending reports", "resolved reports",
        "report statistics", "report stats", "total reports",
        "resolution rate", "recent reports", "latest reports",
        "category breakdown", "in progress reports", "in-progress",
        "kitne report", "कितने रिपोर्ट", "reports in",
        "reports from", "number of reports",
    ]
    question_lower = question.lower()
    return any(kw in question_lower for kw in report_keywords)


def _format_user_context(user_context: dict) -> str:
    """Format user context for the system prompt."""
    if not user_context:
        return "No user context available (anonymous query)."

    parts = []
    if user_context.get("state"):
        parts.append(f"- User's State: {user_context['state']}")
    if user_context.get("area"):
        parts.append(f"- User's Area: {user_context['area']}")
    if user_context.get("role"):
        parts.append(f"- User's Role: {user_context['role']}")
    if user_context.get("username"):
        parts.append(f"- Username: {user_context['username']}")

    return "\n".join(parts) if parts else "No user context available."


async def process_chat(
    question: str,
    session_id: str,
    user_context: Optional[dict] = None,
) -> dict:
    """
    Process a chat message through the full RAG pipeline.

    Pipeline:
    1. Retrieve conversation history for the session.
    2. If it's a follow-up, condense into a standalone question.
    3. Determine if this is a report-data query or knowledge query.
    4. Retrieve relevant documents from ChromaDB and/or query MongoDB.
    5. Generate response using Gemini with the augmented context.
    6. Store the exchange in conversation memory.

    Args:
        question: The user's message.
        session_id: Unique session identifier.
        user_context: Optional user info (state, area, role).

    Returns:
        Dict with 'answer', 'sources', and 'confidence'.
    """
    logger.info(f"[{session_id}] Processing: {question[:80]}...")

    llm = _get_llm()
    chat_history = memory_manager.get_history(session_id)

    # ── Step 1: Condense follow-up questions ──────────────────
    standalone_question = question
    if chat_history:
        try:
            condense_chain = CONDENSE_QUESTION_PROMPT | llm | StrOutputParser()
            standalone_question = await condense_chain.ainvoke({
                "chat_history": chat_history,
                "question": question,
            })
            logger.info(f"[{session_id}] Condensed: {standalone_question[:80]}...")
        except Exception as e:
            logger.warning(f"[{session_id}] Condensation failed, using original: {e}")
            standalone_question = question

    # ── Step 2: Retrieve context ──────────────────────────────
    context_parts = []
    all_sources = []
    confidence = 0.0

    # 2a: Check if this is a report data query → use MongoDB tool
    if _is_report_query(standalone_question):
        try:
            mongo_result = query_report_database.invoke(standalone_question)
            context_parts.append(f"[Live Database Results]\n{mongo_result}")
            all_sources.append({"name": "CivicPulse Database (Live)", "category": "database"})
            confidence = 0.9
            logger.info(f"[{session_id}] MongoDB tool returned data.")
        except Exception as e:
            logger.error(f"[{session_id}] MongoDB tool error: {e}")

    # 2b: Always also search vector store for supplementary context
    try:
        # Search both collections
        docs_retriever = get_retriever(config.CHROMA_COLLECTION_DOCS)
        gov_retriever = get_retriever(config.CHROMA_COLLECTION_GOV)

        docs_results = await docs_retriever.ainvoke(standalone_question)
        gov_results = await gov_retriever.ainvoke(standalone_question)

        all_docs = docs_results + gov_results

        if all_docs:
            context_parts.append(_format_docs(all_docs))
            all_sources.extend(_extract_sources(all_docs))

            # Simple confidence based on number of relevant docs
            if not confidence:  # Don't override MongoDB confidence
                confidence = min(0.5 + (len(all_docs) * 0.1), 0.95)

        logger.info(
            f"[{session_id}] Retrieved {len(docs_results)} platform docs, "
            f"{len(gov_results)} gov docs."
        )
    except Exception as e:
        logger.error(f"[{session_id}] Vector retrieval error: {e}")
        if not context_parts:
            context_parts.append(
                "No documents could be retrieved. Please answer based on your "
                "general knowledge and clearly indicate this."
            )

    import json
    
    # ── Step 3: Generate response ─────────────────────────────
    context_str = "\n\n===\n\n".join(context_parts)
    user_context_str = _format_user_context(user_context)

    # ── Deduplicate sources ───────────────────────────────────
    unique_sources = []
    seen_names = set()
    for src in all_sources:
        if src["name"] not in seen_names:
            seen_names.add(src["name"])
            unique_sources.append(src)
            
    # Yield the metadata (sources and confidence) first
    yield json.dumps({
        "type": "meta",
        "sources": unique_sources,
        "confidence": round(confidence, 2)
    })

    full_answer = ""
    try:
        rag_chain = CHAT_PROMPT | llm | StrOutputParser()

        async for chunk in rag_chain.astream({
            "context": context_str,
            "user_context": user_context_str,
            "chat_history": chat_history,
            "question": question,  # Use original question, not condensed
        }):
            full_answer += chunk
            # Yield each text chunk
            yield json.dumps({
                "type": "chunk",
                "content": chunk
            })

        logger.info(f"[{session_id}] Generated response ({len(full_answer)} chars).")
    except Exception as e:
        logger.error(f"[{session_id}] LLM generation error: {e}", exc_info=True)
        error_msg = (
            "I'm sorry, I encountered an error while processing your question. "
            "Please try again in a moment. If the issue persists, you can reach "
            "out to CivicPulse support or use the helpline numbers listed in the app."
        )
        full_answer += error_msg
        yield json.dumps({
            "type": "chunk",
            "content": error_msg
        })

    # ── Step 4: Store in memory ───────────────────────────────
    memory_manager.add_exchange(session_id, question, full_answer)
