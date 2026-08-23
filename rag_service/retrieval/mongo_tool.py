"""
MongoDB live-query tool for real-time report statistics.
Used by the RAG chain to answer questions about CivicPulse report data.
"""

import logging
from typing import Optional

from langchain_core.tools import tool
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

from config import config

logger = logging.getLogger(__name__)

# Module-level MongoDB client (lazy initialization)
_mongo_client: Optional[MongoClient] = None
_db = None


def _get_db():
    """Get MongoDB database connection (lazy singleton)."""
    global _mongo_client, _db

    if _db is not None:
        return _db

    if not config.MONGO_URI:
        logger.warning("MONGO_URI not configured — MongoDB tool disabled.")
        return None

    try:
        _mongo_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
        # Ping to verify connection
        _mongo_client.admin.command("ping")
        # Extract database name from URI or default
        _db = _mongo_client.get_default_database()
        if _db is None:
            _db = _mongo_client["civicpulse"]
        logger.info(f"Connected to MongoDB database: {_db.name}")
        return _db
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return None


def _get_report_stats(state: str = None, area: str = None) -> dict:
    """Get aggregated report statistics, optionally filtered by state/area."""
    db = _get_db()
    if db is None:
        return {"error": "MongoDB is not available."}

    try:
        match_filter = {}
        if state:
            match_filter["state"] = {"$regex": state, "$options": "i"}
        if area:
            match_filter["area"] = {"$regex": area, "$options": "i"}

        pipeline = [
            {"$match": match_filter} if match_filter else {"$match": {}},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "pending": {
                        "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                    },
                    "in_progress": {
                        "$sum": {"$cond": [{"$eq": ["$status", "in-progress"]}, 1, 0]}
                    },
                    "resolved": {
                        "$sum": {"$cond": [{"$eq": ["$status", "resolved"]}, 1, 0]}
                    },
                },
            },
        ]

        results = list(db.reports.aggregate(pipeline))

        if not results:
            return {
                "total": 0,
                "pending": 0,
                "in_progress": 0,
                "resolved": 0,
                "filter": match_filter or "none",
            }

        stats = results[0]
        stats.pop("_id", None)
        stats["filter"] = match_filter or "none"

        # Calculate resolution rate
        if stats["total"] > 0:
            stats["resolution_rate"] = f"{(stats['resolved'] / stats['total']) * 100:.1f}%"
        else:
            stats["resolution_rate"] = "N/A"

        return stats

    except OperationFailure as e:
        logger.error(f"MongoDB aggregation failed: {e}")
        return {"error": f"Query failed: {str(e)}"}


def _get_recent_reports(limit: int = 5, state: str = None) -> list[dict]:
    """Get the most recent reports."""
    db = _get_db()
    if db is None:
        return [{"error": "MongoDB is not available."}]

    try:
        query_filter = {}
        if state:
            query_filter["state"] = {"$regex": state, "$options": "i"}

        reports = list(
            db.reports.find(query_filter, {
                "_id": 0,
                "title": 1,
                "category": 1,
                "status": 1,
                "state": 1,
                "area": 1,
                "createdAt": 1,
            })
            .sort("createdAt", -1)
            .limit(limit)
        )

        # Convert datetime objects to strings
        for report in reports:
            if "createdAt" in report:
                report["createdAt"] = str(report["createdAt"])

        return reports

    except OperationFailure as e:
        logger.error(f"MongoDB query failed: {e}")
        return [{"error": f"Query failed: {str(e)}"}]


def _get_category_breakdown(state: str = None) -> list[dict]:
    """Get report counts by category."""
    db = _get_db()
    if db is None:
        return [{"error": "MongoDB is not available."}]

    try:
        match_filter = {}
        if state:
            match_filter["state"] = {"$regex": state, "$options": "i"}

        pipeline = [
            {"$match": match_filter} if match_filter else {"$match": {}},
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"count": -1}},
        ]

        results = list(db.reports.aggregate(pipeline))
        return [{"category": r["_id"] or "uncategorized", "count": r["count"]} for r in results]

    except OperationFailure as e:
        logger.error(f"MongoDB aggregation failed: {e}")
        return [{"error": f"Query failed: {str(e)}"}]


@tool
def query_report_database(question: str) -> str:
    """Query the CivicPulse report database for live statistics and data.

    Use this tool to answer questions about:
    - Number of reports (total, pending, in-progress, resolved)
    - Reports filtered by state or area
    - Recent reports
    - Category breakdown
    - Resolution rates

    Args:
        question: Natural language question about report data.

    Returns:
        A formatted string with the query results.
    """
    question_lower = question.lower()

    # Extract state/area from question if mentioned
    state = None
    area = None

    # Simple keyword extraction for state/area filtering
    # In production, you'd use NER or a more sophisticated approach
    indian_states = [
        "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
        "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
        "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
        "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
        "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
        "delhi", "jammu and kashmir", "ladakh",
    ]

    for s in indian_states:
        if s in question_lower:
            state = s
            break

    # Determine what kind of query the user is asking
    if any(kw in question_lower for kw in ["recent", "latest", "new", "last"]):
        reports = _get_recent_reports(limit=5, state=state)
        if reports and "error" not in reports[0]:
            result = f"**Recent Reports{f' in {state.title()}' if state else ''}:**\n\n"
            for i, r in enumerate(reports, 1):
                result += (
                    f"{i}. **{r.get('title', 'Untitled')}**\n"
                    f"   - Category: {r.get('category', 'N/A')}\n"
                    f"   - Status: {r.get('status', 'N/A')}\n"
                    f"   - Area: {r.get('area', 'N/A')}, {r.get('state', 'N/A')}\n"
                    f"   - Date: {r.get('createdAt', 'N/A')}\n\n"
                )
            return result
        return "No recent reports found." if not reports else reports[0].get("error", "Unknown error")

    elif any(kw in question_lower for kw in ["category", "categories", "breakdown", "type"]):
        breakdown = _get_category_breakdown(state=state)
        if breakdown and "error" not in breakdown[0]:
            result = f"**Category Breakdown{f' in {state.title()}' if state else ''}:**\n\n"
            for item in breakdown:
                result += f"- **{item['category'].title()}**: {item['count']} reports\n"
            return result
        return "No category data found."

    else:
        # Default: return overall statistics
        stats = _get_report_stats(state=state, area=area)
        if "error" in stats:
            return f"Error querying database: {stats['error']}"

        filter_desc = ""
        if state:
            filter_desc = f" in {state.title()}"

        return (
            f"**Report Statistics{filter_desc}:**\n\n"
            f"- **Total Reports**: {stats['total']}\n"
            f"- **Pending**: {stats['pending']}\n"
            f"- **In Progress**: {stats['in_progress']}\n"
            f"- **Resolved**: {stats['resolved']}\n"
            f"- **Resolution Rate**: {stats['resolution_rate']}\n"
        )


def check_mongo_health() -> dict:
    """Check MongoDB connectivity."""
    db = _get_db()
    if db is None:
        return {"status": "unavailable", "error": "Not configured or connection failed"}

    try:
        _mongo_client.admin.command("ping")
        report_count = db.reports.count_documents({})
        return {
            "status": "healthy",
            "database": db.name,
            "report_count": report_count,
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
