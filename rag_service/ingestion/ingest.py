"""
Document ingestion pipeline.
Loads knowledge base documents, chunks them, and stores in ChromaDB.
"""

import logging
import sys
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Add parent dir to path so we can import config
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import config
from retrieval.vectorstore import get_vectorstore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def _create_text_splitter() -> RecursiveCharacterTextSplitter:
    """Create a markdown-aware text splitter."""
    return RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        separators=[
            "\n## ",   # Major markdown headings
            "\n### ",  # Sub-headings
            "\n---",   # Horizontal rules
            "\n\n",    # Paragraphs
            "\n",      # Lines
            ". ",      # Sentences
            " ",       # Words
        ],
        length_function=len,
        is_separator_regex=False,
    )


def _load_documents_from_dir(directory: Path, category: str) -> list[Document]:
    """Load all markdown files from a directory with metadata."""
    if not directory.exists():
        logger.warning(f"Directory {directory} does not exist. Skipping.")
        return []

    documents = []
    md_files = list(directory.glob("**/*.md"))

    if not md_files:
        logger.warning(f"No .md files found in {directory}.")
        return []

    for file_path in md_files:
        try:
            loader = TextLoader(str(file_path), encoding="utf-8")
            docs = loader.load()

            # Enrich metadata
            for doc in docs:
                doc.metadata.update({
                    "source": file_path.name,
                    "category": category,
                    "file_path": str(file_path),
                })

            documents.extend(docs)
            logger.info(f"  ✓ Loaded: {file_path.name} ({len(docs)} doc(s))")

        except Exception as e:
            logger.error(f"  ✗ Failed to load {file_path.name}: {e}")

    return documents


def _chunk_documents(
    documents: list[Document],
    splitter: RecursiveCharacterTextSplitter,
) -> list[Document]:
    """Split documents into chunks while preserving metadata."""
    chunks = splitter.split_documents(documents)

    # Add chunk index to metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i

    return chunks


def ingest_all(dry_run: bool = False) -> dict:
    """
    Run the full ingestion pipeline.

    1. Load all documents from the knowledge base.
    2. Chunk them using the configured splitter.
    3. Store in ChromaDB collections.

    Args:
        dry_run: If True, only load and chunk but don't store.

    Returns:
        Statistics about the ingestion.
    """
    logger.info("=" * 60)
    logger.info("🚀 Starting CivicPulse RAG Ingestion Pipeline")
    logger.info("=" * 60)

    splitter = _create_text_splitter()
    stats = {
        "platform_docs": 0,
        "platform_chunks": 0,
        "gov_docs": 0,
        "gov_chunks": 0,
        "total_chunks": 0,
    }

    # ── Load Platform Docs ────────────────────────────────────
    logger.info("\n📄 Loading Platform Documentation...")
    platform_docs = _load_documents_from_dir(config.PLATFORM_DOCS_DIR, "platform")
    platform_chunks = _chunk_documents(platform_docs, splitter)
    stats["platform_docs"] = len(platform_docs)
    stats["platform_chunks"] = len(platform_chunks)
    logger.info(f"   → {len(platform_docs)} docs → {len(platform_chunks)} chunks")

    # ── Load Government Docs ──────────────────────────────────
    logger.info("\n📋 Loading Government Schemes & Civic Rights...")
    gov_docs = _load_documents_from_dir(config.GOV_DOCS_DIR, "government")
    gov_chunks = _chunk_documents(gov_docs, splitter)
    stats["gov_docs"] = len(gov_docs)
    stats["gov_chunks"] = len(gov_chunks)
    logger.info(f"   → {len(gov_docs)} docs → {len(gov_chunks)} chunks")

    stats["total_chunks"] = stats["platform_chunks"] + stats["gov_chunks"]

    if dry_run:
        logger.info("\n🔍 DRY RUN — no data was stored.")
        logger.info(f"   Total: {stats['total_chunks']} chunks would be ingested.")
        return stats

    # ── Store in ChromaDB ─────────────────────────────────────
    if platform_chunks:
        logger.info(f"\n💾 Storing {len(platform_chunks)} platform chunks in ChromaDB...")
        platform_store = get_vectorstore(config.CHROMA_COLLECTION_DOCS)
        # Clear existing data for idempotent ingestion
        try:
            platform_store.delete_collection()
            platform_store = get_vectorstore(config.CHROMA_COLLECTION_DOCS)
        except Exception:
            pass  # Collection might not exist yet
        platform_store.add_documents(platform_chunks)
        logger.info(f"   ✓ Stored in collection: {config.CHROMA_COLLECTION_DOCS}")

    if gov_chunks:
        logger.info(f"\n💾 Storing {len(gov_chunks)} government chunks in ChromaDB...")
        gov_store = get_vectorstore(config.CHROMA_COLLECTION_GOV)
        try:
            gov_store.delete_collection()
            gov_store = get_vectorstore(config.CHROMA_COLLECTION_GOV)
        except Exception:
            pass
        gov_store.add_documents(gov_chunks)
        logger.info(f"   ✓ Stored in collection: {config.CHROMA_COLLECTION_GOV}")

    logger.info("\n" + "=" * 60)
    logger.info("✅ Ingestion Complete!")
    logger.info(f"   Platform: {stats['platform_docs']} docs → {stats['platform_chunks']} chunks")
    logger.info(f"   Government: {stats['gov_docs']} docs → {stats['gov_chunks']} chunks")
    logger.info(f"   Total: {stats['total_chunks']} chunks")
    logger.info("=" * 60)

    return stats


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="CivicPulse RAG Ingestion Pipeline")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only load and chunk documents without storing.",
    )
    args = parser.parse_args()

    ingest_all(dry_run=args.dry_run)
