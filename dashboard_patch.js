// Premium responsive dashboard override — layout only, existing data/actions preserved.
function dashboardPremium(){
  refreshLoanStatuses();
  const loans=data.loans||[], customers=data.customers||[], payments=data.payments||[], expenses=data.expenses||[];
  const activeLoans=loans.filter(l=>Number(l.balance||0)>0);
  const overdue=overdueLoans();
  const dueToday=loans.filter(l=>Number(l.balance||0)>0&&l.due===today);
  const collectionToday=payments.filter(p=>p.date===today).reduce((s,p)=>s+Number(p.amount||0),0);
  const dueAmount=dueAmountToday();
  const overdueAmount=overdue.reduce((s,l)=>s+Number(l.balance||0),0);
  const outstanding=activeLoans.reduce((s,l)=>s+Number(l.balance||0),0);
  const disbursed=loans.reduce((s,l)=>s+Number(l.amount||0),0);
  const interest=loans.reduce((s,l)=>s+Number(l.interest||0),0);
  const newLoans=loans.filter(l=>String(l.createdAt||l.start||'').slice(0,7)===today.slice(0,7)).length;
  const activeCustomers=customers.filter(c=>Number(c.balance||0)>0).length;
  const monthStart=today.slice(0,8)+'01';
  const monthCollections=payments.filter(p=>p.date>=monthStart&&p.date<=today).reduce((s,p)=>s+Number(p.amount||0),0);
  const monthExpenses=expenses.filter(e=>e.date>=monthStart&&e.date<=today).reduce((s,e)=>s+Number(e.amount||0),0);
  const target=Number((data.targets?.[today.slice(0,7)]||{}).daily||dueAmount||0);
  const targetRate=target?Math.min(100,Math.round(collectionToday/target*100)):0;
  const efficiency=dueAmount?Math.round(collectionToday/dueAmount*100):0;
  const cashToday=payments.filter(p=>p.date===today&&(p.mode||'').toLowerCase()==='cash').reduce((s,p)=>s+Number(p.amount||0),0);
  const upiToday=payments.filter(p=>p.date===today&&(p.mode||'').toLowerCase()==='upi').reduce((s,p)=>s+Number(p.amount||0),0);
  const bankToday=payments.filter(p=>p.date===today&&['bank','bank transfer','neft','rtgs','imps'].includes((p.mode||'').toLowerCase())).reduce((s,p)=>s+Number(p.amount||0),0);
  const followUps=data.followUps||[];
  const followDue=followUps.filter(f=>f.date&&f.date<=today&&f.status!=='Done').slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const attention=[
    ...overdue.slice(0,4).map(l=>({type:'Overdue',name:getCustomer(l.customerId)?.name||'Customer',detail:`${l.id} · ${money(l.balance||0)} outstanding`,action:`openPayment('${l.id}')`,label:'Collect'})),
    ...dueToday.slice(0,4).map(l=>({type:'Due today',name:getCustomer(l.customerId)?.name||'Customer',detail:`${l.id} · ${money(Math.min(Number(l.balance||0),Number(l.installment||l.balance||0)))}`,action:`openPayment('${l.id}')`,label:'Collect'})),
    ...followDue.slice(0,3).map(f=>({type:'Follow-up',name:getCustomer(f.customerId)?.name||'Customer',detail:`${f.status||'Pending'} · ${f.date||''}`,action:`openFollowUp('${f.customerId||''}','${f.loanId||''}')`,label:'Open'}))
  ].slice(0,6);
  const recent=payments.slice().sort((a,b)=>(b.createdAt||b.date||'').localeCompare(a.createdAt||a.date||'')).slice(0,5);
  const upcoming=loans.filter(l=>Number(l.balance||0)>0&&l.due>today).sort((a,b)=>String(a.due).localeCompare(String(b.due))).slice(0,5);
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthBars=[];const base=new Date(today+'T00:00:00');
  for(let i=5;i>=0;i--){const d=new Date(base.getFullYear(),base.getMonth()-i,1);const key=d.toISOString().slice(0,7);const val=payments.filter(p=>String(p.date||'').slice(0,7)===key).reduce((s,p)=>s+Number(p.amount||0),0);monthBars.push({label:monthNames[d.getMonth()],value:val});}
  const maxBar=Math.max(1,...monthBars.map(x=>x.value));
  page.innerHTML=title('Dashboard','A clear view of today\'s finance operations',`<button class="btn green" onclick="openCustomer()">+ New Customer</button><button class="btn" onclick="openLoan()">+ New Loan</button><button class="btn light" onclick="openCollectionPicker()">Collect Payment</button>`)+
  `<section class="dash-hero">
    <div><span class="dash-eyebrow">TODAY · ${today}</span><h2>Good overview, fewer clicks.</h2><p>Collection, dues and attention items are grouped here so the important work is visible first.</p></div>
    <div class="dash-hero-actions"><button class="dash-hero-btn primary" onclick="openCollectionPicker()">Collect Payment <span>↗</span></button><button class="dash-hero-btn" onclick="render('dues')">View Dues <span>→</span></button></div>
  </section>
  <div class="dash-summary-grid">
    <button class="dash-summary-card" onclick="openCollectionPicker()"><span>Today's Collection</span><strong>${money(collectionToday)}</strong><small>${payments.filter(p=>p.date===today).length} payments received</small><i>↙</i></button>
    <button class="dash-summary-card" onclick="render('dues')"><span>Today's Due</span><strong>${money(dueAmount)}</strong><small>${dueToday.length} loans · ${efficiency}% collected</small><i>◷</i></button>
    <button class="dash-summary-card danger" onclick="render('dues')"><span>Overdue Amount</span><strong>${money(overdueAmount)}</strong><small>${overdue.length} loans need follow-up</small><i>!</i></button>
    <button class="dash-summary-card" onclick="render('loans')"><span>New Loans</span><strong>${newLoans}</strong><small>This month</small><i>▣</i></button>
  </div>
  <div class="dash-main-grid">
    <section class="section dash-panel collection-panel"><div class="section-head"><div><h3>Collection Progress</h3><span class="muted">Today vs collection target</span></div><b class="dash-percent">${targetRate}%</b></div>
      <div class="dash-progress"><span style="width:${targetRate}%"></span></div>
      <div class="dash-progress-meta"><div><small>Collected</small><b>${money(collectionToday)}</b></div><div><small>Target</small><b>${money(target)}</b></div><div><small>Gap</small><b>${money(Math.max(0,target-collectionToday))}</b></div></div>
    </section>
    <section class="section dash-panel"><div class="section-head"><div><h3>Money Position</h3><span class="muted">Recorded today</span></div></div>
      <div class="dash-money-grid"><div><span>Cash</span><b>${money(cashToday)}</b></div><div><span>UPI</span><b>${money(upiToday)}</b></div><div><span>Bank</span><b>${money(bankToday)}</b></div></div>
    </section>
  </div>
  <div class="dash-main-grid">
    <section class="section dash-panel"><div class="section-head"><div><h3>Needs Attention</h3><span class="muted">Priority items only</span></div><button class="btn light" onclick="render('dues')">View All</button></div>
      <div class="dash-attention-list">${attention.map(x=>`<div class="dash-attention ${x.type==='Overdue'?'is-danger':''}"><div class="dash-attention-mark">${x.type==='Overdue'?'!':x.type==='Due today'?'◷':'↗'}</div><div class="dash-attention-copy"><b>${esc(x.name)}</b><small>${esc(x.type)} · ${esc(x.detail)}</small></div><button class="mini-btn" onclick="${x.action}">${x.label}</button></div>`).join('')||'<div class="empty">Nothing needs attention right now 🎉</div>'}</div>
    </section>
    <section class="section dash-panel"><div class="section-head"><div><h3>Portfolio Snapshot</h3><span class="muted">Live totals</span></div><button class="btn light" onclick="render('reports')">Reports</button></div>
      <div class="dash-stat-list"><div><span>Active Customers</span><b>${activeCustomers}</b></div><div><span>Active Loans</span><b>${activeLoans.length}</b></div><div><span>Total Disbursed</span><b>${money(disbursed)}</b></div><div><span>Outstanding</span><b>${money(outstanding)}</b></div><div><span>Interest in Portfolio</span><b>${money(interest)}</b></div><div><span>Month Net Movement</span><b>${money(monthCollections-monthExpenses)}</b></div></div>
    </section>
  </div>
  <div class="dash-main-grid">
    <section class="section dash-panel"><div class="section-head"><div><h3>Collection Trend</h3><span class="muted">Last 6 months</span></div></div><div class="dash-bars">${monthBars.map(x=>`<div class="dash-bar-col"><div class="dash-bar" style="height:${Math.max(8,Math.round(x.value/maxBar*100))}%"></div><small>${x.label}</small></div>`).join('')}</div></section>
    <section class="section dash-panel"><div class="section-head"><div><h3>Upcoming Dues</h3><span class="muted">Next accounts</span></div><button class="btn light" onclick="render('dues')">View All</button></div>${upcoming.map(l=>{const c=getCustomer(l.customerId);return `<div class="dash-row"><div><b>${esc(c?.name||'Customer')}</b><small>${esc(l.id)} · ${esc(l.due)}</small></div><strong>${money(Math.min(Number(l.balance||0),Number(l.installment||l.balance||0)))}</strong></div>`}).join('')||'<div class="empty">No upcoming dues</div>'}</section>
  </div>
  <div class="dash-main-grid">
    <section class="section dash-panel"><div class="section-head"><div><h3>Recent Transactions</h3><span class="muted">Latest recorded payments</span></div><button class="btn light" onclick="render('collections')">View All</button></div>${recent.map(p=>{const c=getCustomer(p.customerId);return `<div class="dash-row"><div class="dash-row-icon">↙</div><div class="dash-row-grow"><b>${esc(c?.name||'Customer')} payment</b><small>${esc(p.date||'')} · ${esc(p.mode||'')}</small></div><strong class="positive">+ ${money(p.amount)}</strong></div>`}).join('')||'<div class="empty">No transactions yet</div>'}</section>
    <section class="section dash-panel quick-panel"><div class="section-head"><div><h3>Quick Actions</h3><span class="muted">Common tasks</span></div></div><div class="dash-quick-grid"><button onclick="openCustomer()"><b>＋</b><span>New Customer</span></button><button onclick="openLoan()"><b>＋</b><span>New Loan</span></button><button onclick="openCollectionPicker()"><b>₹</b><span>Collect Payment</span></button><button onclick="render('dues')"><b>◷</b><span>Today's Dues</span></button></div></section>
  </div>`;
}
dashboard=dashboardPremium;
