from fastapi import FastAPI
from sqlalchemy import text
from app.routers.auth import router as auth_router
from app.database import Base, engine
from app import models
from app.auth import get_current_user
from app.models import User
from fastapi import Depends
from app.routers.accounts import router as accounts_router
from app.routers.transactions import router as transaction_router
from app.models import Category
from app.database import SessionLocal
from app.routers.categories import router as category_router


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