from fastapi import FastAPI
from sqlalchemy import text
from app.routers.auth import router as auth_router
from app.database import Base, engine, get_db
from app import models
from app.auth import get_current_user
from app.models import User
from fastapi import Depends
from app.routers.accounts import router as accounts_router
from app.routers.transactions import router as transaction_router
from app.models import Category
from app.database import SessionLocal
from app.routers.categories import router as category_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)
db = SessionLocal()

default_categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other"
]

for category_name in default_categories:
    existing = db.query(Category).filter(
        Category.name == category_name
    ).first()

    if not existing:
        db.add(Category(name=category_name))

db.commit()
db.close()



app = FastAPI(
    title="SpendWise API",
    description="Personal Finance Management API",
    version="1.0.0"
)
app = FastAPI(
    title="SpendWise API",
    description="Personal Finance Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(transaction_router)
app.include_router(category_router)



@app.get("/")
def root():
    return {
        "message": "SpendWise API is running",
        "environment": "development"
    }


@app.get("/health")
def health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected"
    }

@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }

@app.get("/categories")
def get_categories(
    db: Session = Depends(get_db)  
):
    return db.query(Category).all()
