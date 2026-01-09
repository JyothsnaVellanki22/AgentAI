from typing import List
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LangchainDocument
from app.core import vector_db
from app.core.config import settings

embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)

def get_vector_store():
    # Use the HttpClient to connect to the Docker container
    client = vector_db.get_chroma_client()
    return Chroma(
        client=client,
        collection_name="documents",
        embedding_function=embeddings,
    )

async def ingest_document(content: str, metadata: dict):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = [LangchainDocument(page_content=content, metadata=metadata)]
    splits = text_splitter.split_documents(docs)
    
    vector_store = get_vector_store()
    vector_store.add_documents(documents=splits)

async def retrieve_context(query: str) -> List[LangchainDocument]:
    print(f"DEBUG: RAG retrieve_context for query: {query}")
    try:
        vector_store = get_vector_store()
        results = vector_store.similarity_search(query, k=4)
        print(f"DEBUG: Found {len(results)} docs")
        return results
    except Exception as e:
        print(f"ERROR: retrieve_context failed: {e}")
        return []

async def generate_response(query: str, context_docs: List[LangchainDocument]):
    print(f"DEBUG: Using OpenRouter model: meta-llama/llama-3.1-8b-instruct")

    if not settings.OPENROUTER_API_KEY:
        print("ERROR: settings.OPENROUTER_API_KEY is not set!")
        return "System Error: OpenRouter API Key is missing."

    llm = ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
        model="meta-llama/llama-3.1-8b-instruct",
        temperature=0
    )
    
    context_text = "\n\n".join([doc.page_content for doc in context_docs])
    
    prompt = f"""You are a helpful assistant. Use the following context to answer the question.
    
    Context:
    {context_text}
    
    Question: {query}
    
    Answer:"""
    
    print("DEBUG: Sending request to OpenAI...")
    # We can stream this later, for now just basic invoke
    response = await llm.ainvoke(prompt)
    print("DEBUG: Received response from OpenAI")
    return response.content
