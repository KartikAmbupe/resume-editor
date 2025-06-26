import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
import fitz  # PyMuPDF
import docx
import tempfile
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter API setup
client = openai.OpenAI(
    api_key=os.getenv("OPENROUTER_API"),
    base_url="https://openrouter.ai/api/v1",
)

# === AI Enhancement ===
class EnhanceRequest(BaseModel):
    section: str
    content: str

@app.post("/ai-enhance")
async def ai_enhance(data: EnhanceRequest):
    prompt = f"""Improve this resume {data.section} to be more professional, achievement-oriented, and impactful:
    
\"{data.content}\"

Only return the improved version of the text. Do not include any explanation.
"""
    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct", 
            messages=[
                {"role": "system", "content": "You are a professional resume editor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return {"improved": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}

# === AI Resume Parsing ===

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text_from_pdf(file_bytes):
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def parse_resume_with_ai(resume_text: str) -> dict:
    prompt = f"""
You are a resume parsing assistant.

Extract the following fields from the resume text below and return them as a JSON object:
- name
- summary (All over summary of the person, their projects, skills, achievements, etc.)
- experience (as a list of past roles)
- education (as a list of degrees or institutions)
- skills (as a list of technologies or tools)

Resume text:
\"\"\"
{resume_text}
\"\"\"

Return only the JSON. Do not include any explanation.
"""
    response = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct",  # Replace with GPT/Claude if needed
        messages=[
            {"role": "system", "content": "You are a resume parser."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=800,
    )

    try:
        return json.loads(response.choices[0].message.content.strip())
    except json.JSONDecodeError:
        return {"error": "AI response could not be parsed."}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()

    try:
        if filename.endswith(".docx"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(contents)
                tmp.seek(0)
                text = extract_text_from_docx(tmp.name)
        elif filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        else:
            return {"error": "Unsupported file format. Only .docx and .pdf are allowed."}

        parsed_resume = parse_resume_with_ai(text)
        return parsed_resume

    except Exception as e:
        return {"error": f"Failed to process file: {str(e)}"}
