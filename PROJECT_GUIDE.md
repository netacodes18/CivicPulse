# CivicPulse RAG Assistant - Project Guide & Interview Cheat Sheet

This document is a comprehensive, deep-dive guide into the **CivicPulse Agent-based RAG Chatbot**. It explains the architecture, implementation details, dependencies, request flows, and provides a question bank to help you defend this project in a senior software engineering or architecture interview. 

> **Important**: This guide is based *strictly* on the actual codebase implementation. Where applicable, future scalability improvements are clearly marked as "Interview Improvement".

---

## 1. The Big Picture

### What the project does
CivicPulse is a crowdsourced municipal issue tracking system. The chatbot embedded within it (CivicPulse Assistant) serves as an AI-powered helpdesk for Indian citizens. It answers questions about:
1. The CivicPulse platform itself (how to report, upvote, track).
2. Government schemes and citizen rights (PM Awas Yojana, RTI, etc.).
3. Live report statistics (pending reports, resolution rates in specific states/areas).

### What problem it solves
Citizens often struggle to navigate government services or understand civic processes. A standard FAQ is insufficient, and a standard LLM hallucinates live data. By using RAG (Retrieval-Augmented Generation) combined with live database tool-calling, this chatbot provides highly contextual, accurate, and real-time civic information in both English and Hindi.

### What makes it an **Agent-based RAG Chatbot**
- **Normal LLM Chatbot**: Predicts text based on static training data (hallucinates stats, outdated info).
- **Standard RAG**: Retrieves static documents from a Vector DB and answers based *only* on that text.
- **Agentic RAG (This Project)**: The application logic routes the user's query dynamically. In `rag_chain.py`, the system actively decides whether the user is asking for live data (using keyword matching like "how many reports", "resolution rate") and executes a specific tool (`query_report_database` from `mongo_tool.py`) to fetch live MongoDB aggregations, while simultaneously doing semantic search in a Vector DB (Chroma) for static knowledge. The LLM then synthesizes both data sources.

### Technology Stack
- **Frontend**: React (Vite) with Context API for state management (`AuthContext`).
- **Backend (Express)**: Node.js/Express acting as an API Gateway and Proxy for the chat interface. Handles authentication via JWTs.
- **RAG Service (FastAPI)**: Python backend running the actual AI pipeline.
- **LLM**: Google Gemini 3.6 Flash (via `langchain-google-genai`).
- **Vector Database**: ChromaDB (stores platform docs and gov schemes).
- **Database**: MongoDB (stores the actual civic issues/reports).
- **Streaming**: Server-Sent Events (SSE) for real-time LLM typing effect.

### High-Level Architecture Diagram
```text
User
  ↓  (React / ChatWidget.jsx)
Frontend
  ↓  (POST /api/chat - JSON + JWT)
Express Backend Proxy (chatRoutes.js)
  ↓  (POST /chat - forwards request + user context)
FastAPI RAG Service (main.py -> chat.py)
  ↓  (rag_chain.py)
  ├───── [If Report Query] ──────> MongoDB Aggregation (mongo_tool.py)
  │                                      ↓ (Live Stats)
  └───── [Semantic Search] ──────> ChromaDB Vector Store (vectorstore.py)
                                         ↓ (Static Documents)
                                  Context Assembly
                                         ↓
                                   Gemini 3.6 LLM
                                         ↓ (SSE Stream)
                               Frontend UI (Markdown rendering)
```

---

## 2. Complete Folder Structure

```text
CivicPulse/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatWidget.jsx      # The React UI for the chatbot
│   │   ├── api/
│   │   │   └── axios.js            # Axios interceptors for auth
│   │   └── context/
│   │       └── AuthContext.jsx     # Provides user state globally
├── backend/
│   ├── routes/
│   │   └── chatRoutes.js           # Express proxy to FastAPI
│   ├── server.js                   # Express initialization
│   ├── .env                        # Express environment variables
│   └── render.yaml                 # Deployment config
└── rag_service/
    ├── main.py                     # FastAPI entry point
    ├── config.py                   # Environment variable loading
    ├── routers/
    │   └── chat.py                 # FastAPI endpoints (/chat, /chat/reset)
    ├── chains/
    │   ├── rag_chain.py            # Core RAG orchestration and LLM logic
    │   └── prompts.py              # System and condensation prompts
    ├── retrieval/
    │   ├── mongo_tool.py           # MongoDB live-query tool
    │   └── vectorstore.py          # ChromaDB retriever setup
    ├── memory/
    │   └── conversation.py         # In-memory session history
    └── requirements.txt            # Python dependencies
```

---

## 3. Explain EVERY File

### `frontend/src/components/ChatWidget.jsx`
**Purpose**: The client-side interface for the chatbot.
**Imports**: `AuthContext` (for user data), `api` (Axios), `lucide-react` (icons), `react-markdown` (rendering LLM output).
**State**: `isOpen`, `messages`, `input`, `isLoading`, `showScrollBtn`.
**Key Functions**:
- `sendMessage()`: Creates a user message, sends it to the backend, and handles the streaming response. Contains an auto-retry loop (1 retry).
- `_doStream()`: Uses native `fetch` and `response.body.getReader()` to process Server-Sent Events (SSE). It parses `data.type === "chunk"` for streaming text and `data.type === "meta"` for sources.
- **Why fetch instead of Axios?**: Axios does not support native readable streams for SSE easily.

### `backend/routes/chatRoutes.js`
**Purpose**: An API Gateway proxy. It authenticates the user via JWT (middleware in `server.js`) and proxies the request to the Python RAG service.
**Key Variables**: `RAG_SERVICE_URL`, `KEEPALIVE_INTERVAL_MS` (15s), `UPSTREAM_TIMEOUT_MS` (120s).
**Key Functions**:
- `router.post("/")`: Extracts user info from the JWT (`req.user`), builds a `userContext` object (state, area, role, username), and `fetch`es the RAG service.
- **Keepalive logic**: Uses `setInterval` to send `:keepalive\n\n` comments over SSE. This prevents browser timeouts if the LLM takes a long time to start generating.
- **Error Handling**: Catches 504 Timeouts and 503 Unavailable if the Python service is down.

### `rag_service/main.py`
**Purpose**: The FastAPI application setup.
**Key Functions**:
- `app.include_router(chat.router)`: Mounts the chat endpoints.
- `root()`: A dummy `GET /` and `HEAD /` endpoint used by Render's health checker to verify the container is alive.
- `debug_test_llm()`: A diagnostic endpoint to explicitly test the `ChatGoogleGenerativeAI` connection independently of the RAG chain.

### `rag_service/config.py`
**Purpose**: Centralized configuration management. Loads `.env` variables via `os.getenv`.
**Variables**: `LLM_MODEL` (gemini-3.6-flash), `GOOGLE_API_KEY`, `MONGO_URI`, `CHROMA_COLLECTION_DOCS`.

### `rag_service/routers/chat.py`
**Purpose**: FastAPI route definitions.
**Key Classes**: Pydantic models (`ChatRequest`, `ChatResponse`) for input validation and swagger docs.
**Key Functions**:
- `chat()`: The main POST endpoint. Implements a simple in-memory rate limiter (`_check_rate_limit`) — 60 requests per minute per session. Calls `process_chat` from `rag_chain.py` and yields the results as an SSE stream (`StreamingResponse`).

### `rag_service/chains/rag_chain.py`
**Purpose**: The brain of the chatbot. Orchestrates retrieval, memory, tool calling, and LLM generation.
**Key Functions**:
- `_is_report_query(question)`: A keyword-based heuristic to determine if the user wants live stats (e.g., "pending reports", "resolution rate").
- `process_chat()`: 
  1. Fetches chat history.
  2. Condenses follow-up questions using `CONDENSE_QUESTION_PROMPT`.
  3. Checks `_is_report_query()`. If true, invokes `query_report_database` (the Mongo tool).
  4. Always queries ChromaDB (`get_retriever`).
  5. Assembles context and user context.
  6. Streams the final output using `rag_chain.astream()`.

### `rag_service/chains/prompts.py`
**Purpose**: Defines LangChain `ChatPromptTemplate`s.
**Variables**: 
- `SYSTEM_PROMPT`: Instructions for the LLM. It enforces scope (only answer civic queries), tone (empathetic, actionable), and formatting (markdown). It uses `{context}`, `{user_context}`, and `{chat_history}` variables.
- `CONDENSE_QUESTION_PROMPT`: Prompts the LLM to rewrite contextual questions (e.g., "What about in my state?") into standalone questions (e.g., "What are the pending reports in Maharashtra?") for accurate semantic retrieval.

### `rag_service/retrieval/mongo_tool.py`
**Purpose**: Connects to the primary MongoDB database to run live aggregations.
**Key Functions**:
- `_get_db()`: Implements a lazy singleton connection pattern using PyMongo.
- `_get_report_stats()`, `_get_recent_reports()`, `_get_category_breakdown()`: Executes complex MongoDB aggregation pipelines (`$group`, `$sum`, `$cond`, `$match`).
- `query_report_database(question)`: Decorated with `@tool`. Parses the natural language question, extracts Indian state names via naive substring matching, routes to the correct aggregation function, and formats the JSON into a Markdown string for the LLM.

### `rag_service/memory/conversation.py`
**Purpose**: Basic in-memory dictionary tracking session history.
*Note: This needs verification if the project is scaled, as an in-memory dict does not persist across server restarts.*

---

## 4. Explain the Complete RAG Pipeline

**Document Ingestion**:
*(Note: The ingestion script is in `rag_service/ingestion/`, but the specifics of chunk size/splitter require verification from that implementation).* 
Conceptually: Documents -> Langchain Splitter (e.g. RecursiveCharacterTextSplitter) -> Gemini Embeddings (`models/text-embedding-004`) -> ChromaDB.

**Retrieval Flow**:
1. `ChatWidget.jsx` sends query.
2. `rag_chain.py` -> `process_chat` condenses the question.
3. `vectorstore.py` -> `get_retriever(collection).ainvoke(question)` is called.
4. The question is passed to Google GenAI Embeddings, converted to a vector.
5. ChromaDB performs Cosine Similarity search.
6. The `Top-K` `Document` objects are returned.
7. `_format_docs()` converts them to a string.
8. LLM reads the context and generates the response.

---

## 5. Explain Embeddings (Interview & Tech Level)

**Interview Level**: "An embedding is a way to turn words and concepts into a list of numbers (a vector). If two pieces of text mean the same thing, their number lists will be very similar. Our database stores these lists, so when a user asks a question, we turn it into numbers and find the most mathematically similar documents."

**Technical Level**: We use Google's `models/text-embedding-004`. It maps high-dimensional semantic meaning into a dense vector space. When querying, we use Cosine Similarity in ChromaDB to calculate the dot product between the normalized query vector and document vectors to find the nearest neighbors in high-dimensional space.

---

## 6. Explain the AGENT

**Why is this an Agent and not just RAG?**
A standard RAG pipeline is static: Query -> VectorDB -> LLM. 
Our architecture exhibits **Agentic Routing**:
1. The system analyzes the query intent (`_is_report_query()`).
2. It dynamically decides to invoke a specialized tool (`query_report_database`).
3. The tool executes live code (MongoDB aggregations) against an operational database, bypassing semantic search for that specific logic.
4. The LLM acts as the reasoning engine to synthesize the hard data returned by the tool with the semantic knowledge returned by the Vector DB.

*(Note: Currently, tool selection relies on a deterministic keyword heuristic rather than LLM native tool-calling (ReAct).)*

---

## 7. Explain LLM Interaction

- **Provider**: Google (Gemini)
- **Model**: `gemini-3.6-flash` (updated from deprecated 1.5/2.0 versions)
- **API**: `langchain-google-genai`
- **Config**: Temperature = 0.3 (keeps answers factual and deterministic). Max Tokens = 2048.
- **Prompt Construction**:
```text
System Prompt (Instructions + Rules)
+ User Context (State, Area, Username from JWT)
+ Retrieved Context (ChromaDB + MongoDB stringified)
+ Chat History
+ User Query
```

---

## 8. Complete End-to-End Request Flow

*User asks: "How many pending reports are in Maharashtra?"*

1. **Frontend**: User types in `ChatWidget.jsx`. `sendMessage()` fires.
2. **Frontend**: A `fetch` POST request with JWT is sent to `/api/chat`.
3. **Backend Proxy**: `chatRoutes.js` verifies JWT, extracts "Maharashtra", and proxies to FastAPI `/chat`. It starts a keepalive SSE stream.
4. **FastAPI**: `chat.py` receives request, checks rate limit (60/min).
5. **RAG Chain**: `process_chat()` executes.
6. **Condensation**: No history exists, query remains the same.
7. **Agent Routing**: `_is_report_query` detects "pending reports".
8. **Tool Execution**: `mongo_tool.py` is invoked. It extracts "Maharashtra". Runs an aggregation pipeline on the `reports` collection.
9. **Vector Search**: Simultaneously, ChromaDB is queried for documents.
10. **Prompt Assembly**: The MongoDB result + ChromaDB docs + user context are formatted into a string.
11. **LLM Invocation**: `rag_chain.astream()` streams chunks from Gemini.
12. **Streaming**: FastAPI yields `data: {"type": "chunk", "content": "..."}`.
13. **Frontend Rendering**: `ChatWidget.jsx` parses the SSE stream and updates the React state, rendering via `react-markdown`.

---

## 9. Weaknesses, Improvements, and Scalability

**Be Brutally Honest - Current Limitations**:
1. **In-Memory History**: `conversation.py` uses a Python dictionary. If the RAG service crashes or scales to multiple instances, users lose their chat history.
   *Improvement*: Move session history to Redis.
2. **Deterministic Tool Routing**: `_is_report_query` relies on hardcoded keywords ("how many", "resolution rate"). It's brittle.
   *Improvement*: Use Gemini's native Function Calling (`bind_tools`) to let the LLM decide when to query MongoDB.
3. **Naive State Extraction**: The mongo tool uses simple string matching (`if "maharashtra" in query`) to build database filters.
   *Improvement*: Use LangChain's `create_structured_output` to extract precise metadata for filtering.
4. **Proxy Overhead**: The Node.js proxy adds latency and complex SSE error handling.
   *Improvement*: Allow the frontend to connect directly to FastAPI, handling auth via a shared JWT secret.

**Scaling from 10 to 100,000 users**:
- **Current**: Single FastAPI instance on Render Free Tier.
- **At Scale**: 
  1. Horizontal scaling of FastAPI containers via Load Balancer.
  2. Redis for rate limiting (currently in-memory) and session history.
  3. Migrate ChromaDB to a managed vector store (Pinecone / MongoDB Atlas Vector Search) as local file-based Chroma doesn't scale across multiple containers.
  4. Implement semantic caching (RedisVL) to avoid calling Gemini for repeated questions.

---

## 10. Interview Question Bank

### Q: Why did you use RAG instead of fine-tuning the model?
**A**: Fine-tuning teaches a model the *style* of answering, but it does not give it factual recall of dynamic data. CivicPulse deals with real-time civic issues and frequently changing government policies. Fine-tuning would require retraining the model every time a citizen files a new report. RAG allows us to separate the reasoning engine (Gemini) from the factual data (Chroma/Mongo).

### Q: Why did you build an Express backend if you already have a FastAPI backend?
**A**: Express serves as the primary API for the entire CivicPulse platform (handling user auth, report creation, etc.). Instead of exposing the Python microservice directly to the frontend and duplicating JWT validation logic, Express acts as an API Gateway. It authenticates the request, enriches it with the user's location profile, and securely proxies it to FastAPI via backend-to-backend communication.

### Q: What happens if the LLM takes 30 seconds to respond? Does the browser timeout?
**A**: Yes, standard HTTP requests time out. I solved this in `chatRoutes.js` by immediately returning HTTP 200 with headers `Content-Type: text/event-stream`. Then, I use a `setInterval` to send an SSE comment (`:keepalive\n\n`) every 15 seconds. Browsers ignore SSE comments, but it keeps the TCP connection alive while we wait for the upstream Python service to complete its vector search and LLM invocation.

### Q: How does your agent interact with the live database?
**A**: Inside `rag_chain.py`, I implemented a routing mechanism. If the user's query contains statistical keywords, it triggers a custom Langchain `@tool` in `mongo_tool.py`. This tool dynamically constructs a PyMongo aggregation pipeline (using `$match` for state filtering and `$group`/`$cond` for status counts). The JSON output is formatted into a markdown string and injected directly into the LLM's context window alongside the static vector DB results.

---

## 11. "Why This Technology?" Cheat Sheet

| Technology | Why I used it | Alternative | Why not alternative |
| ---------- | ------------- | ----------- | ------------------- |
| **FastAPI** | Async streaming, built-in Pydantic validation, Python ecosystem for AI. | Flask | Flask's async support (WSGI vs ASGI) is inferior for streaming LLM tokens. |
| **Gemini 3.6 Flash** | extremely fast token generation, cheap, 1M context window. | OpenAI GPT-4o | Too expensive for a free civic project; higher latency. |
| **ChromaDB** | Open-source, easy to embed locally without infrastructure overhead. | Pinecone | Adds a third-party dependency/cost. (Though needed for scale). |
| **SSE (Server-Sent Events)** | Unidirectional streaming of text chunks to UI. | WebSockets | Overkill. Chat generation is unidirectional (Server -> Client). |

---

## 12. One-Page Cheat Sheet

- **Purpose**: AI Helpdesk for citizens combining static Gov docs with real-time civic report stats.
- **Tech Stack**: React -> Express Proxy -> FastAPI -> Gemini 3.6 Flash + Chroma + MongoDB.
- **Architecture Flow**: React SSE Fetch -> Express Auth & Proxy -> FastAPI Rate Limiting -> Condense Question -> Agent Routing -> Vector/Mongo Query -> Prompt Assembly -> LLM Stream -> UI Markdown render.
- **Important Files**: 
  - `rag_chain.py`: Orchestration & Agent routing.
  - `mongo_tool.py`: MongoDB aggregations (`$group`, `$match`).
  - `chatRoutes.js`: Auth + SSE Keepalive proxy.
  - `ChatWidget.jsx`: Native fetch SSE parser + auto-retry.
- **Biggest Challenge**: Managing SSE timeouts through an Express proxy. Solved via keepalive pings.
- **Biggest Decision**: Separating static document retrieval (Chroma) from live quantitative data retrieval (MongoDB aggregation tool).
- **Future Improvement**: Replace keyword-based agent routing with native LLM Function Calling (`bind_tools`), and replace in-memory session history with Redis.
