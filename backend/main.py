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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1) Extract PDF Text and Links
def extract_text_and_links(file_bytes):
    text = ""
    links = []
    
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for i, page in enumerate(doc, start=1):
            text += page.get_text()
            for link in page.get_links():
                if link.get("uri"):
                    label = page.get_textbox(link["from"]).strip()
                    links.append({"test": label, "uri": link["uri"]})
    
    return text, links

# 2) AI Resume parser
def parse_resume_with_ai(text, links):
    link_str = "\n".join(f"{l['text']} -> {l['uri']}" for l in links)
    prompt = f"""
    You are a resume parsing assistant.
    From the resume text below, extract logical sections (like Education, Projects, Skills, etc) and return them as a JSON object:
    - Keys = section names (e.g., "Education", "Technical Skills")
    - Values = section content (string or list)
    - For any embedded links in the pdf, extract both the anchor text and the actual link
    - Don't add explanations.
    
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
        return {"error": "Could not parse AI response", "details":str(e)}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text, links = extract_text_and_links(content)
        parsed = parse_resume_with_ai(text, links)
        return parsed
    
    except Exception as e:
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
