import os
import fitz
import json
import openai
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(
    api_key=os.getenv("OPENROUTER_API"),
    base_url="https://openrouter.ai/api/v1",
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1) Extract PDF Text and Links
def extract_text_and_links(file_bytes):
    text = ""
    links = []

    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for i, page in enumerate(doc, start=1):
                text += page.get_text()
                for link in page.get_links():
                    if link.get("uri"):
                        label = page.get_textbox(link["from"]).strip()
                        links.append({"text": label, "uri": link["uri"]})
        return text, links
    except Exception as e:
        print("❌ Failed to extract text/links:", e)
        return "", []  # fallback to empty values to avoid crash


# 2) AI Resume parser
def parse_resume_with_ai(text, links):
    link_str = "\n".join(f"{l['text']} -> {l['uri']}" for l in links)
    prompt = f"""
    You are an intelligent resume parser.

    Parse the following resume text and return a JSON object where:
    - Each key corresponds EXACTLY to the section heading as it appears in the resume (e.g., "EDUCATION", "TECHNICAL SKILLS", "ACADEMIC PROJECTS", "EXTRA CURRICULARS AND OTHERS").
    - DO NOT invent new sections or split existing ones.
    - DO NOT combine unrelated items into the same section.
    - Preserve the groupings and titles from the document.
    - Values can be strings or arrays depending on how the section is structured.
    - DO NOT add "Interests", "Certifications", or any other headers as a separate fields unless they were originally written as such.
    - All the content should be displayed only under the exact header.
    - All headers should be in the exact sequence as in the uploaded pdf.
    - DO NOT consider the bullet points as separate fields or headers, all the bullets should be under one single header mentioned above the content.
    
    Resume Text: 
    \"\"\"{text}\"\"\"
    
    Embedded links: 
    {link_str}
    """
    
    response = client.chat.completions.create(
        model = "mistralai/mistral-7b-instruct",
        messages=[
            {"role": "system", "content": "You are a resume section extractor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1500
    )
    
    try:
        return json.loads(response.choices[0].message.content.strip())
    
    except Exception as e:
        print("❌ AI returned invalid JSON:", response.choices[0].message.content)
        return {"error": "Could not parse AI response", "details":str(e)}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text, links = extract_text_and_links(content)
        parsed = parse_resume_with_ai(text, links)
        return parsed
    
    except Exception as e:
        print("❌ Error in upload-resume:", e)
        return {"error": "Failed to process resume", "details": str(e)}


# 3) AI Enhancement for sections
class EnhanceRequest(BaseModel):
    section: str
    content: str

@app.post("/ai-enhance")
async def ai_enhance(data: EnhanceRequest):
    prompt = f"""Improve this resume section "{data.section}" to make it sound more professional, impactful, and polished.
                Content: 
                \"\"\"{data.content} \"\"\"    
                Only return the improved version of the text. Do not include any explanation."""
    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct", 
            messages=[
                {"role": "system", "content": "You are a professional resume editor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=800,
        )
        improved = response.choices[0].message.content.strip()
        if improved.startswith('"') and improved.endswith('"'):
            improved = improved[1:-1]
        return {"improved": improved}

    except Exception as e:
        return {"error": "Failed to enhance section", "details": str(e)}
