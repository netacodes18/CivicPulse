"""
ChromaDB vector store initialization and retrieval.
Manages two collections: platform docs and government schemes.
"""

import logging
from pathlib import Path

import chromadb
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from config import config

logger = logging.getLogger(__name__)


def _get_embedding_function() -> GoogleGenerativeAIEmbeddings:
    """Create Google embedding function for vectorizing documents."""
    return GoogleGenerativeAIEmbeddings(
        model=config.EMBEDDING_MODEL,
        google_api_key=config.GOOGLE_API_KEY,
    )


def _get_chroma_client() -> chromadb.PersistentClient:
    """Create a persistent ChromaDB client."""
    persist_dir = Path(config.CHROMA_PERSIST_DIR)
    persist_dir.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(persist_dir))


def get_vectorstore(collection_name: str | None = None) -> Chroma:
    """
    Get a LangChain Chroma vectorstore instance.

    Args:
        collection_name: ChromaDB collection name. Defaults to docs collection.

    Returns:
        Chroma vectorstore ready for similarity search.
    """
    if collection_name is None:
        collection_name = config.CHROMA_COLLECTION_DOCS

    embedding_fn = _get_embedding_function()

    return Chroma(
        collection_name=collection_name,
        embedding_function=embedding_fn,
        persist_directory=config.CHROMA_PERSIST_DIR,
    )


def get_retriever(collection_name: str | None = None, top_k: int | None = None):
    """
    Get a LangChain retriever from a ChromaDB collection.

    Args:
        collection_name: Which collection to search.
        top_k: Number of results to return. Defaults to config value.

    Returns:
        A LangChain retriever.
    """
    if top_k is None:
        top_k = config.RETRIEVAL_TOP_K

    vectorstore = get_vectorstore(collection_name)

    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": top_k},
    )


def get_multi_collection_retriever(top_k: int | None = None):
    """
    Get retrievers for both document collections.

    Returns:
        Tuple of (docs_retriever, gov_retriever).
    """
    if top_k is None:
        top_k = config.RETRIEVAL_TOP_K

    docs_retriever = get_retriever(config.CHROMA_COLLECTION_DOCS, top_k)
    gov_retriever = get_retriever(config.CHROMA_COLLECTION_GOV, top_k)

    return docs_retriever, gov_retriever


def check_vectorstore_health() -> dict:
    """Check if ChromaDB is accessible and has data."""
    try:
        client = _get_chroma_client()
        collections = client.list_collections()
        collection_info = {}

        for col in collections:
            collection_info[col.name] = col.count()

        return {
            "status": "healthy",
            "collections": collection_info,
            "total_documents": sum(collection_info.values()),
        }
    except Exception as e:
        logger.error(f"ChromaDB health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}
