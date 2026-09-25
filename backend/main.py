from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Codebase Intel is running!"}

@app.post("/analyse")
async def analyse_code(file: UploadFile = File(...)):
    contents = await file.read()
    code = contents.decode("utf-8", errors="ignore")

    prompt = f"""
    You are a helpful assistant that explains code in plain English.
    
    Analyse this code file called "{file.filename}" and give me:
    1. A plain English summary of what this file does
    2. The most important functions or sections and what they do
    3. Any risks or fragile parts I should be careful about
    4. How this file might connect to other parts of a codebase
    
    Keep everything simple. No jargon. Explain like I am new to this codebase.
    
    Here is the code:
    {code}
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return {
        "filename": file.filename,
        "analysis": response.text
    }
