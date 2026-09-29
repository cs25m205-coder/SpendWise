from fastapi import FastAPI

app = FastAPI(
    title="SpendWise API",
    description="Personal Finance Management API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "SpendWise API is running"
    }
