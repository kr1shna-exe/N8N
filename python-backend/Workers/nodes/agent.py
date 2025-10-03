import os
import sys
from typing import Any, Dict

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import pystache
from fastapi import HTTPException
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent
from sqlmodel import select

from db.database import get_db_session, get_session
from db.models.models import Credentials, Platform
from Workers.nodes.agents.llm import create_llm
from Workers.nodes.agents.tools.web_search import web_search
from Workers.nodes.agents.tools.web_summary import summary_content

node_details = {
    "type": "agent",
    "name": "AI Agent",
    "description": "AI-powered agent that can search the web and summarize content",
    "category": "AI",
    "icon": "🤖",
}

prompt_template = hub.pull("hwchase17/react")


async def run_agent(
    credential_id: str, template: Dict[str, Any], context: Dict[str, Any]
):
    raw_prompt = template.get("prompt", "")
    if not raw_prompt:
        raise HTTPException(status_code=400, detail="Prompt should be provided")
    prompt = pystache.render(raw_prompt, context)
    db = get_db_session()
    try:
        llm_credential = db.exec(
            select(Credentials).where(Credentials.id == credential_id)
        ).first()
        if not llm_credential:
            raise HTTPException(status_code=400, detail="LLM credential not found")

        llm = create_llm(llm_credential)
        tools = [web_search, summary_content]
        agent = create_react_agent(llm, tools, prompt_template)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        response = await agent_executor.ainvoke({"input": prompt})
        result = response.get("output")
        return {"result": result}
    except Exception as e:
        import traceback
        error_message = f"Agent execution failed:\n{traceback.format_exc()}"
        return {"result": error_message}
    finally:
        db.close()
