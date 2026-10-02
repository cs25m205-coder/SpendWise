
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Doughnut } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const API_URL = 'http://127.0.0.1:8000'

function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // User and financial data
  const [user, setUser] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])

  // Account form
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('Bank')
  const [balance, setBalance] = useState('')

  // Transaction form
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState('expense')
  const [transactionAccount, setTransactionAccount] = useState('')
  const [transactionCategory, setTransactionCategory] = useState('')

  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // -------------------------
  // LOGOUT
  // -------------------------

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  // -------------------------
  // FETCH ACCOUNTS
  // -------------------------

  const loadAccounts = async () => {
    const response = await fetch(`${API_URL}/accounts/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to load accounts')
    }

    setAccounts(data)
  }

  // -------------------------
  // FETCH TRANSACTIONS
  // -------------------------

  const loadTransactions = async () => {
    const response = await fetch(`${API_URL}/transactions/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to load transactions')
    }

    setTransactions(data)
  }

  // -------------------------
  // LOAD DASHBOARD DATA
  // -------------------------

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const userResponse = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (userResponse.status === 401 || userResponse.status === 403) {
          handleLogout()
          return
        }

        const userData = await userResponse.json()

        if (!userResponse.ok) {
          throw new Error(userData.detail || 'Failed to load user')
        }

        setUser(userData)

        const categoriesResponse = await fetch(`${API_URL}/categories`)

        const categoriesData = await categoriesResponse.json()

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.detail || 'Failed to load categories'
          )
        }

        setCategories(categoriesData)

        await Promise.all([
          loadAccounts(),
          loadTransactions()
        ])

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [token, navigate])

  // -------------------------
  // ADD ACCOUNT
  // -------------------------

  const handleAddAccount = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_URL}/accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: accountName,
          account_type: accountType,
          balance: Number(balance)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add account')
      }

      await loadAccounts()

      setAccountName('')
      setAccountType('Bank')
      setBalance('')

    } catch (err) {
      setError(err.message)
    }
  }

  // -------------------------
  // ADD TRANSACTION
  // -------------------------

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_URL}/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          transaction_type: transactionType,
          account_id: Number(transactionAccount),
          category_id: Number(transactionCategory)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add transaction')
      }

      await Promise.all([
        loadTransactions(),
        loadAccounts()
      ])

      setDescription('')
      setAmount('')
      setTransactionType('expense')
      setTransactionAccount('')
      setTransactionCategory('')

    } catch (err) {
      setError(err.message)
    }
  }

  // -------------------------
  // DELETE TRANSACTION
  // -------------------------

  const handleDeleteTransaction = async (transactionId) => {
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transactionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete transaction')
      }

      await Promise.all([
        loadTransactions(),
        loadAccounts()
      ])

    } catch (err) {
      setError(err.message)
    }
  }

  // -------------------------
  // FINANCIAL SUMMARY
  // -------------------------

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0
  )

  const totalIncome = transactions
    .filter(
      (transaction) => transaction.transaction_type === 'income'
    )
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    )

  const totalExpenses = transactions
    .filter(
      (transaction) => transaction.transaction_type === 'expense'
    )
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    )

  // -------------------------
  // EXPENSE CHART
  // -------------------------

  const expenseByCategory = categories.map((category) => {
    const total = transactions
      .filter(
        (transaction) =>
          transaction.transaction_type === 'expense' &&
          transaction.category_id === category.id
      )
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
      )

    return {
      name: category.name,
      amount: total
    }
  })

  const chartCategories = expenseByCategory.filter(
    (category) => category.amount > 0
  )

  const chartData = {
    labels: chartCategories.map((category) => category.name),
    datasets: [
      {
        data: chartCategories.map((category) => category.amount),

        backgroundColor: [
          '#0d6efd',
          '#198754',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fd7e14',
          '#20c997',
          '#6c757d'
        ],

        borderWidth: 1
      }
    ]
  }

  // -------------------------
  // HELPER: CATEGORY NAME
  // -------------------------

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    )

    return category ? category.name : 'Unknown'
  }

  const getAccountName = (accountId) => {
    const account = accounts.find(
      (item) => item.id === accountId
    )

    return account ? account.name : 'Unknown'
  }

  // -------------------------
  // LOADING STATE
  // -------------------------

  if (!token) {
    return null
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  // -------------------------
  // DASHBOARD UI
  // -------------------------

  return (
    <div className="bg-light min-vh-100">

      {/* NAVBAR */}

        <nav className="navbar navbar-dark bg-dark shadow-sm mb-4">
  <div className="container">

    <div>
      <span className="navbar-brand fw-bold fs-4">
        SpendWise
      </span>

      <span className="text-secondary small ms-2">
        Personal Finance
      </span>
    </div>

    <div className="d-flex align-items-center gap-3">

      <span className="text-white d-none d-sm-inline">
        Hello, {user?.name}
      </span>

      <button
        className="btn btn-outline-light btn-sm"
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>

  </div>
</nav>

      <div className="container pb-5">

          <div className="mb-4">

  <h2 className="fw-bold mb-1">
    Financial Dashboard
  </h2>

  <p className="text-muted mb-0">
    Track your accounts, income and expenses in one place.
  </p>

</div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        {/* SUMMARY CARDS */}

<div className="row g-4 mb-4">

  <div className="col-md-4">

    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">

          <div>
            <p className="text-muted mb-2">
              Total Balance
            </p>

            <h3 className="fw-bold mb-0">
              ₹{totalBalance.toFixed(2)}
            </h3>
          </div>

          <span className="badge bg-primary-subtle text-primary">
            Balance
          </span>

        </div>

      </div>
    </div>

  </div>


  <div className="col-md-4">

    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">

          <div>
            <p className="text-muted mb-2">
              Total Income
            </p>

            <h3 className="fw-bold text-success mb-0">
              ₹{totalIncome.toFixed(2)}
            </h3>
          </div>

          <span className="badge bg-success-subtle text-success">
            Income
          </span>

        </div>

      </div>
    </div>

  </div>


  <div className="col-md-4">

    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">

          <div>
            <p className="text-muted mb-2">
              Total Expenses
            </p>

            <h3 className="fw-bold text-danger mb-0">
              ₹{totalExpenses.toFixed(2)}
            </h3>
          </div>

          <span className="badge bg-danger-subtle text-danger">
            Expenses
          </span>

        </div>

      </div>
    </div>

  </div>

</div>

        {/* EXPENSE BREAKDOWN CHART */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">

            <h4 className="mb-4">
              Expense Breakdown
            </h4>

            {totalExpenses === 0 ? (
              <div className="alert alert-info">
                No expenses recorded yet.
              </div>
            ) : (
              <div
                style={{
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
              >
                <Doughnut data={chartData} />
              </div>
            )}

          </div>
        </div>

           {/* ACCOUNTS */}

<div className="card border-0 shadow-sm mb-4">
  <div className="card-body p-4">

    <div className="d-flex justify-content-between align-items-center mb-4">

      <div>
        <h4 className="fw-bold mb-1">
          Your Accounts
        </h4>

        <p className="text-muted mb-0">
          Manage your bank accounts, cash and other balances.
        </p>
      </div>

      <span className="badge bg-primary-subtle text-primary">
        {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
      </span>

    </div>

    {accounts.length === 0 ? (

      <div className="text-center py-4">

        <h5 className="text-muted">
          No accounts yet
        </h5>

        <p className="text-muted mb-0">
          Create your first account below to start tracking your finances.
        </p>

      </div>

    ) : (

      <div className="row g-3 mb-4">

        {accounts.map((account) => (

          <div
            className="col-md-6 col-lg-4"
            key={account.id}
          >

            <div className="card border h-100">

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>
                    <h5 className="fw-bold mb-1">
                      {account.name}
                    </h5>

                    <span className="text-muted small">
                      {account.account_type}
                    </span>
                  </div>

                  <span className="badge bg-primary-subtle text-primary">
                    Account
                  </span>

                </div>

                <hr />

                <p className="text-muted mb-1">
                  Available Balance
                </p>

                <h4 className="fw-bold text-primary mb-0">
                  ₹{Number(account.balance).toFixed(2)}
                </h4>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

    {/* ADD ACCOUNT */}

    <div className="border-top pt-4">

      <h5 className="fw-bold mb-3">
        Add Account
      </h5>

      <form onSubmit={handleAddAccount}>

        <div className="row g-3">

          <div className="col-md-4">

            <label className="form-label">
              Account Name
            </label>

            <input
              className="form-control"
              type="text"
              placeholder="e.g. SBI Savings"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />

          </div>

          <div className="col-md-3">

            <label className="form-label">
              Account Type
            </label>

            <select
              className="form-select"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="Bank">
                Bank
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Credit Card">
                Credit Card
              </option>

              <option value="Savings">
                Savings
              </option>

            </select>

          </div>

          <div className="col-md-3">

            <label className="form-label">
              Initial Balance
            </label>

            <input
              className="form-control"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />

          </div>

          <div className="col-md-2 d-flex align-items-end">

            <button
              className="btn btn-primary w-100"
              type="submit"
            >
              Add Account
            </button>

          </div>

        </div>

      </form>

    </div>

  </div>
</div>  


        {/* ADD TRANSACTION */}

<div className="card border-0 shadow-sm mb-4">
  <div className="card-body p-4">

    <div className="mb-4">

      <h4 className="fw-bold mb-1">
        Add Transaction
      </h4>

      <p className="text-muted mb-0">
        Record your income and expenses.
      </p>

    </div>

    {accounts.length === 0 && (
      <div className="alert alert-warning">
        <strong>Create an account first.</strong>{' '}
        You need at least one account before adding a transaction.
      </div>
    )}

    <form onSubmit={handleAddTransaction}>

      <div className="row g-3">

        {/* DESCRIPTION */}

        <div className="col-md-6">

          <label className="form-label">
            Description
          </label>

          <input
            className="form-control"
            type="text"
            placeholder="e.g. Grocery shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={accounts.length === 0}
          />

        </div>

        {/* AMOUNT */}

        <div className="col-md-3">

          <label className="form-label">
            Amount
          </label>

          <div className="input-group">

            <span className="input-group-text">
              ₹
            </span>

            <input
              className="form-control"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={accounts.length === 0}
            />

          </div>

        </div>

        {/* TYPE */}

        <div className="col-md-3">

          <label className="form-label">
            Transaction Type
          </label>

          <select
            className="form-select"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            disabled={accounts.length === 0}
          >

            <option value="expense">
              Expense
            </option>

            <option value="income">
              Income
            </option>

          </select>

        </div>

        {/* ACCOUNT */}

        <div className="col-md-6">

          <label className="form-label">
            Account
          </label>

          <select
            className="form-select"
            value={transactionAccount}
            onChange={(e) => setTransactionAccount(e.target.value)}
            required
            disabled={accounts.length === 0}
          >

            <option value="">
              {accounts.length === 0
                ? 'Create an account first'
                : 'Select account'}
            </option>

            {accounts.map((account) => (

              <option
                key={account.id}
                value={account.id}
              >
                {account.name} — ₹{Number(account.balance).toFixed(2)}
              </option>

            ))}

          </select>

        </div>

        {/* CATEGORY */}

        <div className="col-md-6">

          <label className="form-label">
            Category
          </label>

          <select
            className="form-select"
            value={transactionCategory}
            onChange={(e) => setTransactionCategory(e.target.value)}
            required
            disabled={accounts.length === 0}
          >

            <option value="">
              Select category
            </option>

            {categories.map((category) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            ))}

          </select>

        </div>

        {/* BUTTON */}

        <div className="col-12">

          <button
            className="btn btn-success"
            type="submit"
            disabled={accounts.length === 0}
          >
            {accounts.length === 0
              ? 'Create an Account First'
              : 'Add Transaction'}
          </button>

        </div>

      </div>

    </form>

  </div>
</div>
{/* RECENT TRANSACTIONS */}

<div className="card border-0 shadow-sm mb-4">
  <div className="card-body p-4">

    <div className="d-flex justify-content-between align-items-center mb-4">

      <div>
        <h4 className="fw-bold mb-1">
          Recent Transactions
        </h4>

        <p className="text-muted mb-0">
          View and manage your recent financial activity.
        </p>
      </div>

      <span className="badge bg-secondary-subtle text-secondary">
        {transactions.length} {transactions.length === 1 ? 'Transaction' : 'Transactions'}
      </span>

    </div>

    {transactions.length === 0 ? (

      <div className="text-center py-5">

        <h5 className="text-muted">
          No transactions yet
        </h5>

        <p className="text-muted mb-0">
          Your income and expenses will appear here.
        </p>

      </div>

    ) : (

      <div className="table-responsive">

        <table className="table table-hover align-middle mb-0">

          <thead className="table-light">

            <tr>
              <th>Description</th>
              <th>Account</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th className="text-end">Action</th>
            </tr>

          </thead>

          <tbody>

            {[...transactions]
              .sort(
                (a, b) =>
                  new Date(b.transaction_date) -
                  new Date(a.transaction_date)
              )
              .map((transaction) => (

                <tr key={transaction.id}>

                  <td>
                    <span className="fw-semibold">
                      {transaction.description}
                    </span>
                  </td>

                  <td>
                    {getAccountName(transaction.account_id)}
                  </td>

                  <td>
                    <span className="badge bg-light text-dark border">
                      {getCategoryName(transaction.category_id)}
                    </span>
                  </td>

                  <td>

                    <span
                      className={
                        transaction.transaction_type === 'income'
                          ? 'badge bg-success-subtle text-success'
                          : 'badge bg-danger-subtle text-danger'
                      }
                    >
                      {transaction.transaction_type}
                    </span>

                  </td>

                  <td>

                    <span
                      className={
                        transaction.transaction_type === 'income'
                          ? 'fw-semibold text-success'
                          : 'fw-semibold text-danger'
                      }
                    >
                      {transaction.transaction_type === 'income'
                        ? '+'
                        : '-'}
                      ₹{Number(transaction.amount).toFixed(2)}
                    </span>

                  </td>

                  <td className="text-end">

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        handleDeleteTransaction(transaction.id)
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    )}

  </div>
</div>
      </div>
    </div>
  )
}

export default Dashboard