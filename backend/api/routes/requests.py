"""Requests API route handling IT submissions and AI Agent loop execution."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.models.schemas import RequestSubmission, QuickQuerySubmission, AgentResponse
from backend.data.store import store
from backend.agent.engine import agent_engine
from backend.agent.tools import tool_lookup_policy, tool_verify_employee_profile

router = APIRouter(prefix="/api/v1/requests", tags=["Requests"])

@router.post("", response_model=AgentResponse)
async def submit_request(submission: RequestSubmission):
    """Submits a new IT service request and executes the autonomous Agentic reasoning loop."""
    profile = store.get_active_profile()
    if submission.requester_id and submission.requester_id in store.profiles:
        profile = store.profiles[submission.requester_id]

    agent_response = agent_engine.process_request(submission, profile)
    
    if agent_response.ticket:
        store.add_ticket(agent_response.ticket)
        
    return agent_response

@router.post("/quick-query")
async def quick_query_eval(body: QuickQuerySubmission):
    """Instant evaluation of natural language IT queries without creating a permanent ticket yet."""
    profile = store.get_active_profile()
    if body.requester_id and body.requester_id in store.profiles:
        profile = store.profiles[body.requester_id]

    # Pre-check policy
    policy = tool_lookup_policy(body.query)
    policy_id = policy.id if policy else "KB-04"
    profile_check = tool_verify_employee_profile(profile, policy_id, {})

    # Run lightweight scenario preview
    submission = RequestSubmission(
        category=policy.title if policy else "General IT",
        title=body.query,
        description=body.query,
        context_data={}
    )
    agent_response = agent_engine.process_request(submission, profile)
    # Store ticket for traceability so user can view it in the queue
    if agent_response.ticket:
        store.add_ticket(agent_response.ticket)

    return {
        "query": body.query,
        "matched_policy": policy,
        "profile_evaluation": profile_check,
        "agent_response": agent_response
    }
