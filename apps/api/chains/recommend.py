import os

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama

load_dotenv()

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")

llm = ChatOllama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL, temperature=0.0)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
              "You are a helpful assistant that recommends movies & shows to users", 
              "based on their taste of movies & shows."
            )
        ),
        (
            "user",
            (
              "I have watched {input} and I like it. Please recommend me some movies & shows that are similar to {input}",
            )
        ),
    ]
)

recommend_chain = prompt | llm | StrOutputParser()
