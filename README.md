# RAG Chatbot Application

## Project Overview
This project is a full-stack **Retrieval-Augmented Generation (RAG) Chatbot** application. It serves as an intelligent conversational interface capable of ingesting documents, storing their semantic meaning in a vector database, and retrieving relevant context to answer user queries using Large Language Models (LLMs). The application is fully containerized, ensuring consistent environments for development and deployment.

## Key Features
-   **User Authentication**: Secure login and signup flows.
-   **Document Ingestion**: Capability to process and index text documents.
-   **Semantic Search**: Retrieving relevant information based on meaning rather than keywords.
-   **Interactive Chat**: Real-time conversational interface with context-awareness.
-   **Hybrid Model Support**: Configured to work with cloud providers (via OpenRouter/OpenAI) and local models (via Ollama).

## Technology Stack
-   **Frontend**: Angular v16 with PrimeNG and Material Design.
-   **Backend**: FastAPI (Python) with SQLAlchemy and Pydantic.
-   **Database**: PostgreSQL (Relational) and ChromaDB (Vector).
-   **AI/LLM**: LangChain, OpenAI/OpenRouter, Ollama.
-   **Infrastructure**: Docker & Docker Compose.

---

## Prerequisites
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
-   `git` (optional, for cloning).

## How to Run (Terminal)

1.  **Open your Terminal**.
2.  **Navigate** to the project directory:
    ```bash
    cd /path/to/works/ChatBot
    ```
3.  **Configure Environment Variables**:
    Copy the example environment file and update it with your actual keys (especially `OPENROUTER_API_KEY`):
    ```bash
    cp .env.example .env
    # Edit .env and set your secrets
    ```
4.  **Start the Application** using Docker Compose:
    ```bash
    # Build and start in detached mode (background)
    docker compose up --build -d
    ```
5.  **View Logs** (optional, to check if everything started):
    ```bash
    docker compose logs -f
    ```
    (Press `Ctrl+C` to exit logs)

## Access the Application
-   **Frontend**: [http://localhost:4200](http://localhost:4200)
-   **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Stopping the Application
To stop and remove items:
```bash
docker compose down
```

## Manual Local Setup (No Docker)

If you prefer to run the Frontend and Backend separately in your terminal:

### 1. Backend (Python/FastAPI)

1.  Open a terminal and navigate to `backend`:
    ```bash
    cd backend
    ```
2.  (Optional) Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be at [http://localhost:8000](http://localhost:8000).

### 2. Frontend (Angular)

1.  Open a **new** terminal tab and navigate to `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies (first time only):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    The app will be at [http://localhost:4200](http://localhost:4200).
