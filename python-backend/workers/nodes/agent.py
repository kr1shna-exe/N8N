import os
from typing import Any, Dict

import pystache
from agents.llm import create_llm
from agents.tools.web_search import web_search
from agents.tools.web_summary import summary_content
from fastapi import HTTPException
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import hub
from sqlmodel import select

from db.database import get_db_session
from db.models.models import Credentials, Platform

prompt_template = hub.pull("hwchase17/react")


async def run_agent(
    credential_id: str, template: Dict[str, Any], context: Dict[str, Any]
):
    raw_prompt = template.get("prompt", "")
    if not raw_prompt:
        raise HTTPException(status_code=400, detail="Prompt should be provided")
    prompt = pystache.render(raw_prompt, context)
    db = next(get_db_session)
    tavily_credential = db.exec(
        select(Credentials).where(
            Credentials.id == credential_id, Credentials.platform == Platform.TAVILY
        )
    ).first()
    if not tavily_credential:
        raise HTTPException(status_code=400, detail="Tavily credential not found")
    tavily_api_key = tavily_credential.data.get("apiKey")
    gemini_credential = db.exec(
        select(Credentials).where(Credentials.platform == Platform.GEMINI)
    ).first()
    if not gemini_credential:
        raise HTTPException(status_code=400, detail="Gemini credential not found")
    gemini_api_key = gemini_credential.data.get("apiKey")
    os.environ["TAVILY_API_KEY"] = tavily_api_key
    os.environ["GEMINI_API_KEY"] = gemini_api_key
    llm = create_llm(gemini_credential)
    tools = [web_search, summary_content]
    agent = create_react_agent(llm, tools, prompt_template)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    try:
        response = await agent_executor.ainvoke({"input": prompt})
        result = response.get("output")
    except Exception as e:
        print(f"Agent execution failed: {e}")
        raise HTTPException(status_code=400, detail="Execution failed")
    finally:
        del os.environ["TAVILY_API_KEY"]
        del os.environ["GEMINI_API_KEY"]
        db.close()
    return {"result": result}
