from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import yaml
from datetime import datetime

app = FastAPI()

dates_dict = {}

with open("./dates.yaml") as file:
    dates = yaml.safe_load(file)

    dates_dict = dates["dates"]

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173", 
        "https://suburble-304e2.web.app/",
        "https://suburble.melbourne",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/today")
async def today():
    today = datetime.now().date()
    formatted = f"{today.year}-{today.month}-{today.day}"

    return {
        "suburb": dates_dict[today], 
        "date": formatted
    }

if __name__ == "__main__":
    import uvicorn

    port = os.getenv("PORT") or 8080

    uvicorn.run(app=app, host="0.0.0.0", port=port)