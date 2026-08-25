"""
CivicPulse RAG Service — FastAPI Entry Point.
A production-grade RAG-powered civic helpdesk chatbot service.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import config
from routers.chat import router as chat_router
from routers.ai import router as ai_router
from retrieval.vectorstore import check_vectorstore_health
from retrieval.mongo_tool import check_mongo_health
from memory.conversation import memory_manager

# ── Logging Setup ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (Startup / Shutdown) ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # ── Startup ───────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("🚀 CivicPulse RAG Service Starting...")
    logger.info("=" * 60)

    # Validate configuration
    config_errors = config.validate()
    if config_errors:
        for error in config_errors:
            logger.warning(f"⚠️  Config: {error}")
    else:
        logger.info("✅ Configuration validated successfully.")

    # Check ChromaDB
    chroma_health = check_vectorstore_health()
    if chroma_health["status"] == "healthy":
        logger.info(
            f"✅ ChromaDB: {chroma_health['total_documents']} documents across "
            f"{len(chroma_health['collections'])} collections."
        )
    else:
        logger.warning(
            f"⚠️  ChromaDB: {chroma_health.get('error', 'No data ingested yet.')}"
        )

    # Check MongoDB
    mongo_health = check_mongo_health()
    if mongo_health["status"] == "healthy":
        logger.info(
            f"✅ MongoDB: Connected to '{mongo_health['database']}' "
            f"({mongo_health['report_count']} reports)."
        )
    else:
        logger.warning(f"⚠️  MongoDB: {mongo_health.get('error', 'Not configured.')}")

    logger.info(f"✅ LLM: {config.LLM_MODEL} (temp={config.LLM_TEMPERATURE})")
    logger.info(f"✅ Embeddings: {config.EMBEDDING_MODEL}")
    logger.info(f"✅ Serving on: http://{config.HOST}:{config.PORT}")
    logger.info("=" * 60)

    yield  # Application runs here

    # ── Shutdown ──────────────────────────────────────────────
    logger.info("🛑 CivicPulse RAG Service shutting down...")


# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="CivicPulse RAG Service",
    description=(
        "A RAG-powered civic helpdesk chatbot for the CivicPulse platform. "
        "Answers questions about platform features, government schemes, "
        "citizen rights, and live report statistics."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:4173",
        "http://localhost:3000",
        "https://civic-pulse-steel.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(chat_router, tags=["Chat"])
app.include_router(ai_router, tags=["AI"], prefix="/ai")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns status of all service components: LLM, ChromaDB, MongoDB.
    """
    chroma = check_vectorstore_health()
    mongo = check_mongo_health()

    overall_status = "healthy"
    if chroma["status"] != "healthy":
        overall_status = "degraded"
    if mongo["status"] != "healthy":
        overall_status = "degraded"

    return {
        "status": overall_status,
        "service": "CivicPulse RAG Service",
        "version": "1.0.0",
        "components": {
            "llm": {
                "model": config.LLM_MODEL,
                "status": "configured" if config.GROQ_API_KEY else "not_configured",
            },
            "chromadb": chroma,
            "mongodb": mongo,
            "memory": {
                "active_sessions": memory_manager.get_active_sessions_count(),
            },
        },
    }

@app.get("/")
@app.head("/")
async def root():
    """
    Root endpoint for basic health checks (e.g., Render port checker).
    """
    return {"message": "CivicPulse RAG Service is running. Visit /health for details."}


@app.get("/debug/test-llm")
async def debug_test_llm():
    """Diagnostic: test if the LLM can generate a response."""
    import traceback
    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage

        llm = ChatGroq(
            model=config.LLM_MODEL,
            api_key=config.GROQ_API_KEY,
            temperature=0.3,
            max_tokens=100,
        )
        result = await llm.ainvoke([HumanMessage(content="Say hello in one sentence.")])
        return {
            "status": "success",
            "response": result.content,
            "model": config.LLM_MODEL,
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "model": config.LLM_MODEL,
            "api_key_set": bool(config.GROQ_API_KEY),
            "api_key_prefix": config.GROQ_API_KEY[:8] + "..." if config.GROQ_API_KEY else "NOT SET",
        }


# ── Run with Uvicorn ──────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
        log_level="info",
    )
