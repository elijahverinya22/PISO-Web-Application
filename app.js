const STORAGE_KEY = 'piso_app_data';

// --- State Management ---
let state = {
  user: null,
  income: 0,
  debts: [], // { id, name, amount, apr, minPayment }
  goals: [], // { id, name, cost, value }
};

async function loadState() {
  try {
    const res = await fetch('/api/state');
    if (res.ok) {
      const data = await res.json();
      Object.assign(state, data);
      return true;
    }
  } catch (e) {
    console.log("Failed to load state from backend", e);
  }
  return false;
}

async function saveState() {
  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  } catch (e) {
    console.error("Failed to save state to backend", e);
  }
}

// --- Router ---
const appDiv = document.getElementById('app');

function navigateTo(viewFn) {
  appDiv.innerHTML = '';
  appDiv.style.opacity = 0;
  
  const viewElement = viewFn();
  
  setTimeout(() => {
    appDiv.style.opacity = 1;
  }, 50);
  
  appDiv.appendChild(viewElement);
}

// --- Utilities ---
function formatMoney(num) {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(num) {
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function parseMoney(str) {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/,/g, '')) || 0;
}

// --- UI Global Behaviors ---
document.addEventListener('focusin', (e) => {
  if (e.target.classList.contains('money-input') || e.target.classList.contains('percent-input')) {
    let val = parseMoney(e.target.value);
    e.target.value = val === 0 ? '' : val;
  }
});
document.addEventListener('focusout', (e) => {
  if (e.target.classList.contains('money-input')) {
    let val = parseMoney(e.target.value);
    e.target.value = formatMoney(val);
  } else if (e.target.classList.contains('percent-input')) {
    let val = parseMoney(e.target.value);
    e.target.value = formatPercent(val);
  }
});
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('money-input') || e.target.classList.contains('percent-input')) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
  }
});

document.addEventListener('click', (e) => {
  const item = e.target.closest('.dynamic-list-item');
  const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL';
  const isButton = e.target.closest('button');

  if (item) {
    if (!item.classList.contains('locked-open')) {
      document.querySelectorAll('.dynamic-list-item').forEach(el => {
        el.classList.remove('locked-open');
        updateSummaryName(el);
      });
      item.classList.add('locked-open');
    } else {
      if (!isInput && !isButton) {
        item.classList.remove('locked-open');
        updateSummaryName(item);
      }
    }
  } else {
    if (!isButton) {
      document.querySelectorAll('.dynamic-list-item').forEach(el => {
        el.classList.remove('locked-open');
        updateSummaryName(el);
      });
    }
  }
});
function updateSummaryName(el) {
  const nameInput = el.querySelector('.debt-name') || el.querySelector('.goal-name');
  const summarySpan = el.querySelector('.summary-name');
  if (nameInput && summarySpan) {
    summarySpan.textContent = nameInput.value.trim() || 'New Item';
  }
}

// --- Utility Components ---
function showCustomAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fade-in';
    
    const modal = document.createElement('div');
    modal.className = 'modal-card text-center';
    
    const text = document.createElement('p');
    text.className = 'mb-6';
    text.textContent = message;
    text.style.color = 'var(--text-color)';
    text.style.fontSize = '1.1rem';
    text.style.fontWeight = '500';
    text.style.lineHeight = '1.5';
    
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'OK';
    btn.style.width = '100%';
    btn.onclick = () => {
      document.body.removeChild(overlay);
      resolve();
    };
    
    modal.appendChild(text);
    modal.appendChild(btn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  });
}

function createHeader(title, showLogout = true) {
  const header = document.createElement('header');
  header.className = 'header';
  header.style.position = 'relative';
  
  const logo = document.createElement('div');
  logo.innerHTML = `<img src="./logo.png" alt="PISO" style="height: 48px; object-fit: contain;">`;
  header.appendChild(logo);
  
  const titleDiv = document.createElement('div');
  titleDiv.textContent = title.toUpperCase();
  titleDiv.style.fontSize = '2.25rem';
  titleDiv.style.fontWeight = '800';
  titleDiv.style.color = 'var(--primary-color)';
  titleDiv.style.position = 'absolute';
  titleDiv.style.left = '50%';
  titleDiv.style.transform = 'translateX(-50%)';
  titleDiv.style.textAlign = 'center';
  header.appendChild(titleDiv);
  
  if (showLogout && state.user) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = async () => {
      try { await fetch('/api/logout', { method: 'POST' }); } catch(e) {}
      state.user = null;
      state.income = 0;
      state.debts = [];
      state.goals = [];
      navigateTo(LoginView);
    };
    header.appendChild(logoutBtn);
  }
  
  return header;
}

// 1. Login/Registration View (Phase 4 Simulation)
function LoginView() {
  const container = document.createElement('div');
  container.className = 'auth-container flex items-center justify-center';
  container.style.minHeight = '100vh';
  
  const card = document.createElement('div');
  card.className = 'card fade-in text-center';
  card.style.maxWidth = '400px';
  card.style.width = '100%';
  const title = document.createElement('h2');
  title.style.fontSize = '2rem';
  title.style.marginBottom = '0.25rem';
  title.style.display = 'flex';
  title.style.alignItems = 'center';
  title.style.justifyContent = 'center';
  title.style.gap = '0.5rem';
  title.style.whiteSpace = 'nowrap';
  title.innerHTML = `Welcome to <img src="./log in.png" alt="PISO" style="height: 40px; object-fit: contain;">`;
  
  const desc = document.createElement('p');
  desc.className = 'mb-6 text-secondary';
  desc.textContent = 'Payment Insight & Savings Optimizer';
  
  let isLoginMode = true;
  const form = document.createElement('form');
  const errorMsg = document.createElement('p');
  errorMsg.style.color = 'var(--error-color)';
  errorMsg.style.marginBottom = '1rem';
  
  const renderForm = () => {
    errorMsg.textContent = '';
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await res.json();
        
        if (result.success) {
          state.user = result.email;
          const loaded = await loadState();
          if (!loaded) {
            state.income = 0;
            state.debts = [];
            state.goals = [];
          }
          navigateTo(DashboardView);
        } else {
          errorMsg.textContent = result.error || 'Authentication failed';
        }
      } catch (err) {
        console.error("Fetch error:", err);
        errorMsg.textContent = 'Network error: Please make sure you are accessing the site via http://127.0.0.1:8080 and that the backend server is running.';
      }
    };
    
    form.innerHTML = `
      <div class="form-group" style="text-align: left;">
        <label for="email">Email Address</label>
        <input type="email" id="email" class="form-control" required />
      </div>
      <div class="form-group" style="text-align: left;">
        <label for="password">Password</label>
        <input type="password" id="password" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block mt-4">${isLoginMode ? 'Login' : 'Create Account'}</button>
    `;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-outline btn-block mt-4';
    toggleBtn.textContent = isLoginMode ? 'Need an account? Register' : 'Already have an account? Login';
    toggleBtn.onclick = () => {
      isLoginMode = !isLoginMode;
      renderForm();
    };
    
    card.innerHTML = '';
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(errorMsg);
    card.appendChild(form);
    card.appendChild(toggleBtn);
  };
  
  renderForm();
  container.appendChild(card);
  
  return container;
}

// 2. Dashboard View / Data Entry (Phase 1)
function DashboardView() {
  const container = document.createElement('div');
  container.appendChild(createHeader('Data Entry Dashboard'));
  
  const content = document.createElement('div');
  content.className = 'grid gap-6 md:grid-cols-2';
  
  // Left Column: Income and Debts
  const leftCol = document.createElement('div');
  
  const incomeCard = document.createElement('div');
  incomeCard.className = 'card mb-6';
  incomeCard.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 style="margin:0;">Monthly Income</h3>
      <!-- Invisible button to perfectly match the height/baseline of the '+ Add Goal' button in the right column -->
      <button class="btn btn-secondary" style="visibility: hidden; pointer-events: none;">+ Align</button>
    </div>
    <div class="form-group">
      <label>Total Monthly Income (PHP)</label>
      <input type="text" id="incomeInput" class="form-control money-input" value="${formatMoney(state.income || 0)}" />
    </div>
  `;
  
  const debtsCard = document.createElement('div');
  debtsCard.className = 'card mb-6';
  const debtsHeader = document.createElement('div');
  debtsHeader.className = 'flex justify-between items-center mb-4';
  debtsHeader.innerHTML = `<h3 style="margin:0;">Active Debts</h3>`;
  const addDebtBtn = document.createElement('button');
  addDebtBtn.className = 'btn btn-secondary';
  addDebtBtn.textContent = '+ Add Debt';
  debtsHeader.appendChild(addDebtBtn);
  debtsCard.appendChild(debtsHeader);
  
  const debtsList = document.createElement('div');
  debtsList.id = 'debtsList';
  debtsCard.appendChild(debtsList);
  
  leftCol.appendChild(incomeCard);
  leftCol.appendChild(debtsCard);
  
  // Right Column: Goals and Actions
  const rightCol = document.createElement('div');
  
  const goalsCard = document.createElement('div');
  goalsCard.className = 'card mb-6';
  const goalsHeader = document.createElement('div');
  goalsHeader.className = 'flex justify-between items-center mb-4';
  goalsHeader.innerHTML = `<h3 style="margin:0;">Financial Goals / Investments</h3>`;
  const addGoalBtn = document.createElement('button');
  addGoalBtn.className = 'btn btn-secondary';
  addGoalBtn.textContent = '+ Add Goal';
  goalsHeader.appendChild(addGoalBtn);
  goalsCard.appendChild(goalsHeader);
  
  const goalsList = document.createElement('div');
  goalsList.id = 'goalsList';
  goalsCard.appendChild(goalsList);
  
  const actionsCard = document.createElement('div');
  actionsCard.className = 'card advice-card text-center';
  actionsCard.innerHTML = `
    <h3 class="mb-4">Ready to Optimize?</h3>
    <p class="mb-6">Once you have entered all your income, debts, and goals, proceed to the optimization engine.</p>
  `;
  const optimizeBtn = document.createElement('button');
  optimizeBtn.className = 'btn btn-primary btn-block';
  optimizeBtn.textContent = 'Run Optimization';
  optimizeBtn.id = 'btn-wizard';
  optimizeBtn.onclick = async () => {
    await saveDataFromInputs();
    if (state.income <= 0) {
      await showCustomAlert("Insufficient balance: Your Total Monthly Income must be greater than 0.00 to run the optimization wizard.");
      return;
    }
    saveState();
    navigateTo(OptimizationWizardView);
  };
  actionsCard.appendChild(optimizeBtn);
  
  rightCol.appendChild(goalsCard);
  rightCol.appendChild(actionsCard);
  
  content.appendChild(leftCol);
  content.appendChild(rightCol);
  container.appendChild(content);
  
  function renderDebts() {
    debtsList.innerHTML = '';
    debtsHeader.className = `flex justify-between items-center ${state.debts.length === 0 ? '' : 'mb-4'}`;
    state.debts.forEach((debt, index) => {
      const isNew = index === state.debts.length - 1 && debt.name === '' && debt.amount === 0;
      const item = document.createElement('div');
      item.className = `dynamic-list-item ${isNew ? 'locked-open' : ''}`;
      
      const totalAmount = debt.amount + (debt.paid || 0);
      const progress = totalAmount > 0 ? ((debt.paid || 0) / totalAmount) * 100 : 0;
      item.style.setProperty('--progress', `${progress}%`);
      
      item.innerHTML = `
        <div class="summary-view">
          <span class="summary-name">${debt.name || 'New Item'}</span>
        </div>
        <div class="remove-btn-wrapper">
          <button class="btn btn-primary remove-debt" data-index="${index}">X</button>
        </div>
        <div class="details-grid grid gap-4 md:grid-cols-2">
          <div class="form-group">
            <label>Debt Name</label>
            <input type="text" class="form-control debt-name" value="${debt.name}">
          </div>
          <div class="form-group">
            <label>Amount Owed (PHP)</label>
            <input type="text" class="form-control debt-amount money-input" value="${formatMoney(debt.amount)}">
          </div>
          <div class="form-group">
            <label>Interest Rate (APR %)</label>
            <input type="text" class="form-control debt-apr percent-input" value="${formatPercent(debt.apr)}">
          </div>
          <div class="form-group">
            <label>Minimum Payment (PHP)</label>
            <input type="text" class="form-control debt-min money-input" value="${formatMoney(debt.minPayment)}">
          </div>
          <div class="form-group" style="user-select: none;">
            <label>Total Paid (PHP)</label>
            <input type="text" class="form-control readonly-input" value="${formatMoney(debt.paid || 0)}" readonly>
          </div>
        </div>
      `;
      debtsList.appendChild(item);
    });
    
    debtsList.querySelectorAll('.remove-debt').forEach(btn => {
      btn.onclick = async (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        await saveDataFromInputs();
        state.debts.splice(idx, 1);
        await saveState();
        renderDebts();
      };
    });
  }
  
  function renderGoals() {
    goalsList.innerHTML = '';
    goalsHeader.className = `flex justify-between items-center ${state.goals.length === 0 ? '' : 'mb-4'}`;
    state.goals.forEach((goal, index) => {
      const isNew = index === state.goals.length - 1 && goal.name === '' && goal.cost === 0;
      const item = document.createElement('div');
      item.className = `dynamic-list-item ${isNew ? 'locked-open' : ''}`;
      
      const totalCost = goal.cost + (goal.paid || 0);
      const progress = totalCost > 0 ? ((goal.paid || 0) / totalCost) * 100 : 0;
      item.style.setProperty('--progress', `${progress}%`);
      
      item.innerHTML = `
        <div class="summary-view">
          <span class="summary-name">${goal.name || 'New Item'}</span>
        </div>
        <div class="remove-btn-wrapper">
          <button class="btn btn-primary remove-goal" data-index="${index}">X</button>
        </div>
        <div class="details-grid grid gap-4 md:grid-cols-2">
          <div class="form-group md:col-span-2" style="grid-column: span 2;">
            <label>Goal / Investment Name</label>
            <input type="text" class="form-control goal-name" value="${goal.name}">
          </div>
          <div class="form-group">
            <label>Fund Cost (PHP)</label>
            <input type="text" class="form-control goal-cost money-input" value="${formatMoney(goal.cost)}">
          </div>
          <div class="form-group">
            <label>Return Value (PHP)</label>
            <input type="text" class="form-control goal-value money-input" value="${formatMoney(goal.value)}">
          </div>
          <div class="form-group" style="user-select: none;">
            <label>Total Funded (PHP)</label>
            <input type="text" class="form-control readonly-input" value="${formatMoney(goal.paid || 0)}" readonly>
          </div>
        </div>
      `;
      goalsList.appendChild(item);
    });
    
    goalsList.querySelectorAll('.remove-goal').forEach(btn => {
      btn.onclick = async (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        await saveDataFromInputs();
        state.goals.splice(idx, 1);
        await saveState();
        renderGoals();
      };
    });
  }
  
  async function saveDataFromInputs() {
    const incInput = document.getElementById('incomeInput');
    if (incInput) state.income = parseMoney(incInput.value);
    
    const debtItems = debtsList.querySelectorAll('.dynamic-list-item');
    state.debts = Array.from(debtItems).map((item, i) => ({
      name: item.querySelector('.debt-name').value.trim(),
      amount: parseMoney(item.querySelector('.debt-amount').value),
      apr: parseMoney(item.querySelector('.debt-apr').value),
      minPayment: parseMoney(item.querySelector('.debt-min').value),
      hasPaidMin: state.debts[i] ? state.debts[i].hasPaidMin : false,
      paid: state.debts[i] ? (state.debts[i].paid || 0) : 0
    }));
    
    const goalItems = goalsList.querySelectorAll('.dynamic-list-item');
    state.goals = Array.from(goalItems).map((item, i) => ({
      name: item.querySelector('.goal-name').value.trim(),
      cost: parseMoney(item.querySelector('.goal-cost').value),
      value: parseMoney(item.querySelector('.goal-value').value),
      paid: state.goals[i] ? (state.goals[i].paid || 0) : 0
    }));
    
    await saveState();
  }
  
  addDebtBtn.onclick = async () => {
    await saveDataFromInputs();
    state.debts.push({ name: '', amount: 0, apr: 0, minPayment: 0, hasPaidMin: false, paid: 0 });
    renderDebts();
  };
  
  addGoalBtn.onclick = async () => {
    await saveDataFromInputs();
    state.goals.push({ name: '', cost: 0, value: 0, paid: 0 });
    renderGoals();
  };
  
  renderDebts();
  renderGoals();
  
  return container;
}

// --- Interactive Optimization Wizard (Phase 2 & 3) ---
function OptimizationWizardView() {
  const container = document.createElement('div');
  container.appendChild(createHeader('Interactive Optimization Wizard'));
  
  // Deep clone so we don't commit until the end
  let workingDebts = JSON.parse(JSON.stringify(state.debts));
  let workingGoals = JSON.parse(JSON.stringify(state.goals));
  
  // Track unpaid minimums
  const unpaidDebts = workingDebts.filter(d => !d.hasPaidMin && d.minPayment > 0);
  const totalMin = unpaidDebts.reduce((sum, d) => sum + d.minPayment, 0);

  let phase = 'minimums'; // 'minimums', 'debts', 'goals', 'summary'
  if (unpaidDebts.length === 0) {
    phase = 'debts';
  }
  
  let workingCash = state.income;
  
  let currentDebtIndex = 0;
  let currentGoalIndex = 0;
  
  // Sort debts and goals immediately for the sequence
  workingDebts.sort((a, b) => b.apr - a.apr);
  workingGoals.sort((a, b) => {
    const yieldA = a.cost > 0 ? a.value / a.cost : 0;
    const yieldB = b.cost > 0 ? b.value / b.cost : 0;
    return yieldB - yieldA;
  });
  
  const contentDiv = document.createElement('div');
  container.appendChild(contentDiv);
  
  const renderStep = () => {
    contentDiv.innerHTML = '';
    
    // Top Info Bar
    const infoBar = document.createElement('div');
    infoBar.className = 'grid gap-6 md:grid-cols-2 mb-8 fade-in';
    
    const phaseCol = document.createElement('div');
    phaseCol.className = 'card metric-card';
    const phaseLabel = document.createElement('div');
    phaseLabel.className = 'metric-label';
    phaseLabel.textContent = 'Current Phase';
    const phaseTitle = document.createElement('div');
    phaseTitle.className = 'metric-value';
    phaseTitle.style.fontSize = '2rem';
    phaseTitle.textContent = phase === 'minimums' ? '1 - MINIMUM' : phase === 'debts' ? '2 - DEBTS' : phase === 'goals' ? '3 - INVEST' : 'SUMMARY';
    phaseCol.appendChild(phaseLabel);
    phaseCol.appendChild(phaseTitle);
    
    const cashCol = document.createElement('div');
    cashCol.className = 'card metric-card';
    cashCol.innerHTML = `
      <div class="metric-label">Available Cash</div>
      <div class="metric-value text-accent" style="font-size:2rem;">PHP ${formatMoney(workingCash)}</div>
    `;
    
    infoBar.appendChild(phaseCol);
    infoBar.appendChild(cashCol);
    contentDiv.appendChild(infoBar);

    if ((phase === 'minimums' || phase === 'debts') && workingDebts.length > 0) {
      const tableCard = document.createElement('div');
      tableCard.className = 'card mb-6 fade-in';
      tableCard.innerHTML = `
        <h3 class="mb-4">Active Debts</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Debt Name</th>
              <th>Interest Rate (APR %)</th>
              <th>Amount Owed</th>
              <th>Minimum Payment</th>
            </tr>
          </thead>
          <tbody>
            ${workingDebts.map((d, i) => `
              <tr style="${phase === 'debts' && i === currentDebtIndex ? 'background-color: #f0fdf4;' : ''}">
                <td class="font-semibold">${d.name} ${phase === 'debts' && i === currentDebtIndex ? '<span style="color:var(--accent-color); font-size:12px; margin-left:8px;">★ Current Focus</span>' : ''}</td>
                <td>${formatPercent(d.apr)}%</td>
                <td>PHP ${formatMoney(d.amount)}</td>
                <td>PHP ${formatMoney(d.minPayment)}</td>
              </tr>
            `).join('')}
          </tbody>
          ${phase === 'minimums' ? `
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-bold" style="padding: 1rem; border-top: 2px solid var(--border-color);">Total Minimum Payment</td>
                <td class="font-bold" style="padding: 1rem; border-top: 2px solid var(--border-color);">PHP ${formatMoney(totalMin)}</td>
              </tr>
            </tfoot>
          ` : ''}
        </table>
      `;
      contentDiv.appendChild(tableCard);
    } else if (phase === 'goals' && workingGoals.length > 0) {
      const tableCard = document.createElement('div');
      tableCard.className = 'card mb-6 fade-in';
      tableCard.innerHTML = `
        <h3 class="mb-4">Investments / Goals</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Goal Name</th>
              <th>Yield Ratio</th>
              <th>Fund Cost</th>
              <th>Return Value</th>
            </tr>
          </thead>
          <tbody>
            ${workingGoals.map((g, i) => {
              const yieldRatio = g.cost > 0 ? (g.value / g.cost).toFixed(2) : 0;
              return `
                <tr style="${phase === 'goals' && i === currentGoalIndex ? 'background-color: #f0fdf4;' : ''}">
                  <td class="font-semibold">${g.name} ${phase === 'goals' && i === currentGoalIndex ? '<span style="color:var(--accent-color); font-size:12px; margin-left:8px;">★ Current Focus</span>' : ''}</td>
                  <td>${yieldRatio}x</td>
                  <td>PHP ${formatMoney(g.cost)}</td>
                  <td>PHP ${formatMoney(g.value)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      contentDiv.appendChild(tableCard);
    }
    
    const card = document.createElement('div');
    card.className = 'card fade-in';
    
    if (phase === 'minimums') {
      card.innerHTML = `
        <h3 class="mb-4">Minimum Mandatory Payments</h3>
        <p class="mb-3">Your total minimum monthly payments across all debts equals <strong>PHP ${formatMoney(totalMin)}</strong>.</p>
        ${workingCash < totalMin ? `<div class="alert-card mb-3"><strong>Warning:</strong> You do not have enough cash to cover minimums. Skipping is risky!</div>` : ''}
        <p class="mb-4">Would you like to pay these minimums right now?</p>
        <div class="flex gap-4">
          <button id="btn-pay-min" class="btn btn-primary">Pay Minimum</button>
          <button id="btn-skip-min" class="btn btn-outline">Skip</button>
        </div>
      `;
      contentDiv.appendChild(card);
      
      setTimeout(() => {
        document.getElementById('btn-pay-min').onclick = () => {
          workingCash -= totalMin;
          workingDebts.forEach(d => {
            if (!d.hasPaidMin && d.minPayment > 0) {
              d.amount = Math.max(0, d.amount - d.minPayment);
              d.paid = (d.paid || 0) + d.minPayment;
              d.hasPaidMin = true;
            }
          });
          workingDebts = workingDebts.filter(d => d.amount > 0);
          phase = 'debts';
          renderStep();
        };
        document.getElementById('btn-skip-min').onclick = () => {
          phase = 'debts';
          renderStep();
        };
      }, 0);
      
    } else if (phase === 'debts') {
      if (currentDebtIndex >= workingDebts.length || workingCash <= 0) {
        phase = 'goals';
        renderStep();
        return;
      }
      
      const debt = workingDebts[currentDebtIndex];
      card.innerHTML = `
        <h3 class="mb-4">Debt Avalanche Method</h3>
        <p class="mb-2">Highest APR Debt: <strong>${debt.name} (${formatPercent(debt.apr)}%)</strong></p>
        <p class="mb-2">Remaining Cost: <strong>PHP ${formatMoney(debt.amount)}</strong></p>
        <p class="mb-4">Would you like to allocate cash onto this debt to minimize your interest?</p>
        <div class="flex gap-4">
          <button id="btn-pay-debt" class="btn btn-primary">Pay Debt</button>
          <button id="btn-skip-debt" class="btn btn-outline">Skip</button>
        </div>
      `;
      contentDiv.appendChild(card);
      
      setTimeout(() => {
        document.getElementById('btn-pay-debt').onclick = () => {
          const payment = Math.min(workingCash, debt.amount);
          workingCash -= payment;
          debt.amount -= payment;
          debt.paid = (debt.paid || 0) + payment;
          if (debt.amount <= 0) {
            workingDebts.splice(currentDebtIndex, 1);
          } else {
            currentDebtIndex++;
          }
          renderStep();
        };
        document.getElementById('btn-skip-debt').onclick = () => {
          currentDebtIndex++;
          renderStep();
        };
      }, 0);
      
    } else if (phase === 'goals') {
      if (currentGoalIndex >= workingGoals.length || workingCash <= 0) {
        phase = 'summary';
        renderStep();
        return;
      }
      
      const goal = workingGoals[currentGoalIndex];
      const yieldRatio = goal.cost > 0 ? (goal.value / goal.cost).toFixed(2) : 0;
      
      card.innerHTML = `
        <h3 class="mb-4">Fractional Knapsack</h3>
        <p class="mb-2">Highest Yield Investment: <strong>${goal.name} (Yield: ${yieldRatio}x)</strong></p>
        <p class="mb-2">Remaining Cost: <strong>PHP ${formatMoney(goal.cost)}</strong></p>
        <p class="mb-4">Would you like to allocate remaining cash to this investment?</p>
        <div class="flex gap-4">
          <button id="btn-fund-goal" class="btn btn-primary">Pay Cost</button>
          <button id="btn-skip-goal" class="btn btn-outline">Skip</button>
        </div>
      `;
      contentDiv.appendChild(card);
      
      setTimeout(() => {
        document.getElementById('btn-fund-goal').onclick = () => {
          const payment = Math.min(workingCash, goal.cost);
          workingCash -= payment;
          goal.cost -= payment;
          goal.paid = (goal.paid || 0) + payment;
          currentGoalIndex++;
          renderStep();
        };
        document.getElementById('btn-skip-goal').onclick = () => {
          currentGoalIndex++;
          renderStep();
        };
      }, 0);
      
    } else if (phase === 'summary') {
      const unpaidDebts = workingDebts.length;
      const unfundedGoals = workingGoals.filter(g => g.cost > 0).length;
      
      card.className = 'card advice-card fade-in text-center';
      const debtWord = unpaidDebts === 1 ? 'debt' : 'debts';
      const invWord = unfundedGoals === 1 ? 'investment' : 'investments';
      card.innerHTML = `
        <h3 class="mb-4">Optimization Cycle Complete</h3>
        <p class="mb-6">You have completed your monthly allocations. You have ${unpaidDebts} ${debtWord} left unpaid, and ${unfundedGoals} ${invWord} left unfunded.</p>
        <button id="btn-end-cycle" class="btn btn-primary btn-block">End Cycle</button>
      `;
      contentDiv.appendChild(card);
      
      setTimeout(() => {
        document.getElementById('btn-end-cycle').onclick = async () => {
          state.income = workingCash; // Unallocated cash becomes new income/savings
          state.debts = workingDebts;
          // For goals, remove fully funded ones
          state.goals = workingGoals.filter(g => g.cost > 0);
          
          await saveState();
          await showCustomAlert('Database updated successfully! Cycle ended.');
          navigateTo(DashboardView);
        };
      }, 0);
    }
  };
  
  renderStep();
  
  const abortBtn = document.createElement('button');
  abortBtn.className = 'btn btn-abort';
  abortBtn.style.marginTop = '2rem';
  abortBtn.style.display = 'block';
  abortBtn.style.marginLeft = 'auto';
  abortBtn.style.marginRight = 'auto';
  abortBtn.textContent = 'Abort & Return to Dashboard';
  abortBtn.onclick = () => navigateTo(DashboardView);
  container.appendChild(abortBtn);
  
  return container;
}

// --- Init App ---
async function init() {
  const isLoaded = await loadState();
  if (isLoaded && state.user) {
    navigateTo(DashboardView);
  } else {
    navigateTo(LoginView);
  }
}

init();
