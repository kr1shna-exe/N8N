import os

from dotenv import load_dotenv
from langchain.tools import tool
from langchain_tavily import TavilySearch

load_dotenv()


@tool(description="Search the web to get the latest information")
def web_search(query: str):
    try:
        api_key = os.getenv("TAVILY_API_KEY")
        search = TavilySearch(api_key=api_key, max_results=3)
        response = search.invoke(query)
        results = response if isinstance(response, list) else response.get("results", [])
        formatted_response = "\n".join(
            [f"URL: {res['url']}\\nContent: {res['content']}\n---" for res in results]
        )
        return formatted_response
    except Exception as e:
        return f"Error while searching the web: {e}"


WEB_TOOL = web_search
