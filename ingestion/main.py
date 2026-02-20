import os
import hashlib
from datetime import datetime, timezone
 
import cv2
from PIL import Image
import pytesseract
from dotenv import load_dotenv
load_dotenv()
from mongo import get_collection
 
mongo_uri = os.getenv("MONGO_URI")
print(mongo_uri)
# Load env from repo root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
 
# ⚠️ Windows-only (remove on Linux/Mac)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
 
# Image folder (repo-root/sample_images)
IMAGE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "sample_images")
)
 
 
def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()
 
 
def image_to_text(image_path: str) -> str:
    image = cv2.imread(image_path)
 
    if image is None:
        print(f"❌ Could not read image: {image_path}")
        return ""
 
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
 
    processed = Image.fromarray(thresh)
 
    text = pytesseract.image_to_string(processed)
    text = text.replace("J0B", "JOB")
    return text.strip()
 
 
def ingest_images():
    col = get_collection()
    print(f"[OCR Ingestor] Watching folder: {IMAGE_DIR}")
 
    for fname in sorted(os.listdir(IMAGE_DIR)):
        path = os.path.join(IMAGE_DIR, fname)
 
        if not os.path.isfile(path):
            continue
 
        if not fname.lower().endswith((".png", ".jpg", ".jpeg")):
            continue
 
        print(f"📸 Processing image: {fname}")
 
        content = image_to_text(path)
 
        if not content:
            print("⚠ No text extracted")
            continue
 
        content_hash = sha256(content)
        print("done")
        # Idempotency
        if col.find_one({"content_hash": content_hash}):
            print("⏭ Already ingested")
            continue
        print("done2")
        doc = {
            "source": "image_ocr",
            "log_type": "image_extract",
            "filename": fname,
            "content": content,
            "content_hash": content_hash,
            "ingested_at": datetime.now(timezone.utc),
            "status": "raw",
        }
        print("done here")
        col.insert_one(doc)
        print("✅ Inserted into MongoDB")
 
 
if __name__ == "__main__":
    ingest_images()