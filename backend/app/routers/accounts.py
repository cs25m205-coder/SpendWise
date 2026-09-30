from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Account, User


router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


@router.post("/")
def create_account(
    name: str,
    account_type: str,
    balance: float = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = Account(
        name=name,
        account_type=account_type,
        balance=balance,
        user_id=current_user.id
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account
@router.get("/")
def get_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id
    ).all()

    return accounts

@router.put("/{account_id}")
def update_account(
    account_id: int,
    name: str,
    account_type: str,
    balance: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    account.name = name
    account.account_type = account_type
    account.balance = balance

    db.commit()
    db.refresh(account)

    return account
@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    db.delete(account)
    db.commit()

    return {
        "message": "Account deleted successfully"
    }