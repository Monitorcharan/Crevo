"""
Centralized Semantic Embedding Service
Uses Sentence Transformers ('all-MiniLM-L6-v2') for semantic representation.
Features:
- Lazy singleton model initialization
- In-memory embedding cache to avoid redundant inference
- Graceful deterministic fallback if PyTorch or SentenceTransformers fails to load
"""

import hashlib
import logging
from typing import Dict, List, Optional
import numpy as np

logger = logging.getLogger("crevo.embedding")

MODEL_NAME = "all-MiniLM-L6-v2"


class EmbeddingService:
    _instance: Optional["EmbeddingService"] = None

    def __init__(self):
        self._model = None
        self._initialized = False
        self._is_available = False
        self._cache: Dict[str, np.ndarray] = {}

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _init_model(self) -> None:
        if self._initialized:
            return
        self._initialized = True
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Initializing SentenceTransformer with model '%s'...", MODEL_NAME)
            self._model = SentenceTransformer(MODEL_NAME)
            self._is_available = True
            logger.info("SentenceTransformer '%s' loaded successfully.", MODEL_NAME)
        except Exception as e:
            logger.warning(
                "SentenceTransformer model '%s' could not be initialized (%s). "
                "Activating deterministic fallback matching mode.",
                MODEL_NAME,
                e,
            )
            self._model = None
            self._is_available = False

    @property
    def is_semantic_available(self) -> bool:
        if not self._initialized:
            self._init_model()
        return self._is_available

    @property
    def model_name(self) -> Optional[str]:
        return MODEL_NAME if self.is_semantic_available else None

    def _hash_key(self, text: str) -> str:
        clean = " ".join(text.strip().split())
        return hashlib.sha256(clean.encode("utf-8")).hexdigest()

    def encode(self, text: str) -> Optional[np.ndarray]:
        """
        Computes L2-normalized dense embedding for a given string.
        Returns cached vector if already computed.
        """
        if not text or not text.strip():
            return None

        clean_text = " ".join(text.strip().split())
        key = self._hash_key(clean_text)
        if key in self._cache:
            return self._cache[key]

        if not self.is_semantic_available:
            return None

        try:
            # normalize_embeddings=True ensures unit L2 norm so dot product == cosine similarity
            embedding = self._model.encode(
                clean_text,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            self._cache[key] = embedding
            return embedding
        except Exception as e:
            logger.error("Failed to compute embedding for text: %s", e)
            return None

    def compute_similarity(self, vec_a: Optional[np.ndarray], vec_b: Optional[np.ndarray]) -> float:
        """
        Computes cosine similarity between two normalized vectors.
        Returns float between -1.0 and 1.0.
        """
        if vec_a is None or vec_b is None:
            return 0.0

        try:
            sim = float(np.dot(vec_a, vec_b))
            return max(-1.0, min(1.0, sim))
        except Exception as e:
            logger.error("Failed to compute vector similarity: %s", e)
            return 0.0

    def clear_cache(self) -> None:
        self._cache.clear()


embedding_service = EmbeddingService.get_instance()
