import os
import sys
from typing import Union

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from db.models.models import Credentials, Platform


def create_llm(credentials: Credentials) -> Union[BaseChatModel, None]:
    api_key = credentials.get("apiKey")
    if not api_key:
        raise ValueError("API Key not found")
    if credentials.platform == Platform.GROQ:
        return ChatGroq(api_key=api_key, model="llama3-8b-8192")
    elif credentials.platform == Platform.GEMINI:
        return ChatGoogleGenerativeAI(google_api_key=api_key, model="gemini-flash")
    else:
        print(f"Unsupported LLM Platform: {credentials.platform}")
        return None
