# rag.py
import os
import re
from store1 import search   # keep as-is if your file is store1.py
from bedrock import call_bedrock


# Matches JOB2601 / job2601 / JOB12345 etc.
JOB_RE = re.compile(r"\bJOB\d{3,}\b", re.IGNORECASE)

def extract_job_id(text: str) -> str | None:
    m = JOB_RE.search(text or "")
    return m.group(0).upper() if m else None


def build_context(question: str) -> str:
    top_k = int(os.getenv("TOP_K", "4"))

    # ✅ Option A: prioritize job-id retrieval
    job_id = extract_job_id(question)
    if job_id:
        rows = search(job_id, limit=top_k)
        # fallback to full question if job-id search returns nothing
        if not rows:
            rows = search(question, limit=top_k)
    else:
        rows = search(question, limit=top_k)

    if not rows:
        return ""

    parts = []
    for r in rows:
        parts.append(
            f"FILENAME: {r.get('filename', '')}\n"
            f"SUMMARY: {r.get('summary', '')}\n"
            f"---\n"
        )
    return "".join(parts)


def answer(question: str) -> str:
    system = (
        "You are a mainframe log assistant. Use the provided context to answer accurately. "
        "If context is insufficient, say what is missing and suggest what to check next."
    )
    context = build_context(question)
    prompt = (
        f"SYSTEM:\n{system}\n\nCONTEXT:\n{context}\n\nQUESTION:\n{question}\n"
        if context else
        f"SYSTEM:\n{system}\n\nQUESTION:\n{question}\n"
    )
    return call_bedrock(prompt)