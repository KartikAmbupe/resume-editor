from fastapi import FastAPI
from fastapi.middleware.cors  import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

#allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

# Input schema for enhancement
class EnhanceRequest(BaseModel):
    section: str
    content: str

@app.post("/ai-enhance")
def ai_enhance(data: EnhanceRequest):
    # Mock AI response (just for demonstration)
    improved = f"{data.content} (Enhanced ✨)"
    return {"improved": improved}

@app.post("/save-resume")
def save_resume(resume: dict):
    # Save resume to local file (in real app you could use DB)
    with open("saved_resume.json", "w") as f:
        json.dump(resume, f, indent=2)
    return {"status": "success", "message": "Resume saved successfully"}