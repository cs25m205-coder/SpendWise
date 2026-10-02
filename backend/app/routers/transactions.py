from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Account, Category, Transaction, User
from app.schemas import TransactionCreate, TransactionUpdate


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post("/")
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.id == transaction_data.account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    category = db.query(Category).filter(
        Category.id == transaction_data.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    transaction = Transaction(
        description=transaction_data.description,
        amount=transaction_data.amount,
        transaction_type=transaction_data.transaction_type,
        account_id=transaction_data.account_id,
        category_id=transaction_data.category_id
    )

    db.add(transaction)

    amount = Decimal(str(transaction_data.amount))

    if transaction_data.transaction_type == "expense":

        if account.balance < amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient balance"
            )

        account.balance -= amount

    elif transaction_data.transaction_type == "income":
        account.balance += amount

    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("/")
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = (
        db.query(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .filter(Account.user_id == current_user.id)
        .all()
    )

    return transactions


@router.put("/{transaction_id}")
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = (
        db.query(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .filter(
            Transaction.id == transaction_id,
            Account.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    old_account = db.query(Account).filter(
        Account.id == transaction.account_id,
        Account.user_id == current_user.id
    ).first()

    new_account = db.query(Account).filter(
        Account.id == transaction_data.account_id,
        Account.user_id == current_user.id
    ).first()

    if not new_account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    category = db.query(Category).filter(
        Category.id == transaction_data.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Reverse the old transaction
    old_amount = Decimal(str(transaction.amount))

    if transaction.transaction_type == "expense":
        old_account.balance += old_amount

    elif transaction.transaction_type == "income":
        old_account.balance -= old_amount

    # Apply the new transaction
    new_amount = Decimal(str(transaction_data.amount))

    if transaction_data.transaction_type == "expense":
        new_account.balance -= new_amount

    elif transaction_data.transaction_type == "income":
        new_account.balance += new_amount

    # Update transaction fields
    transaction.description = transaction_data.description
    transaction.amount = transaction_data.amount
    transaction.transaction_type = transaction_data.transaction_type
    transaction.account_id = transaction_data.account_id
    transaction.category_id = transaction_data.category_id

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = (
        db.query(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .filter(
            Transaction.id == transaction_id,
            Account.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    account = db.query(Account).filter(
        Account.id == transaction.account_id,
        Account.user_id == current_user.id
    ).first()

    amount = Decimal(str(transaction.amount))

    # Reverse the transaction before deleting it
    if transaction.transaction_type == "expense":
        account.balance += amount

    elif transaction.transaction_type == "income":
        account.balance -= amount

    db.delete(transaction)

    db.commit()

    return {
        "message": "Transaction deleted successfully"
    }