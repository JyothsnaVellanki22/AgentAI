import chromadb
from chromadb.config import Settings
from app.core.config import settings

def get_chroma_client():
    return chromadb.HttpClient(host="chromadb", port=8000)

def get_collection(name: str):
    client = get_chroma_client()
    return client.get_or_create_collection(name=name)
