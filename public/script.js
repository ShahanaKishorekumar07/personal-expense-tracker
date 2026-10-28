const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const message = document.getElementById("message");

const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const saveButton = document.getElementById("saveButton");

const budgetForm = document.getElementById("budgetForm");
const budgetMonthInput = document.getElementById("budgetMonth");
const budgetAmountInput = document.getElementById("budgetAmount");
const budgetSummary = document.getElementById("budgetSummary");
const budgetProgress = document.getElementById("budgetProgress");

let transactions = [];
let editingId = null;
let expenseChart = null;

const money = amount =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);

const today = new Date();
const localDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.value = localDate;
budgetMonthInput.value = localDate.slice(0, 7);

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = isError ? "error" : "success";
}

async function loadDashboard() {
  try {
    const [summary, rows] = await Promise.all([
      api("/api/summary"),
      api("/api/transactions")
    ]);

    document.getElementById("balance").textContent =
      money(summary.balance);

    document.getElementById("income").textContent =
      money(summary.totalIncome);

    document.getElementById("expenses").textContent =
      money(summary.totalExpenses);

    transactions = rows;

    renderTransactions();
    renderChart();
    await loadBudget();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function renderTransactions() {
  transactionList.replaceChildren();

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = "No transactions yet. Add your first transaction.";

    row.appendChild(cell);
    transactionList.appendChild(row);
    return;
  }

  transactions.forEach(transaction => {
    const row = document.createElement("tr");

    const values = [
      transaction.date,
      transaction.type,
      transaction.category,
      transaction.description || "—",
      `${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}`
    ];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (index === 4) {
        cell.className =
          transaction.type === "income" ? "income-text" : "expense-text";
      }

      row.appendChild(cell);
    });

    const actions = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "action-button";
    editButton.addEventListener("click", () => editTransaction(transaction));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "action-button delete-button";
    deleteButton.addEventListener("click", () => deleteTransaction(transaction.id));

    actions.append(editButton, deleteButton);
    row.appendChild(actions);

    transactionList.appendChild(row);
  });
}

function renderChart() {
  const totals = {};

  transactions
    .filter(transaction => transaction.type === "expense")
    .forEach(transaction => {
      totals[transaction.category] =
        (totals[transaction.category] || 0) + transaction.amount;
    });

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(document.getElementById("expenseChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Expenses",
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: context =>
              `${context.label}: ${money(context.raw)}`
          }
        }
      }
    }
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const transaction = {
    type: typeInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
    description: descriptionInput.value.trim()
  };

  saveButton.disabled = true;

  try {
    const url = editingId
      ? `/api/transactions/${editingId}`
      : "/api/transactions";

    await api(url, {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(transaction)
    });

    form.reset();
    typeInput.value = "expense";
    dateInput.value = localDate;
    editingId = null;
    saveButton.textContent = "Add Transaction";

    showMessage("Transaction saved successfully.");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

function editTransaction(transaction) {
  editingId = transaction.id;

  typeInput.value = transaction.type;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  descriptionInput.value = transaction.description || "";

  const existingOption = [...categoryInput.options].find(
    option => option.value === transaction.category
  );

  if (!existingOption) {
    const option = document.createElement("option");
    option.value = transaction.category;
    option.textContent = transaction.category;
    categoryInput.appendChild(option);
  }

  categoryInput.value = transaction.category;
  saveButton.textContent = "Update Transaction";

  document.getElementById("transactionForm").scrollIntoView({
    behavior: "smooth"
  });
}

async function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  try {
    await api(`/api/transactions/${id}`, { method: "DELETE" });
    showMessage("Transaction deleted successfully.");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function loadBudget() {
  const month = budgetMonthInput.value;

  if (!month) return;

  try {
    const data = await api(`/api/budget/${month}`);

    budgetAmountInput.value = data.budget || "";

    if (data.budget === 0) {
      budgetSummary.textContent = "No budget set for this month.";
      budgetProgress.value = 0;
      return;
    }

    const percentage = (data.spent / data.budget) * 100;

    budgetSummary.textContent =
      `Spent ${money(data.spent)} of ${money(data.budget)}. ` +
      (data.remaining >= 0
        ? `${money(data.remaining)} remaining.`
        : `Over budget by ${money(-data.remaining)}.`);

    budgetProgress.value = Math.min(percentage, 100);
    budgetProgress.max = 100;

    if (percentage >= 100) {
      budgetSummary.textContent += " Budget limit reached!";
    } else if (percentage >= 80) {
      budgetSummary.textContent += " Warning: You have used at least 80% of your budget.";
    }
  } catch (error) {
    budgetSummary.textContent = error.message;
  }
}

budgetMonthInput.addEventListener("change", loadBudget);

budgetForm.addEventListener("submit", async event => {
  event.preventDefault();

  try {
    await api(`/api/budget/${budgetMonthInput.value}`, {
      method: "PUT",
      body: JSON.stringify({
        amount: Number(budgetAmountInput.value)
      })
    });

    await loadBudget();
    showMessage("Monthly budget saved successfully.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

loadDashboard();
