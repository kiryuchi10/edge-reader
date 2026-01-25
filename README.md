# Edge Reader MVP

A multimodal AI-powered document processing system that handles audio, image, and text inputs with RAG-based chat functionality.

## Quick Start

1. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run with Docker:
```bash
docker-compose up --build
```

4. Access the API at http://localhost:8000

## API Endpoints

- `GET /healthz` - Health check
- `POST /ingest/upload-audio` - Audio transcription and emotion analysis
- `POST /ingest/upload-image` - Image OCR processing
- `POST /analysis/text` - Text NLP analysis
- `POST /chat/` - RAG-based chat with documents

## Environment Variables

- `PAPERS_ROOT` - Root directory for PDF documents
- `PAPERS_CHAT_DIR` - Directory for chat-related documents
- `OPENAI_API_KEY` - OpenAI API key (optional for MVP)