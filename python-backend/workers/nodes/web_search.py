import os
from langchain.tools import tool
from langchain_tavily import TavilySearch


@tool(description="Search the web to get the latest information")
def web_search(query: str):
    """Search the web using Tavily."""
    try:
        # TavilySearch will automatically use the TAVILY_API_KEY
        # environment variable if it's set.
        search = TavilySearch(max_results=3)
        response = search.results(query)
        formatted_response = "\n".join(
            [f"URL: {res['url']}\nContent: {res['content']}\n---" for res in response]
        )
        return formatted_response
    except Exception as e:
        return f"Error while searching the web: {e}"