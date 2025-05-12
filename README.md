# RAG Chat Application

This is a backend application for a Retrieval-Augmented Generation (RAG) based chatbot, built with NestJS.

## Features

*   Chat session management (create, retrieve, update, delete, list).
*   Message handling within sessions.
*   Retrieval-Augmented Generation for answering user queries based on provided documents (functionality within the RAG module).
*   Document management for the RAG system (likely includes ingestion and processing).

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd rag-chat
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Environment Variables:**
    This application likely requires environment variables for configuration (e.g., database connection, external API keys, vector database connection). Create a `.env` file in the root directory based on a potential `.env.example` (if one exists) or the configuration modules used (`@nestjs/config`, likely in `app.module.ts` or dedicated config files).

    *Key variables might include:*
    *   `PORT`: Port number the application runs on (defaults to 3000 if not set).
    *   Database credentials (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).
    *   Vector Database connection details (e.g., Qdrant URL/API Key).
    *   LLM API Key (e.g., OpenAI API Key).
    *   AWS credentials (if using S3 for storage).

4.  **Database Setup:**
    *   Ensure you have a running PostgreSQL instance configured according to your environment variables.
    *   Run database migrations:
        ```bash
        npm run migration:run
        ```
        (This uses the TypeORM CLI configuration defined in `data-source.ts` and `package.json`).

## Running the Application (Manual)

*   **Development Mode (with auto-reloading):**
    ```bash
    npm run start:dev
    ```
    Or using yarn:
    ```bash
    yarn start:dev
    ```
    The application will typically be available at `http://localhost:3000` (or the port specified in your `.env` file).

*   **Production Mode:**
    1.  Build the application:
        ```bash
        npm run build
        ```
    2.  Start the application:
        ```bash
        npm run start:prod
        ```

## Running the Application (Docker)

This is the recommended way to run the application locally, as it includes the necessary database service.

1.  **Prerequisites:**
    *   Docker: [Install Docker](https://docs.docker.com/get-docker/)
    *   Docker Compose: (Usually included with Docker Desktop)

2.  **Environment Variables:**
    *   Ensure you have a `.env` file in the root directory containing the necessary configuration (see the *Environment Variables* section above). Pay close attention to `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` as these will be used to initialize the PostgreSQL container.
    *   The `DB_HOST` in your `.env` file will be **ignored** when running via Docker Compose; the application container will automatically connect to the `postgres` service name.

3.  **Build and Run:**
    ```bash
    docker-compose up --build
    ```
    *   Add `-d` to run in detached mode (in the background):
        ```bash
        docker-compose up --build -d
        ```
    *   The application API should be available at `http://localhost:PORT` (where `PORT` is defined in your `.env` or defaults to 3000).
    *   The PostgreSQL database will be accessible on your host machine at `localhost:DB_PORT` (where `DB_PORT` is defined in your `.env` or defaults to 5432).

4.  **Running Migrations (Docker):**
    After the containers are running, you may need to run database migrations inside the running API container. Open another terminal:
    ```bash
    docker-compose exec api npm run migration:run
    ```

5.  **Stopping the Application:**
    ```bash
    docker-compose down
    ```
    *   Add `-v` to remove the database volume (deletes all database data):
        ```bash
        docker-compose down -v
        ```

## API Overview

The application exposes RESTful APIs for various functionalities:

*   **Root/Health Check:**
    *   `GET /`: Basic application status (handled by `AppController`).
    *   `GET /health`: Simple health check endpoint.
*   **Chat Management (`/chat`):**
    *   `POST /chat/sessions`: Create a new chat session.
    *   `GET /chat/sessions/:id`: Get details of a specific session (including messages).
    *   `PATCH /chat/sessions/:id`: Update session details (e.g., title, favorite status).
    *   `DELETE /chat/sessions/:id`: Mark a session as inactive.
    *   `GET /chat/sessions`: Get all active sessions.
    *   `GET /chat/sessions/favorites`: Get favorite sessions.
    *   `POST /chat/messages`: Add a message to a session (triggers assistant response).
    *   `GET /chat/messages/:sessionId`: Get messages for a specific session.
*   **RAG Management (`/rag` - *Specific endpoints depend on implementation in `src/rag/controllers`*):
    *   Likely includes endpoints for:
        *   Uploading/Ingesting documents.
        *   Querying the RAG system.
        *   Managing indexed documents.

## API Documentation (Swagger)

When running in development mode (`npm run start:dev`), interactive API documentation (Swagger UI) is available at:

[http://localhost:3000/api/docs](http://localhost:3000/api/docs)

This documentation provides details on all available endpoints, request parameters, and response schemas.

## Running Tests

*   **Unit Tests:**
    ```bash
    # Run a specific unit test file (adjust path as needed)
    npx jest --config test/jest-e2e.json --testRegex='.spec.ts$' -- test/chat.service.spec.ts

    # Run all unit tests (requires adjusting package.json or jest config)
    # Example modification in package.json:
    # "test:unit": "jest --config test/jest-e2e.json --testRegex='.spec.ts$'"
    # Then run:
    # npm run test:unit
    ```
*   **End-to-End (E2E) Tests:**
    ```bash
    npm run test:e2e
    ``` 