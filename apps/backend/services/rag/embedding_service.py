"""
Embedding service for text vectorization
Uses sentence-transformers for local embeddings or OpenAI for cloud
"""
from sentence_transformers import SentenceTransformer
from typing import List, Optional
import logging
import os

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating text embeddings"""
    
    _model_cache = {}  # Cache loaded models
    
    def __init__(
        self, 
        provider: str = "local",
        model_name: str = "all-MiniLM-L6-v2",
        api_key: Optional[str] = None
    ):
        """
        Initialize embedding service
        
        Args:
            provider: 'local' (sentence-transformers) or 'openai'
            model_name: Model name for local provider
            api_key: API key for OpenAI (if using cloud)
        """
        self.provider = provider.lower()
        self.model_name = model_name
        
        if self.provider == "local":
            # Load local model (cached)
            if model_name not in self._model_cache:
                logger.info(f"Loading embedding model: {model_name}")
                self.model = SentenceTransformer(model_name)
                self._model_cache[model_name] = self.model
                logger.info(f"Embedding model {model_name} loaded")
            else:
                self.model = self._model_cache[model_name]
                logger.info(f"Using cached embedding model: {model_name}")
            self.client = None
            
        elif self.provider == "openai":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
                self.model = None
                logger.info("Embedding service initialized with OpenAI")
            except ImportError:
                logger.warning("OpenAI library not installed. Install with: pip install openai")
                self.client = None
        else:
            raise ValueError(f"Unknown provider: {provider}. Use 'local' or 'openai'")
    
    def embed(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generate embeddings for texts
        
        Args:
            texts: List of texts to embed
            batch_size: Batch size for processing (local only)
        
        Returns:
            List of embedding vectors
        """
        if not texts:
            return []
        
        try:
            if self.provider == "local":
                if not self.model:
                    raise ValueError("Local model not loaded")
                
                # Generate embeddings
                embeddings = self.model.encode(
                    texts,
                    convert_to_numpy=False,
                    batch_size=batch_size,
                    show_progress_bar=len(texts) > 100
                )
                
                # Convert to list of lists
                if isinstance(embeddings, list):
                    return embeddings
                else:
                    return embeddings.tolist()
            
            else:  # openai
                if not self.client:
                    raise ValueError("OpenAI client not initialized")
                
                response = self.client.embeddings.create(
                    model="text-embedding-3-small",  # or text-embedding-3-large
                    input=texts
                )
                return [item.embedding for item in response.data]
                
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}", exc_info=True)
            raise
    
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a single query
        
        Args:
            query: Query text
        
        Returns:
            Embedding vector
        """
        return self.embed([query])[0]
