from pydantic import BaseModel


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AccountCreate(BaseModel):
    name: str
    account_type: str
    balance: float = 0


class AccountUpdate(BaseModel):
    name: str
    account_type: str
    balance: float


class TransactionCreate(BaseModel):
    description: str
    amount: float
    transaction_type: str
    account_id: int
    category_id: int


class TransactionUpdate(BaseModel):
    description: str
    amount: float
    transaction_type: str
    account_id: int
    category_id: int