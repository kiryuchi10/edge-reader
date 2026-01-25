# Edge Reader MVP - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Setup Environment
```bash
# Clone/navigate to the edge_reader directory
cd edge_reader

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 2. Start the Server
```bash
# Option A: Direct run
python run_server.py

# Option B: With uvicorn
uvicorn apps.backend.main:app --host 0.0.0.0 --port 8000 --reload

# Option C: Docker
docker-compose up --build
```

### 3. Test the API
```bash
# In another terminal
python test_mvp.py
```

## 📡 API Endpoints

Once running on http://localhost:8000:

### Health Check
```bash
curl http://localhost:8000/healthz
# Response: {"ok": true}
```

### Text Analysis
```bash
curl -X POST http://localhost:8000/analysis/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world, how are you?"}'
```

### Chat with Documents
```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"query": "What is machine learning?"}'
```

### File Upload (Audio)
```bash
curl -X POST http://localhost:8000/ingest/upload-audio \
  -F "file=@your_audio.wav"
```

### File Upload (Image)
```bash
curl -X POST http://localhost:8000/ingest/upload-image \
  -F "file=@your_image.jpg"
```

## 🌐 Interactive API Documentation

Visit http://localhost:8000/docs for Swagger UI documentation where you can:
- Test all endpoints interactively
- Upload files through the web interface
- See request/response schemas

## 📁 Add Your Documents

1. Place PDF files in the `papers/` directory
2. The system will automatically index them
3. Query them through the `/chat/` endpoint

## ✅ Verify Everything Works

Run the test suite:
```bash
python -m pytest apps/backend/tests/ -v
```

Expected output: All tests should pass ✅

## 🔧 Troubleshooting

**Import Errors**: Make sure you're in the `edge_reader` directory
**Port 8000 in use**: Change port in `run_server.py` or kill existing process
**Missing dependencies**: Run `pip install -r requirements.txt`

## 🎯 What's Working

- ✅ FastAPI server with health check
- ✅ Multimodal file processing (dummy implementations)
- ✅ Text analysis with NLP insights
- ✅ RAG-based document chat
- ✅ Docker containerization
- ✅ Comprehensive error handling

The MVP is fully functional and ready for AI model integration! 🎉