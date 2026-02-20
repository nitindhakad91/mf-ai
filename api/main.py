import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
from mongo_db import summaries

from PIL import Image, ImageOps
import pytesseract

from store1 import latest, search
from rag import answer

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="POC MF AI API (MongoDB Only)")

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")

# ---- FIX: Allow all for local development ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # allow ANY frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str


def preprocess(img: Image.Image) -> Image.Image:
    img = img.convert("RGB")
    img = ImageOps.grayscale(img)
    img = ImageOps.autocontrast(img)
    return img

@app.get("/ocr/{img_id}")
def ocr_fixed(img_id: int):
    if img_id < 1 or img_id > 6:
        raise HTTPException(status_code=404, detail="Invalid sample id")

    path = os.path.join(SAMPLES_DIR, f"{img_id}.png")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Sample image not found")

    try:
        img = Image.open(path)
        img = preprocess(img)
        config = "--oem 3 --psm 6"
        text = pytesseract.image_to_string(img, lang="eng", config=config)
        return {"text": (text or "").strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/latest")
def get_latest_jobids(limit: int = 5):
    col = summaries()
 
    # include created_at in projection for safe sorting
    docs = (
        col.find({}, {"summary": 1, "created_at": 1})
           .sort("created_at", -1)
           .limit(limit)
    )
 
    results = []
 
    job_pattern = r"\bJOB[0-9]+\b"
    status_pattern = r"Status\s*=\s*([A-Za-z]+)"
 
    for doc in docs:
        summary = doc.get("summary", "")
 
        job_match = re.search(job_pattern, summary)
        jobid = job_match.group(0) if job_match else None
 
        status_match = re.search(status_pattern, summary)
        status = status_match.group(1) if status_match else None
 
        if jobid:
            results.append({
                "jobid": jobid,
                "status": status
            })
 
    # ✅ keep as results since your frontend will consume res.results
    return {"results": results}


@app.get("/search")
def get_search(q: str, limit: int = 10):
    return {"items": search(q, limit)}


@app.post("/chat")
def chat(req: ChatRequest):
    return {"answer": answer(req.question)}

