from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Account, User
from app.schemas import AccountCreate, AccountUpdate


router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


@router.post("/")
def create_account(
    account_data: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = Account(
        name=account_data.name,
        account_type=account_data.account_type,
        balance=account_data.balance,
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
    account_data: AccountUpdate,
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

    account.name = account_data.name
    account.account_type = account_data.account_type
    account.balance = account_data.balance

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