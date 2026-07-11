import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import fitz  # PyMuPDF
import easyocr
import numpy as np
from PIL import Image
import io
from transformers import pipeline

app = FastAPI(title="SENTINEL API")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OCR and Summarization (Lazy loading for speed)
reader = None
summarizer = None

def get_reader():
    global reader
    if reader is None:
        reader = easyocr.Reader(['en'])
    return reader

def get_summarizer():
    global summarizer
    if summarizer is None:
        # Using a small, efficient model for local/offline use
        summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    return summarizer

class ScanResult(BaseModel):
    filename: str
    text: str
    summary: str
    key_points: List[str]
    word_count: int

@app.post("/api/scan", response_model=ScanResult)
async def scan_document(
    file: UploadFile = File(...),
    length: str = Form("medium")
):
    content = await file.read()
    filename = file.filename
    extracted_text = ""

    # 1. Extraction Logic
    try:
        if filename.lower().endswith('.pdf'):
            doc = fitz.open(stream=content, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text()
            
            # If PDF is empty (scanned), use OCR
            if not extracted_text.strip():
                print("PDF text layer empty, initiating OCR...")
                for page in doc:
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    results = get_reader().readtext(np.array(img))
                    extracted_text += " ".join([res[1] for res in results]) + "\n"
        
        elif filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            img = Image.open(io.BytesIO(content))
            results = get_reader().readtext(np.array(img))
            extracted_text = " ".join([res[1] for res in results])
    except Exception as e:
        print(f"Extraction error: {e}")
        return ScanResult(
            filename=filename,
            text="",
            summary=f"Error extracting text: {str(e)}",
            key_points=["Extraction failed"],
            word_count=0
        )

    if not extracted_text.strip():
        return ScanResult(
            filename=filename,
            text="",
            summary="No text could be extracted from this document.",
            key_points=["No data found"],
            word_count=0
        )

    # 2. Summarization Logic
    max_len = 150
    min_len = 50
    if length == "short":
        max_len, min_len = 80, 30
    elif length == "long":
        max_len, min_len = 300, 100

    # Handle long text by chunking if necessary
    input_text = extracted_text[:4000] # Simple truncation for v1
    summary_obj = get_summarizer()(input_text, max_length=max_len, min_length=min_len, do_sample=False)
    summary = summary_obj[0]['summary_text']

    # 3. Key Points (Simple extraction based on summary/text)
    # In a more advanced version, we'd use a separate NLP task
    key_points = [p.strip() for p in summary.split('.') if len(p.strip()) > 10][:5]

    return ScanResult(
        filename=filename,
        text=extracted_text,
        summary=summary,
        key_points=key_points,
        word_count=len(extracted_text.split())
    )

# Serve Frontend (optional, if we want to run together)
# app.mount("/", StaticFiles(directory="frontend/out", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
