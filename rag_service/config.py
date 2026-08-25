"""
Configuration module for the RAG service.
Loads environment variables and provides typed configuration objects.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from the rag_service directory
_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)


class Config:
    """Central configuration for the RAG service."""

    # ── LLM (Groq) & Embeddings (Google) ──────────────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen/qwen3.6-27b")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.3"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))

    # ── MongoDB ────────────────────────────────────────────────
    MONGO_URI: str = os.getenv("MONGO_URI", "")

    # ── ChromaDB ───────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = os.getenv(
        "CHROMA_PERSIST_DIR",
        str(Path(__file__).parent / "chroma_db"),
    )
    CHROMA_COLLECTION_DOCS: str = os.getenv("CHROMA_COLLECTION_DOCS", "civicpulse_docs")
    CHROMA_COLLECTION_GOV: str = os.getenv("CHROMA_COLLECTION_GOV", "gov_schemes")

    # ── Retrieval ──────────────────────────────────────────────
    RETRIEVAL_TOP_K: int = int(os.getenv("RETRIEVAL_TOP_K", "4"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "800"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # ── Server ─────────────────────────────────────────────────
    HOST: str = os.getenv("RAG_SERVICE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("RAG_SERVICE_PORT", "8000"))

    # ── Rate Limiting ──────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))

    # ── Web Search Grounding ──────────────────────────────
    WEB_SEARCH_ENABLED: bool = os.getenv("WEB_SEARCH_ENABLED", "true").lower() == "true"

    # ── Paths ──────────────────────────────────────────────────
    BASE_DIR: Path = Path(__file__).parent
    KNOWLEDGE_BASE_DIR: Path = BASE_DIR / "knowledge_base"
    PLATFORM_DOCS_DIR: Path = KNOWLEDGE_BASE_DIR / "platform"
    GOV_DOCS_DIR: Path = KNOWLEDGE_BASE_DIR / "government"

    @classmethod
    def validate(cls) -> list[str]:
        """Validate required configuration. Returns list of errors."""
        errors = []
        if not cls.GROQ_API_KEY or cls.GROQ_API_KEY == "your_groq_api_key_here":
            errors.append("GROQ_API_KEY is not set. Get one at https://console.groq.com/keys")
        if not cls.GOOGLE_API_KEY or cls.GOOGLE_API_KEY == "your_google_api_key_here":
            errors.append("GOOGLE_API_KEY is not set. Get one at https://aistudio.google.com")
        if not cls.MONGO_URI:
            errors.append("MONGO_URI is not set. Copy from CivicPulse backend/.env")
        return errors


config = Config()
