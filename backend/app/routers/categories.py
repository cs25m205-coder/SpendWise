from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category
from app.auth import get_current_user
from app.models import User


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.get("/")
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Category).all()