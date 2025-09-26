import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI


@tool(
    description="Generate a text summary for the text content of the wbepage provided by the user"
)
def summary_content(url: str):
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        if soup.body():
            text_content = soup.body.get_text(separator="\\n", strip=True)
        else:
            text_content = soup.get_text(separator="\\n", strip=True)
        if not text_content:
            return "Could not find any text content on the page"
        max_length = 15000
        if len(text_content) > max_length:
            return text_content[:max_length] + "\\n... (content truncated)"
        llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0)
        prompt = f"Please provide a concise summary of the following web page content: \n\n{text_content}"
        summary_response = llm.invoke(prompt)
        return summary_response.content
    except Exception as e:
        print(f"Error occured while summarising the content: {e}")
