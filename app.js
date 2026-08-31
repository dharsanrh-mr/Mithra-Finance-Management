const KEY="finova_v5_data";const SETTINGS_KEY="finova_settings_v1";const today=new Date().toISOString().slice(0,10);
const seed={customers:[
{id:"CUS-001",name:"Kumar",mobile:"9876543210",area:"Town",occupation:"Business",borrowed:50000,balance:20000},
{id:"CUS-002",name:"Ravi",mobile:"9765432109",area:"Market Road",occupation:"Shop Owner",borrowed:30000,balance:0},
{id:"CUS-003",name:"Mani",mobile:"9654321098",area:"Main Street",occupation:"Driver",borrowed:80000,balance:35000},
{id:"CUS-004",name:"Suresh",mobile:"9543210987",area:"North Area",occupation:"Farmer",borrowed:60000,balance:12000},
{id:"CUS-005",name:"Arun",mobile:"9432109876",area:"East Street",occupation:"Mechanic",borrowed:45000,balance:15000}],
loans:[
{id:"LN-00123",customerId:"CUS-001",amount:50000,interest:10000,total:60000,paid:40000,balance:20000,due:today,status:"Active"},
{id:"LN-00124",customerId:"CUS-002",amount:30000,interest:6000,total:36000,paid:36000,balance:0,due:"2026-08-10",status:"Closed"},
{id:"LN-00125",customerId:"CUS-003",amount:80000,interest:16000,total:96000,paid:61000,balance:35000,due:"2026-08-12",status:"Overdue"},
{id:"LN-00126",customerId:"CUS-004",amount:60000,interest:12000,total:72000,paid:60000,balance:12000,due:"2026-08-16",status:"Active"}],
payments:[
{id:"RC-00101",customerId:"CUS-001",loanId:"LN-00123",amount:5000,date:today,mode:"UPI"},
{id:"RC-00100",customerId:"CUS-003",loanId:"LN-00125",amount:5000,date:"2026-08-05",mode:"Cash"},
{id:"RC-00099",customerId:"CUS-004",loanId:"LN-00126",amount:8000,date:"2026-08-14",mode:"Cash"}],
expenses:[{category:"Office",amount:2000,date:today,mode:"Cash",description:"Office supplies"}]};
let data;
try{data=JSON.parse(localStorage.getItem(KEY)||"null")||seed}catch(e){data=seed;localStorage.removeItem(KEY)}
data.customers=Array.isArray(data.customers)?data.customers:[];
data.loans=Array.isArray(data.loans)?data.loans:[];
data.payments=Array.isArray(data.payments)?data.payments:[];
data.expenses=Array.isArray(data.expenses)?data.expenses:[];
const separateSettings=(()=>{try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||"null")}catch(e){return null}})();
data.settings=(data.settings&&typeof data.settings==="object")?data.settings:{};
if(separateSettings&&typeof separateSettings==="object") data.settings={...data.settings,...separateSettings};
if(!Number.isFinite(Number(data.settings.openingCash))) data.settings.openingCash=50000;
data.customers.forEach(c=>{c.borrowed=Number(c.borrowed||0);c.balance=Number(c.balance||0)});
data.loans.forEach(l=>{l.amount=Number(l.amount||0);l.interest=Number(l.interest||0);l.balance=Number(l.balance??((l.amount||0)+(l.interest||0)));l.status=l.balance<=0?"Closed":(l.status||"Active");l.payments=Array.isArray(l.payments)?l.payments:[]});
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));localStorage.setItem(SETTINGS_KEY,JSON.stringify(data.settings||{}));};
const saveData=save;
const getCustomer=id=>data.customers.find(c=>c.id===id);const loanStatus=l=>l.status;
const page=document.getElementById("page");
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelector(".sidebar").classList.remove("open");render(b.dataset.page)});
document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("globalSearch").oninput=e=>render("customers",e.target.value);
function title(h,p,actions=""){return `<div class="title"><div><h1>${h}</h1><p>${p}</p></div><div class="actions">${actions}</div></div>`}
function render(p,q=""){
  const views={dashboard,customers,loans,collections,dues,cashbook,expenses,reports,settings:appSettings};
  (views[p]||dashboard)(q);
}
function dashboard(){let active=data.loans.filter(l=>l.status==="Active"||l.status==="Overdue").length,dis=data.loans.reduce((a,l)=>a+l.amount,0),out=data.loans.reduce((a,l)=>a+l.balance,0),col=data.payments.filter(p=>p.date===today).reduce((a,p)=>a+p.amount,0),over=data.loans.filter(l=>l.status==="Overdue"),due=data.loans.filter(l=>l.status==="Active");
page.innerHTML=title("Dashboard","Complete finance overview for today",`<button class="btn green" onclick="openCustomer()">+ New Customer</button><button class="btn" onclick="openLoan()">+ New Loan</button><button class="btn light" onclick="openPayment()">Collect Payment</button>`)+
`<div class="cards">
<div class="card metric"><div><div class="label">Today's Collection</div><div class="value">${money(col)}</div><div class="sub">↑ Payments received</div></div><div class="metric-icon">↙</div></div>
<div class="card metric"><div><div class="label">Today's Due</div><div class="value">${money(16500)}</div><div class="sub">Collection target</div></div><div class="metric-icon">◷</div></div>
<div class="card metric"><div><div class="label">Overdue Amount</div><div class="value">${money(over.reduce((a,l)=>a+l.balance,0))}</div><div class="sub" style="color:#d34d59">${over.length} customers need follow-up</div></div><div class="metric-icon">!</div></div>
<div class="card metric"><div><div class="label">New Loans</div><div class="value">${data.loans.filter(l=>l.due===today).length}</div><div class="sub">This period</div></div><div class="metric-icon">▣</div></div>
</div>
<div class="cards" style="margin-top:14px">
<div class="card"><div class="label">Active Customers</div><div class="value">${data.customers.length}</div></div>
<div class="card"><div class="label">Total Disbursed</div><div class="value">${money(dis)}</div></div>
<div class="card"><div class="label">Outstanding</div><div class="value">${money(out)}</div></div>
<div class="card"><div class="label">Interest in Portfolio</div><div class="value">${money(data.loans.reduce((a,l)=>a+l.interest,0))}</div></div>
</div>
<div class="layout2"><div class="section"><div class="section-head"><h3>Collection Performance</h3><span class="muted">Daily · Last 6 months</span></div><div class="bars">${[52,68,45,75,61,88].map((h,i)=>`<div class="bar" style="height:${h}%"><span>${["Mar","Apr","May","Jun","Jul","Aug"][i]}</span></div>`).join("")}</div></div>
<div class="section"><div class="section-head"><h3>Loan Portfolio</h3><span class="muted">Live status</span></div><div class="donut"></div><div class="legend"><span>● Active</span><span>● Due</span><span>● Overdue</span></div></div></div>
<div class="layout2"><div class="section"><div class="section-head"><h3>🔴 Overdue Customers</h3><button class="btn light" onclick="render('dues')">View All</button></div>${over.map(l=>{let c=getCustomer(l.customerId);return `<div class="alert-box"><div><b>${c?.name||"Customer"}</b><small>${l.id} · ${Math.max(1,Math.ceil((Date.now()-new Date(l.due))/86400000))} days overdue</small></div><div style="text-align:right"><div class="amount-red">${money(l.balance)}</div><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button></div></div>`}).join("")||`<div class="empty">No overdue loans 🎉</div>`}</div>
<div class="section"><div class="section-head"><h3>💰 Money Position</h3></div><div class="kpis"><div class="kpi"><span>Cash</span><b>${money(125000)}</b></div><div class="kpi"><span>UPI</span><b>${money(42500)}</b></div><div class="kpi"><span>Bank</span><b>${money(80000)}</b></div></div><div class="kpi" style="margin-top:10px"><span>Total Available</span><b>${money(247500)}</b></div></div></div>
<div class="section" style="margin-top:17px"><div class="section-head"><h3>📅 Today's Due</h3><button class="btn light" onclick="render('dues')">View All</button></div>${due.map(l=>{let c=getCustomer(l.customerId);return `<div class="due-row"><div class="person"><div class="avatar">${c.name[0]}</div><div><b>${c?.name||"Customer"}</b><small>${l.id}</small></div></div><div>${money(Math.min(5000,l.balance))}</div><div>${l.due}</div><span class="status due">Due</span><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button></div>`}).join("")}</div>
<div class="layout2"><div class="section"><div class="section-head"><h3>Recent Transactions</h3><button class="btn light" onclick="render('collections')">View All</button></div><div class="transactions">${data.payments.slice(-5).reverse().map(p=>{let c=getCustomer(p.customerId);return `<div class="txn"><div class="txn-left"><div class="txn-icon">↙</div><div><b>${c?.name||"Customer"} payment</b><small>${p.date} · ${p.mode}</small></div></div><span class="positive">+ ${money(p.amount)}</span></div>`}).join("")}</div></div>
<div class="section"><div class="section-head"><h3>Recent Loans</h3><button class="btn light" onclick="render('loans')">View All</button></div>${loanTable(data.loans.slice().reverse().slice(0,4))}</div></div>`}
function loanTable(arr){return `<div style="overflow:auto"><table class="table"><thead><tr><th>Loan</th><th>Customer</th><th>Principal</th><th>Outstanding</th><th>Due</th><th>Status</th></tr></thead><tbody>${arr.map(l=>{let c=getCustomer(l.customerId);return `<tr><td><b>${l.id}</b></td><td>${c?.name||"-"}</td><td>${money(l.amount)}</td><td>${money(l.balance)}</td><td>${l.due}</td><td><span class="status ${l.status.toLowerCase()}">${l.status}</span></td></tr>`}).join("")}</tbody></table></div>`}
function customers(q=""){
  const query=(q||"").toLowerCase();
  const a=data.customers.filter(c=>(c.name+" "+c.mobile+" "+c.id+" "+(c.area||"")).toLowerCase().includes(query));
  const active=data.customers.filter(c=>c.balance>0).length;
  const borrowed=data.customers.reduce((s,c)=>s+(c.borrowed||0),0);
  const outstanding=data.customers.reduce((s,c)=>s+(c.balance||0),0);
  const dueToday=data.loans.filter(l=>l.balance>0 && l.due===today).reduce((s,l)=>s+l.balance,0);
  const overdue=data.loans.filter(l=>l.balance>0 && l.status==="Overdue").reduce((s,l)=>s+l.balance,0);
  page.innerHTML=title("Customers","Customer profiles, KYC and complete loan history",`<button class="btn green" onclick="openCustomer()">+ Add Customer</button>`)+
  `<div class="cards customer-summary">
    <div class="card metric"><div><div class="label">Total Customers</div><div class="value">${data.customers.length}</div><div class="sub">All registered customers</div></div><div class="metric-icon">◎</div></div>
    <div class="card metric"><div><div class="label">Active Customers</div><div class="value">${active}</div><div class="sub">Customers with balance</div></div><div class="metric-icon">✓</div></div>
    <div class="card metric"><div><div class="label">Total Borrowed</div><div class="value">${money(borrowed)}</div><div class="sub">Portfolio principal</div></div><div class="metric-icon">₹</div></div>
    <div class="card metric"><div><div class="label">Outstanding</div><div class="value">${money(outstanding)}</div><div class="sub">Current customer balance</div></div><div class="metric-icon">◷</div></div>
  </div>
  <div class="customer-alerts">
    <button class="summary-chip" onclick="render('dues')"><span>Due Today</span><b>${money(dueToday)}</b></button>
    <button class="summary-chip danger" onclick="render('dues')"><span>Overdue</span><b>${money(overdue)}</b></button>
    <button class="summary-chip" onclick="filterCustomerStatus('active')"><span>Active</span><b>${active}</b></button>
    <button class="summary-chip" onclick="filterCustomerStatus('closed')"><span>Closed</span><b>${data.customers.filter(c=>c.balance<=0).length}</b></button>
  </div>
  <div class="customer-toolbar">
    <input id="customerSearch" placeholder="🔍 Search customer / mobile / ID / loan no..." value="${q||""}" oninput="filterCustomers()">
    <select id="customerStatus" onchange="filterCustomers()"><option value="all">All Status</option><option value="active">Active</option><option value="due">Due Today</option><option value="overdue">Overdue</option><option value="closed">Closed</option></select>
    <input id="customerArea" placeholder="Area" oninput="filterCustomers()">
  </div>
  <div id="customerList" class="list customer-list">${customerCards(a)}</div>`;
}
function customerCards(a){
  return a.map(c=>{
    const ls=data.loans.filter(l=>l.customerId===c.id);
    const overdue=ls.some(l=>l.balance>0&&l.status==="Overdue");
    const due=ls.find(l=>l.balance>0);
    const status=overdue?"Overdue":c.balance>0?"Active":"Closed";
    const last=data.payments.filter(p=>p.customerId===c.id).sort((x,y)=>y.date.localeCompare(x.date))[0];
    return `<div class="customer customer-card">
      <div class="customer-head"><div class="avatar">${(c.name||"?")[0].toUpperCase()}</div><div class="customer-title"><h3>${c.name}</h3><small>${c.id} · ${c.mobile}</small></div><span class="status ${status.toLowerCase()}">${status}</span></div>
      <div class="mini-grid"><div><span>Total Borrowed</span><b>${money(c.borrowed)}</b></div><div><span>Paid</span><b>${money(Math.max(0,(c.borrowed||0)-(c.balance||0)))}</b></div><div><span>Outstanding</span><b>${money(c.balance)}</b></div></div>
      <div class="customer-meta"><span>📍 ${c.area||"Area not added"}</span><span>📅 ${due?`Next due ${due.due}`:"No active loan"}</span></div>
      <div class="customer-meta"><span>${due&&due.balance>0?`Due amount ${money(Math.min(due.balance,5000))}`:"No pending due"}</span><span>${last?`Last paid ${money(last.amount)}`:"No payments"}</span></div>
      <div class="customer-actions"><button class="btn light" onclick="customerDetail('${c.id}')">View Profile</button>${c.balance>0?`<button class="btn green" onclick="openCustomerPayment('${c.id}')">Collect</button>`:""}<button class="icon-btn" onclick="customerMenu('${c.id}')">⋮</button></div>
    </div>`;
  }).join("")||`<div class="empty">No customers found</div>`;
}
function filterCustomers(){
  const q=(document.getElementById("customerSearch")?.value||"").toLowerCase();
  const status=document.getElementById("customerStatus")?.value||"all";
  const area=(document.getElementById("customerArea")?.value||"").toLowerCase();
  let rows=data.customers.filter(c=>{
    const ls=data.loans.filter(l=>l.customerId===c.id);
    const overdue=ls.some(l=>l.balance>0&&l.status==="Overdue");
    const due=ls.some(l=>l.balance>0&&l.due===today);
    const text=(c.name+" "+c.mobile+" "+c.id+" "+(c.area||"")+" "+ls.map(l=>l.id).join(" ")).toLowerCase();
    const okStatus=status==="all"||(status==="active"&&c.balance>0&& !overdue)||(status==="due"&&due)||(status==="overdue"&&overdue)||(status==="closed"&&c.balance<=0);
    return text.includes(q)&&String(c.area||"").toLowerCase().includes(area)&&okStatus;
  });
  document.getElementById("customerList").innerHTML=customerCards(rows);
}
function filterCustomerStatus(status){
  render("customers");
  setTimeout(()=>{const el=document.getElementById("customerStatus");if(el){el.value=status;filterCustomers();}},0);
}
function customerMenu(id){
  const c=getCustomer(id);
  openModal("Customer Actions",`<div class="quick-menu">
    <button onclick="customerDetail('${id}');">View Complete Profile</button>
    ${c.balance>0?`<button onclick="openCustomerPayment('${id}')">Collect Payment</button>`:""}
    <button onclick="editCustomer('${id}')">Edit Customer</button>
    <button onclick="customerStatement('${id}')">Print Customer Statement</button>
    <button onclick="whatsappCustomer('${id}')">Send WhatsApp</button>
  </div>`);
}
function openCustomerPayment(customerId){
  const l=data.loans.find(x=>x.customerId===customerId&&x.balance>0);
  if(l) openPayment(l.id); else toast("No active loan for this customer");
}
function loans(){
  const active=data.loans.filter(l=>l.balance>0);
  const portfolio=data.loans.reduce((s,l)=>s+(l.amount||0),0);
  const outstanding=data.loans.reduce((s,l)=>s+(l.balance||0),0);
  const todayDue=data.loans.filter(l=>l.balance>0&&l.due===today).reduce((s,l)=>s+Math.min(l.balance,5000),0);
  const overdueAmount=data.loans.filter(l=>l.balance>0&&l.status==="Overdue").reduce((s,l)=>s+l.balance,0);
  const closed=data.loans.filter(l=>l.balance<=0).length;
  page.innerHTML=title("Loans","Loan portfolio, interest and repayment tracking",`<button class="btn green" onclick="openLoan()">+ New Loan</button>`)+
  `<div class="cards loan-summary">
    <div class="card metric"><div><div class="label">Total Portfolio</div><div class="value">${money(portfolio)}</div><div class="sub">${data.loans.length} loans</div></div><div class="metric-icon">₹</div></div>
    <div class="card metric"><div><div class="label">Outstanding</div><div class="value">${money(outstanding)}</div><div class="sub">Current balance</div></div><div class="metric-icon">◷</div></div>
    <div class="card metric"><div><div class="label">Today's Due</div><div class="value">${money(todayDue)}</div><div class="sub">Expected collection</div></div><div class="metric-icon">✓</div></div>
    <div class="card metric"><div><div class="label">Overdue Amount</div><div class="value">${money(overdueAmount)}</div><div class="sub">${data.loans.filter(l=>l.status==="Overdue"&&l.balance>0).length} overdue loans</div></div><div class="metric-icon">!</div></div>
  </div>
  <div class="loan-chips">
    <button class="summary-chip" onclick="loanQuickFilter('all')"><span>All Loans</span><b>${data.loans.length}</b></button>
    <button class="summary-chip" onclick="loanQuickFilter('active')"><span>Active</span><b>${active.length}</b></button>
    <button class="summary-chip" onclick="loanQuickFilter('due')"><span>Due Today</span><b>${data.loans.filter(l=>l.balance>0&&l.due===today).length}</b></button>
    <button class="summary-chip danger" onclick="loanQuickFilter('overdue')"><span>Overdue</span><b>${data.loans.filter(l=>l.balance>0&&l.status==="Overdue").length}</b></button>
    <button class="summary-chip" onclick="loanQuickFilter('closed')"><span>Closed</span><b>${closed}</b></button>
  </div>
  <div class="loan-toolbar">
    <input id="loanSearch" placeholder="🔍 Search loan / customer / mobile..." oninput="filterLoans()">
    <select id="loanStatus" onchange="filterLoans()"><option value="all">All Status</option><option value="active">Active</option><option value="due">Due Today</option><option value="overdue">Overdue</option><option value="closed">Closed</option></select>
    <select id="loanFrequency" onchange="filterLoans()"><option value="all">All Frequency</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
  </div>
  <div class="card loan-table-card"><div id="loanTableWrap">${loanRows(data.loans)}</div></div>`;
}
function loanRows(rows){
  if(!rows.length)return `<div class="empty">No loans found</div>`;
  return `<div class="table-scroll"><table class="table loan-table"><thead><tr><th>LOAN</th><th>CUSTOMER</th><th>PRINCIPAL</th><th>INTEREST</th><th>PAID</th><th>OUTSTANDING</th><th>NEXT DUE</th><th>INSTALLMENT</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>${rows.map(l=>{
    const c=getCustomer(l.customerId),paid=Math.max(0,(l.amount||0)-(l.balance||0)),interest=l.interest||0,status=l.balance<=0?"Closed":(l.status||"Active");
    return `<tr><td><b>${l.id}</b><small>${l.type||"Personal"}</small></td><td><b>${c?.name||"Unknown"}</b><small>${c?.mobile||""}</small></td><td>${money(l.amount)}</td><td>${money(interest)}</td><td>${money(paid)}</td><td><b>${money(l.balance)}</b></td><td>${l.balance>0?(l.due||"-"):"-"}</td><td>${l.installment?money(l.installment):money(Math.min(l.balance||0,5000))}</td><td><span class="status ${status.toLowerCase()}">${status}</span></td><td><div class="row-actions"><button class="mini-btn" onclick="loanDetail('${l.id}')">View</button>${l.balance>0?`<button class="mini-btn green-mini" onclick="openPayment('${l.id}')">Collect</button>`:""}<button class="icon-btn tiny" onclick="loanMenu('${l.id}')">⋮</button></div></td></tr>`;
  }).join("")}</tbody></table></div>`;
}
function filterLoans(){
  const q=(document.getElementById("loanSearch")?.value||"").toLowerCase(),status=document.getElementById("loanStatus")?.value||"all",freq=document.getElementById("loanFrequency")?.value||"all";
  const rows=data.loans.filter(l=>{
    const c=getCustomer(l.customerId)||{},text=(l.id+" "+(c.name||"")+" "+(c.mobile||"")).toLowerCase();
    const overdue=l.balance>0&&l.status==="Overdue",due=l.balance>0&&l.due===today,active=l.balance>0&&!overdue;
    const ok=status==="all"||(status==="active"&&active)||(status==="due"&&due)||(status==="overdue"&&overdue)||(status==="closed"&&l.balance<=0);
    return text.includes(q)&&ok&&(freq==="all"||l.frequency===freq);
  });
  document.getElementById("loanTableWrap").innerHTML=loanRows(rows);
}
function loanQuickFilter(status){
  render("loans");
  setTimeout(()=>{const e=document.getElementById("loanStatus");if(e){e.value=status;filterLoans();}},0);
}
function loanMenu(id){
  openModal("Loan Actions",`<div class="quick-menu"><button onclick="loanDetail('${id}')">View Loan</button><button onclick="loanSchedule('${id}')">View Repayment Schedule</button><button onclick="openPayment('${id}')">Collect Payment</button><button onclick="loanStatement('${id}')">Print Loan Statement</button><button onclick="loanWhatsapp('${id}')">WhatsApp Reminder</button><button onclick="editLoan('${id}')">Edit Loan</button></div>`);
}
function paymentTable(){
  const ps=[...data.payments].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  if(!ps.length)return `<div class="empty">No payments recorded</div>`;
  return `<div class="table-scroll"><table class="table"><thead><tr><th>RECEIPT</th><th>CUSTOMER</th><th>LOAN</th><th>AMOUNT</th><th>DATE</th><th>MODE</th><th></th></tr></thead><tbody>${ps.map(p=>{
    const c=getCustomer(p.customerId);
    return `<tr><td><b>${p.id}</b></td><td>${c?.name||"Unknown"}</td><td>${p.loanId||"-"}</td><td><b>${money(p.amount)}</b></td><td>${p.date||"-"}</td><td>${p.mode||"-"}</td><td><button class="mini-btn" onclick="receipt('${p.id}')">Receipt</button></td></tr>`;
  }).join("")}</tbody></table></div>`;
}
function collections(){
  const todayTotal=data.payments.filter(p=>p.date===today).reduce((s,p)=>s+Number(p.amount||0),0);
  const total=data.payments.reduce((s,p)=>s+Number(p.amount||0),0);
  const avg=data.payments.length?total/data.payments.length:0;
  page.innerHTML=title("Collections","Fast payment collection, receipts and payment history",`<button class="btn green" onclick="openCollectionPicker()">+ Collect Payment</button>`)+
  `<div class="cards">
    <div class="card metric"><div><div class="label">Today's Collection</div><div class="value">${money(todayTotal)}</div></div><div class="metric-icon">₹</div></div>
    <div class="card metric"><div><div class="label">Total Collected</div><div class="value">${money(total)}</div></div><div class="metric-icon">↗</div></div>
    <div class="card metric"><div><div class="label">Payments</div><div class="value">${data.payments.length}</div></div><div class="metric-icon">✓</div></div>
    <div class="card metric"><div><div class="label">Average Payment</div><div class="value">${money(avg)}</div></div><div class="metric-icon">◷</div></div>
  </div>
  <div class="section" style="margin-top:17px">${paymentTable()}</div>`;
}
function openCollectionPicker(){
  const loans=data.loans.filter(l=>l.balance>0);
  openModal("Select Loan",`<div class="collection-picker">${loans.length?loans.map(l=>{const c=getCustomer(l.customerId);return `<button class="picker-row" onclick="openPayment('${l.id}')"><span><b>${c?.name||"Customer"}</b><small>${l.id} · Outstanding ${money(l.balance)}</small></span><strong>Collect</strong></button>`}).join(""):`<div class="empty">No active loan with outstanding balance</div>`}</div>`);
}
function dues(){let over=data.loans.filter(l=>l.status==="Overdue"),up=data.loans.filter(l=>l.status==="Active");page.innerHTML=title("Due Management","Today's due, upcoming due and overdue follow-up",`<button class="btn green" onclick="openPayment()">Collect Payment</button>`)+`<div class="cards"><div class="card"><div class="label">Today's Due</div><div class="value">${money(16500)}</div></div><div class="card"><div class="label">Upcoming Loans</div><div class="value">${up.length}</div></div><div class="card"><div class="label">Overdue</div><div class="value">${over.length}</div></div><div class="card"><div class="label">Overdue Amount</div><div class="value">${money(over.reduce((a,l)=>a+l.balance,0))}</div></div></div><div class="section" style="margin-top:17px"><div class="section-head"><h3>Overdue Follow-up</h3></div>${loanTable(over)}</div><div class="section" style="margin-top:17px"><div class="section-head"><h3>Upcoming / Due</h3></div>${loanTable(up)}</div>`}
function cashbookModeTotals(){
  const todayPays=data.payments.filter(p=>p.date===today);
  const cash=todayPays.filter(p=>(p.mode||"Cash").toLowerCase()==="cash").reduce((a,p)=>a+Number(p.amount||0),0);
  const upi=todayPays.filter(p=>(p.mode||"").toLowerCase()==="upi").reduce((a,p)=>a+Number(p.amount||0),0);
  const bank=todayPays.filter(p=>["bank","bank transfer","neft","rtgs","imps"].includes((p.mode||"").toLowerCase())).reduce((a,p)=>a+Number(p.amount||0),0);
  return {cash,upi,bank};
}
function cashbookTransactions(filter="all"){
  const pays=data.payments.map(p=>{
    const c=getCustomer(p.customerId);
    return {date:p.date,time:p.time||"",type:"Collection",ref:p.receipt||p.id,description:"Loan payment",customer:c?.name||"-",loan:p.loanId||"-",amount:Number(p.amount||0),mode:p.mode||"Cash",raw:p};
  });
  const expenses=(data.expenses||[]).map(x=>{
    const c=getCustomer(x.customerId);
    return {date:x.date,time:x.time||"",type:"Expense",ref:x.id,description:x.category||"Expense",customer:c?.name||"-",loan:"-",amount:Number(x.amount||0),mode:x.mode||"Cash",raw:x};
  });
  let rows=[...pays,...expenses].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  if(filter!=="all") rows=rows.filter(x=>x.mode.toLowerCase()===filter.toLowerCase());
  return rows;
}
function cashbookMode(mode){
  const rows=cashbookTransactions(mode);
  document.getElementById("cashbookRows").innerHTML=cashbookTable(rows);
  document.querySelectorAll(".cash-filter").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
}
function cashbookTable(rows){
  if(!rows.length)return `<div class="empty">No transactions found.</div>`;
  return `<div class="table-scroll"><table class="table cash-table"><thead><tr><th>TIME</th><th>TYPE</th><th>DESCRIPTION</th><th>CUSTOMER</th><th>AMOUNT</th><th>MODE</th><th>ACTION</th></tr></thead><tbody>${rows.map(r=>`
  <tr><td>${r.time||r.date}<small>${r.time?r.date:""}</small></td>
  <td><span class="cash-type ${r.type.toLowerCase()}">${r.type}</span></td>
  <td><b>${r.description}</b><small>${r.ref}${r.loan!=="-"?" · "+r.loan:""}</small></td>
  <td>${r.customer}</td><td class="${r.type==="Expense"?"expense-amt":"collection-amt"}">${r.type==="Expense"?"−":"+"}${money(r.amount)}</td>
  <td><span class="mode-pill">${r.mode}</span></td>
  <td>${r.type==="Collection"?`<button class="mini-btn" onclick="receipt('${r.ref}')">Receipt</button>`:`<button class="mini-btn" onclick="toast('Expense ${r.ref}')">View</button>`}</td></tr>`).join("")}</tbody></table></div>`;
}
function addCashbookExpense(){
  const modal=document.createElement("div"); modal.className="modal-backdrop";
  modal.innerHTML=`<div class="modal cash-modal"><div class="modal-head"><div><h2>Add Expense</h2><p class="muted">Record cash, UPI or bank outflow</p></div><button class="close" onclick="this.closest('.modal-backdrop').remove()">×</button></div>
  <div class="form-grid">
    <label>Category<select id="expCategory"><option>Petrol / Travel</option><option>Office Expense</option><option>Salary</option><option>Rent</option><option>Mobile / Internet</option><option>Tea / Food</option><option>Bank Charges</option><option>Other</option></select></label>
    <label>Amount<input id="expAmount" type="number" min="1" placeholder="₹ Amount"></label>
    <label>Date<input id="expDate" type="date" value="${today}"></label>
    <label>Mode<select id="expMode"><option>Cash</option><option>UPI</option><option>Bank</option></select></label>
    <label class="full">Description<input id="expDesc" placeholder="What was this expense for?"></label>
    <label class="full">Notes<textarea id="expNotes" rows="3" placeholder="Optional notes"></textarea></label>
  </div><div class="modal-actions"><button class="btn" onclick="this.closest('.modal-backdrop').remove()">Cancel</button><button class="btn green" onclick="saveCashbookExpense(this)">Save Expense</button></div></div>`;
  document.body.appendChild(modal);
}
function saveCashbookExpense(btn){
  const amount=Number(document.getElementById("expAmount").value);
  if(!amount||amount<=0)return toast("Enter a valid amount");
  data.expenses=data.expenses||[];
  data.expenses.push({id:"EX-"+String(data.expenses.length+1).padStart(4,"0"),category:document.getElementById("expCategory").value,amount,date:document.getElementById("expDate").value,mode:document.getElementById("expMode").value,description:document.getElementById("expDesc").value||"",notes:document.getElementById("expNotes").value||"",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});
  saveData(); btn.closest(".modal-backdrop").remove(); cashbook(); toast("Expense saved");
}
function cashbookCloseDay(){
  const totals=cashbookModeTotals();
  const expenses=(data.expenses||[]).filter(x=>x.date===today);
  const cashExp=expenses.filter(x=>(x.mode||"Cash").toLowerCase()==="cash").reduce((a,x)=>a+Number(x.amount||0),0);
  const opening=Number(data.settings?.openingCash||50000);
  const expected=opening+totals.cash-cashExp;
  const actual=prompt(`Expected cash: ${money(expected)}\nEnter actual cash counted:`);
  if(actual===null)return;
  const n=Number(actual); if(isNaN(n))return toast("Invalid cash amount");
  data.cashClosings=data.cashClosings||[];
  data.cashClosings.push({date:today,opening,cashCollection:totals.cash,cashExpense:cashExp,expected,actual:n,difference:n-expected});
  saveData(); cashbook(); toast("Day closing saved");
}
function cashbookReport(){
  const rows=cashbookTransactions("all");
  const totalIn=rows.filter(r=>r.type==="Collection").reduce((a,r)=>a+r.amount,0);
  const totalOut=rows.filter(r=>r.type==="Expense").reduce((a,r)=>a+r.amount,0);
  alert(`Cashbook Report\n\nCollections: ${money(totalIn)}\nExpenses: ${money(totalOut)}\nNet Movement: ${money(totalIn-totalOut)}\nTransactions: ${rows.length}`);
}
function cashbook(){
  data.expenses=data.expenses||[];
  data.settings=data.settings||{openingCash:50000};
  const pays=data.payments.filter(p=>p.date===today);
  const exps=data.expenses.filter(x=>x.date===today);
  const opening=Number(data.settings.openingCash||50000);
  const collections=pays.reduce((a,p)=>a+Number(p.amount||0),0);
  const expenses=exps.reduce((a,x)=>a+Number(x.amount||0),0);
  const net=collections-expenses;
  const modes=cashbookModeTotals();
  const cashInHand=opening+modes.cash-exps.filter(x=>(x.mode||"Cash").toLowerCase()==="cash").reduce((a,x)=>a+Number(x.amount||0),0);
  const upi=modes.upi, bank=modes.bank;
  const lastClose=(data.cashClosings||[]).filter(x=>x.date===today).slice(-1)[0];

  page.innerHTML=title("Cashbook","Track cash, UPI, bank inflow and outflow",`<button class="btn green" onclick="openCollectionPicker()">+ Collection</button><button class="btn" onclick="addCashbookExpense()">+ Expense</button>`)+
  `<div class="cards">
    <div class="card metric"><div><div class="label">Opening Cash</div><div class="value">${money(opening)}</div><div class="sub">Day opening</div></div><div class="metric-icon">₹</div></div>
    <div class="card metric"><div><div class="label">Today's Collections</div><div class="value green-text">${money(collections)}</div><div class="sub">${pays.length} payments</div></div><div class="metric-icon">↗</div></div>
    <div class="card metric"><div><div class="label">Today's Expenses</div><div class="value danger-text">${money(expenses)}</div><div class="sub">${exps.length} expenses</div></div><div class="metric-icon">↘</div></div>
    <div class="card metric"><div><div class="label">Net Movement</div><div class="value">${money(net)}</div><div class="sub">Inflow − outflow</div></div><div class="metric-icon">◷</div></div>
  </div>
  <div class="cash-position-grid">
    <div class="section cash-position"><div class="section-head"><div><h3>Today's Cash Position</h3><p class="muted">Live balance by payment channel</p></div></div>
      <div class="position-list"><div><span>Cash in Hand</span><b>${money(cashInHand)}</b></div><div><span>UPI Collections</span><b>${money(upi)}</b></div><div><span>Bank Collections</span><b>${money(bank)}</b></div><div><span>Net Movement</span><b class="${net<0?"danger-text":"green-text"}">${money(net)}</b></div></div>
    </div>
    <div class="section cash-position"><div class="section-head"><div><h3>Day Closing</h3><p class="muted">${lastClose?"Closing saved for today":"Count your cash before closing the day"}</p></div><button class="btn green" onclick="cashbookCloseDay()">Close Day</button></div>
      ${lastClose?`<div class="closing-result"><div><span>Expected</span><b>${money(lastClose.expected)}</b></div><div><span>Actual</span><b>${money(lastClose.actual)}</b></div><div><span>Difference</span><b class="${lastClose.difference<0?"danger-text":"green-text"}">${money(lastClose.difference)}</b></div></div>`:`<div class="closing-empty">Expected cash = Opening + Cash Collections − Cash Expenses</div>`}
    </div>
  </div>
  <div class="section" style="margin-top:17px"><div class="section-head"><div><h3>Transactions</h3><p class="muted">Collections and expenses for your cashbook</p></div><div class="filter-tabs"><button class="cash-filter active" data-mode="all" onclick="cashbookMode('all')">All</button><button class="cash-filter" data-mode="cash" onclick="cashbookMode('cash')">Cash</button><button class="cash-filter" data-mode="upi" onclick="cashbookMode('upi')">UPI</button><button class="cash-filter" data-mode="bank" onclick="cashbookMode('bank')">Bank</button></div></div>
    <div id="cashbookRows">${cashbookTable(cashbookTransactions())}</div></div>
  <div class="cashbook-footer-actions"><button class="btn" onclick="cashbookReport()">Reports</button><button class="btn" onclick="window.print()">Print</button></div>`;
}
function expenses(){page.innerHTML=title("Expenses","Business expense tracking",`<button class="btn green" onclick="openExpense()">+ Add Expense</button>`)+`<div class="section"><table class="table"><thead><tr><th>Category</th><th>Amount</th><th>Date</th><th>Mode</th><th>Description</th></tr></thead><tbody>${data.expenses.map(e=>`<tr><td>${e.category}</td><td>${money(e.amount)}</td><td>${e.date}</td><td>${e.mode}</td><td>${e.description||"-"}</td></tr>`).join("")||`<tr><td colspan="5"><div class="empty">No expenses</div></td></tr>`}</tbody></table></div>`}
function reportDateLabel(d){
  if(!d)return "-";
  const p=d.split("-");
  return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:d;
}
function reportRange(type){
  const now=new Date();
  const end=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  let start=new Date(end);
  if(type==="7")start.setDate(start.getDate()-6);
  else if(type==="30")start.setDate(start.getDate()-29);
  else if(type==="month")start=new Date(end.getFullYear(),end.getMonth(),1);
  else if(type==="all")start=new Date(2000,0,1);
  return {start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)};
}
function reportRows(range){
  const payments=data.payments.filter(p=>p.date>=range.start&&p.date<=range.end).map(p=>{
    const c=getCustomer(p.customerId);
    return {date:p.date,type:"Collection",customer:c?.name||"-",customerId:p.customerId,loan:p.loanId||"-",amount:Number(p.amount||0),mode:p.mode||"Cash",ref:p.receipt||p.id};
  });
  const expenses=(data.expenses||[]).filter(e=>e.date>=range.start&&e.date<=range.end).map(e=>({
    date:e.date,type:"Expense",customer:"-",customerId:"",loan:"-",amount:Number(e.amount||0),mode:e.mode||"Cash",ref:e.id,category:e.category||"Other"
  }));
  return [...payments,...expenses].sort((a,b)=>b.date.localeCompare(a.date));
}
function reportMonthSeries(){
  const months=[];
  const now=new Date();
  for(let i=5;i>=0;i--){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label=d.toLocaleString("en",{month:"short"});
    const col=data.payments.filter(p=>(p.date||"").startsWith(key)).reduce((a,p)=>a+Number(p.amount||0),0);
    const exp=(data.expenses||[]).filter(e=>(e.date||"").startsWith(key)).reduce((a,e)=>a+Number(e.amount||0),0);
    months.push({key,label,col,exp,net:col-exp});
  }
  return months;
}
function downloadReportCSV(){
  const range=reportRange(document.getElementById("reportRange")?.value||"30");
  const rows=reportRows(range);
  const header=["Date","Type","Customer","Loan","Amount","Mode","Reference"];
  const body=rows.map(r=>[r.date,r.type,r.customer,r.loan,r.amount,r.mode,r.ref]);
  const csv=[header,...body].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`finova-report-${range.start}-to-${range.end}.csv`;a.click();URL.revokeObjectURL(a.href);
}
function reportPrint(){window.print()}
function reports(){
  const range=reportRange("30");
  const rows=reportRows(range);
  const renderReport=()=>{
    const selected=document.getElementById("reportRange")?.value||"30";
    const r=reportRange(selected);
    const rs=reportRows(r);
    const collections=rs.filter(x=>x.type==="Collection").reduce((a,x)=>a+x.amount,0);
    const expenses=rs.filter(x=>x.type==="Expense").reduce((a,x)=>a+x.amount,0);
    const payments=rs.filter(x=>x.type==="Collection").length;
    const outstanding=data.loans.reduce((a,l)=>a+Number(l.balance||0),0);
    const disbursed=data.loans.reduce((a,l)=>a+Number(l.amount||0),0);
    const overdue=data.loans.filter(l=>l.balance>0&&(l.status==="Overdue"||l.due<today));
    const overdueAmt=overdue.reduce((a,l)=>a+Number(l.balance||0),0);
    const active=data.loans.filter(l=>l.balance>0).length;
    const closed=data.loans.filter(l=>l.balance<=0).length;
    const modeTotals={Cash:0,UPI:0,Bank:0};
    rs.filter(x=>x.type==="Collection").forEach(x=>modeTotals[x.mode]=(modeTotals[x.mode]||0)+x.amount);
    const months=reportMonthSeries();
    const max=Math.max(1,...months.map(x=>Math.max(x.col,x.exp)));
    const topCustomers=Object.values(rs.filter(x=>x.type==="Collection").reduce((a,x)=>{
      a[x.customerId]=a[x.customerId]||{name:x.customer,total:0,count:0};
      a[x.customerId].total+=x.amount;a[x.customerId].count++;return a;
    },{})).sort((a,b)=>b.total-a.total).slice(0,5);
    const buckets=[
      ["1–7 days",data.loans.filter(l=>l.balance>0&&l.due<today&&Math.floor((Date.parse(today)-Date.parse(l.due))/86400000)<=7).length],
      ["8–30 days",data.loans.filter(l=>l.balance>0&&l.due<today&&Math.floor((Date.parse(today)-Date.parse(l.due))/86400000)>7&&Math.floor((Date.parse(today)-Date.parse(l.due))/86400000)<=30).length],
      ["30+ days",data.loans.filter(l=>l.balance>0&&l.due<today&&Math.floor((Date.parse(today)-Date.parse(l.due))/86400000)>30).length]
    ];
    page.innerHTML=title("Reports","Business performance, collections, portfolio and cash analysis",`<select id="reportRange" class="report-select" onchange="reports()"><option value="7" ${selected==="7"?"selected":""}>Last 7 Days</option><option value="30" ${selected==="30"?"selected":""}>Last 30 Days</option><option value="month" ${selected==="month"?"selected":""}>This Month</option><option value="all" ${selected==="all"?"selected":""}>All Time</option></select><button class="btn" onclick="downloadReportCSV()">Export CSV</button><button class="btn green" onclick="reportPrint()">Print Report</button>`)+
    `<div class="cards report-cards">
      <div class="card metric"><div><div class="label">Collections</div><div class="value green-text">${money(collections)}</div><div class="sub">${payments} payments</div></div><div class="metric-icon">↗</div></div>
      <div class="card metric"><div><div class="label">Expenses</div><div class="value danger-text">${money(expenses)}</div><div class="sub">${rs.filter(x=>x.type==="Expense").length} entries</div></div><div class="metric-icon">↘</div></div>
      <div class="card metric"><div><div class="label">Net Movement</div><div class="value">${money(collections-expenses)}</div><div class="sub">Collections − expenses</div></div><div class="metric-icon">₹</div></div>
      <div class="card metric"><div><div class="label">Outstanding</div><div class="value">${money(outstanding)}</div><div class="sub">${active} active · ${closed} closed</div></div><div class="metric-icon">◷</div></div>
    </div>
    <div class="report-grid" style="margin-top:17px">
      <div class="section"><div class="section-head"><div><h3>6-Month Collection Trend</h3><p class="muted">Collections vs expenses</p></div></div><div class="report-chart">${months.map(x=>`<div class="report-bar-group"><div class="report-bar collection-bar" style="height:${Math.max(8,(x.col/max)*100)}%" title="${money(x.col)}"></div><div class="report-bar expense-bar" style="height:${Math.max(4,(x.exp/max)*100)}%" title="${money(x.exp)}"></div><span>${x.label}</span></div>`).join("")}</div><div class="chart-legend"><span><i class="dot collection-dot"></i>Collection</span><span><i class="dot expense-dot"></i>Expense</span></div></div>
      <div class="section"><div class="section-head"><div><h3>Portfolio Health</h3><p class="muted">Current loan position</p></div></div>
        <div class="health-list"><div><span>Total Disbursed</span><b>${money(disbursed)}</b></div><div><span>Outstanding</span><b>${money(outstanding)}</b></div><div><span>Overdue Amount</span><b class="danger-text">${money(overdueAmt)}</b></div><div><span>Recovery %</span><b>${disbursed?Math.round(((disbursed-outstanding)/disbursed)*100):0}%</b></div></div>
        <div class="status-pills"><span>Active ${active}</span><span>Overdue ${overdue.length}</span><span>Closed ${closed}</span></div>
      </div>
    </div>
    <div class="report-grid" style="margin-top:17px">
      <div class="section"><div class="section-head"><div><h3>Collection by Mode</h3><p class="muted">Selected period</p></div></div><div class="mode-report">${Object.entries(modeTotals).map(([k,v])=>`<div><span>${k}</span><b>${money(v)}</b><div class="mode-track"><i style="width:${collections?Math.round(v/collections*100):0}%"></i></div><small>${collections?Math.round(v/collections*100):0}%</small></div>`).join("")}</div></div>
      <div class="section"><div class="section-head"><div><h3>Overdue Buckets</h3><p class="muted">Outstanding loans only</p></div></div><div class="bucket-list">${buckets.map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div></div>
    </div>
    <div class="section" style="margin-top:17px"><div class="section-head"><div><h3>Top Customers by Collection</h3><p class="muted">Selected period</p></div></div><div class="table-scroll"><table class="table"><thead><tr><th>CUSTOMER</th><th>PAYMENTS</th><th>COLLECTED</th></tr></thead><tbody>${topCustomers.length?topCustomers.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.count}</td><td class="collection-amt">${money(x.total)}</td></tr>`).join(""):`<tr><td colspan="3"><div class="empty">No collection data</div></td></tr>`}</tbody></table></div></div>
    <div class="section" style="margin-top:17px"><div class="section-head"><div><h3>Detailed Transactions</h3><p class="muted">${reportDateLabel(r.start)} to ${reportDateLabel(r.end)}</p></div></div><div class="table-scroll"><table class="table"><thead><tr><th>DATE</th><th>TYPE</th><th>CUSTOMER</th><th>REFERENCE</th><th>MODE</th><th>AMOUNT</th></tr></thead><tbody>${rs.slice(0,50).map(x=>`<tr><td>${reportDateLabel(x.date)}</td><td><span class="cash-type ${x.type.toLowerCase()}">${x.type}</span></td><td>${x.customer}</td><td>${x.ref}</td><td>${x.mode}</td><td class="${x.type==="Expense"?"expense-amt":"collection-amt"}">${x.type==="Expense"?"−":"+"}${money(x.amount)}</td></tr>`).join("")||`<tr><td colspan="6"><div class="empty">No transactions in this period</div></td></tr>`}</tbody></table></div></div>`;
  };
  renderReport();
}
function appSettings(){
  data.settings=data.settings||{};
  const s=data.settings;
  page.innerHTML=title("Settings","Business profile, finance defaults, security and local data controls",`<button class="btn" onclick="exportBackup()">Backup Data</button><button class="btn green" onclick="importBackup()">Restore Data</button>`)+
  `<div class="settings-grid">
    <div class="section"><div class="section-head"><div><h3>Business Profile</h3><p class="muted">Shown on receipts and reports</p></div></div>
      <div class="form-grid settings-form">
        <label>Business Name<input id="setBusinessName" value="${esc(s.businessName||"FINOVA Finance")}"></label>
        <label>Owner / Admin Name<input id="setOwnerName" value="${esc(s.ownerName||"Admin")}"></label>
        <label>Mobile Number<input id="setMobile" value="${esc(s.mobile||"")}"></label>
        <label>Address<input id="setAddress" value="${esc(s.address||"")}"></label>
        <label>Receipt Prefix<input id="setReceiptPrefix" value="${esc(s.receiptPrefix||"RC")}"></label>
        <label>Currency<select id="setCurrency"><option ${s.currency==="INR"||!s.currency?"selected":""}>INR</option><option>USD</option></select></label>
      </div>
    </div>
    <div class="section"><div class="section-head"><div><h3>Loan Defaults</h3><p class="muted">Used when creating new loans</p></div></div>
      <div class="form-grid settings-form">
        <label>Default Interest %<input id="setInterest" type="number" step="0.01" value="${Number(s.defaultInterest||0)}"></label>
        <label>Interest Type<select id="setInterestType"><option ${s.interestType==="Flat"||!s.interestType?"selected":""}>Flat</option><option ${s.interestType==="Reducing"?"selected":""}>Reducing</option></select></label>
        <label>Default Installment<input id="setInstallment" type="number" value="${Number(s.defaultInstallment||0)}"></label>
        <label>Default Frequency<select id="setFrequency"><option ${s.frequency==="Monthly"||!s.frequency?"selected":""}>Monthly</option><option ${s.frequency==="Weekly"?"selected":""}>Weekly</option><option ${s.frequency==="Daily"?"selected":""}>Daily</option></select></label>
        <label>Opening Cash<input id="setOpeningCash" type="number" value="${Number(s.openingCash||50000)}"></label>
        <label>Grace Period (days)<input id="setGrace" type="number" value="${Number(s.graceDays||0)}"></label>
      </div>
    </div>
    <div class="section"><div class="section-head"><div><h3>Receipt & Collection</h3><p class="muted">Control payment and receipt behavior</p></div></div>
      <div class="settings-options">
        <label class="toggle-row"><span><b>Auto Receipt Number</b><small>Generate receipt IDs automatically</small></span><input id="setAutoReceipt" type="checkbox" ${s.autoReceipt!==false?"checked":""}></label>
        <label class="toggle-row"><span><b>Allow Partial Payments</b><small>Accept less than the scheduled installment</small></span><input id="setPartial" type="checkbox" ${s.partialPayments!==false?"checked":""}></label>
        <label class="toggle-row"><span><b>Show Loan Balance on Receipt</b><small>Print remaining balance after payment</small></span><input id="setReceiptBalance" type="checkbox" ${s.receiptBalance!==false?"checked":""}></label>
        <label class="toggle-row"><span><b>Due Reminder</b><small>Highlight upcoming and overdue loans</small></span><input id="setReminder" type="checkbox" ${s.dueReminder!==false?"checked":""}></label>
      </div>
    </div>
    <div class="section"><div class="section-head"><div><h3>Security</h3><p class="muted">Basic local-device protection</p></div></div>
      <div class="form-grid settings-form">
        <label>App PIN<input id="setPin" type="password" inputmode="numeric" maxlength="6" placeholder="${s.appPin?"PIN is set":"Set a 4–6 digit PIN"}"></label>
        <label>Confirm PIN<input id="setPin2" type="password" inputmode="numeric" maxlength="6" placeholder="Repeat PIN"></label>
      </div>
      <div class="settings-note">PIN protection is stored locally on this device. Do not use a PIN here as your only security for sensitive production data.</div>
    </div>
    <div class="section"><div class="section-head"><div><h3>Data Management</h3><p class="muted">Protect your local finance records</p></div></div>
      <div class="data-actions"><button class="btn" onclick="exportBackup()">Export Backup</button><button class="btn" onclick="importBackup()">Import Backup</button><button class="btn danger-btn" onclick="resetDemoConfirm()">Reset Demo Data</button></div>
      <div class="settings-note">Backup exports customers, loans, payments, expenses and settings as a JSON file.</div>
    </div>
  </div>
  <div class="settings-save"><button class="btn green" onclick="saveSettings()">Save Settings</button></div>`;
}
function saveSettings(){
  data.settings=data.settings||{};
  const pin=document.getElementById("setPin").value.trim();
  const pin2=document.getElementById("setPin2").value.trim();
  if(pin && (!/^\d{4,6}$/.test(pin)||pin!==pin2)) return toast("PIN must match and contain 4–6 digits");
  Object.assign(data.settings,{
    businessName:document.getElementById("setBusinessName").value.trim()||"FINOVA Finance",
    ownerName:document.getElementById("setOwnerName").value.trim()||"Admin",
    mobile:document.getElementById("setMobile").value.trim(),
    address:document.getElementById("setAddress").value.trim(),
    receiptPrefix:document.getElementById("setReceiptPrefix").value.trim()||"RC",
    currency:document.getElementById("setCurrency").value,
    defaultInterest:Number(document.getElementById("setInterest").value||0),
    interestType:document.getElementById("setInterestType").value,
    defaultInstallment:Number(document.getElementById("setInstallment").value||0),
    frequency:document.getElementById("setFrequency").value,
    openingCash:Number(document.getElementById("setOpeningCash").value||0),
    graceDays:Number(document.getElementById("setGrace").value||0),
    autoReceipt:document.getElementById("setAutoReceipt").checked,
    partialPayments:document.getElementById("setPartial").checked,
    receiptBalance:document.getElementById("setReceiptBalance").checked,
    dueReminder:document.getElementById("setReminder").checked
  });
  if(pin)data.settings.appPin=pin;
  try{
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(data.settings));
    localStorage.setItem(KEY,JSON.stringify(data));
    toast("✓ Settings saved successfully");
    setTimeout(()=>appSettings(),350);
  }catch(e){
    toast("Unable to save settings: "+(e?.message||"storage error"));
  }
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function exportBackup(){
  const payload={version:5,exportedAt:new Date().toISOString(),data};
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));a.download=`finova-backup-${today}.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup exported");
}
function importBackup(){
  const input=document.createElement("input");input.type="file";input.accept=".json,application/json";
  input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);const d=p.data||p;if(!d.customers||!d.loans||!d.payments)throw new Error("Invalid FINOVA backup");data=d;data.settings=(data.settings&&typeof data.settings==="object")?data.settings:{};saveData();toast("Backup restored");appSettings()}catch(e){toast("Invalid backup file")}};r.readAsText(f)};input.click();
}
function resetDemoConfirm(){
  if(confirm("Reset all local demo data? This cannot be undone.")){localStorage.removeItem(KEY);localStorage.removeItem(SETTINGS_KEY);location.reload();}
}
function openCustomer(){
  openModal("Add Customer",`<form onsubmit="addCustomer(event)">
    <div class="form-section-title">Basic Details</div>
    <div class="form-grid">
      <div class="field"><label>Full Name *</label><input name="name" required></div>
      <div class="field"><label>Mobile *</label><input name="mobile" required></div>
      <div class="field"><label>Alternate Mobile</label><input name="altmobile"></div>
      <div class="field"><label>Occupation</label><input name="occupation"></div>
      <div class="field"><label>Monthly Income</label><input name="income" type="number" min="0"></div>
      <div class="field"><label>Area</label><input name="area"></div>
      <div class="field" style="grid-column:1/-1"><label>Address</label><textarea name="address"></textarea></div>
    </div>
    <div class="form-section-title">KYC</div>
    <div class="form-grid">
      <div class="field"><label>ID Type</label><select name="idtype"><option>Aadhaar</option><option>PAN</option><option>Voter ID</option><option>Driving Licence</option><option>Other</option></select></div>
      <div class="field"><label>ID Number</label><input name="idnum"></div>
      <div class="field"><label>PAN</label><input name="pan"></div>
      <div class="field"><label>KYC Status</label><select name="kyc"><option>Pending</option><option>Verified</option></select></div>
    </div>
    <div class="form-section-title">References</div>
    <div class="form-grid">
      <div class="field"><label>Reference Name</label><input name="refname"></div>
      <div class="field"><label>Reference Mobile</label><input name="ref"></div>
    </div>
    <div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Customer</button></div>
  </form>`);
}
function addCustomer(e){
  e.preventDefault();
  let f=new FormData(e.target), mobile=String(f.get("mobile")||"").replace(/\D/g,"");
  if(data.customers.some(c=>String(c.mobile||"").replace(/\D/g,"")===mobile)){toast("Customer with this mobile already exists");return;}
  let id="CUS-"+String(data.customers.length+1).padStart(3,"0");
  data.customers.push({id,name:f.get("name"),mobile,altmobile:f.get("altmobile"),area:f.get("area"),occupation:f.get("occupation"),income:+(f.get("income")||0),address:f.get("address"),idtype:f.get("idtype"),idnum:f.get("idnum"),pan:f.get("pan"),kyc:f.get("kyc"),refname:f.get("refname"),ref:f.get("ref"),borrowed:0,balance:0});
  save();closeModal();toast("Customer added");render("customers");
}
function editCustomer(id){
  const c=getCustomer(id);
  openModal("Edit Customer",`<form onsubmit="saveCustomerEdit(event,'${id}')"><div class="form-grid">
    <div class="field"><label>Full Name</label><input name="name" value="${c.name||""}" required></div>
    <div class="field"><label>Mobile</label><input name="mobile" value="${c.mobile||""}" required></div>
    <div class="field"><label>Area</label><input name="area" value="${c.area||""}"></div>
    <div class="field"><label>Occupation</label><input name="occupation" value="${c.occupation||""}"></div>
    <div class="field"><label>KYC Status</label><select name="kyc"><option ${c.kyc==="Pending"?"selected":""}>Pending</option><option ${c.kyc==="Verified"?"selected":""}>Verified</option></select></div>
    <div class="field"><label>ID Number</label><input name="idnum" value="${c.idnum||""}"></div>
    <div class="field" style="grid-column:1/-1"><label>Address</label><textarea name="address">${c.address||""}</textarea></div>
  </div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Changes</button></div></form>`);
}
function saveCustomerEdit(e,id){
  e.preventDefault();const f=new FormData(e.target),c=getCustomer(id);
  c.name=f.get("name");c.mobile=String(f.get("mobile")||"").replace(/\D/g,"");c.area=f.get("area");c.occupation=f.get("occupation");c.kyc=f.get("kyc");c.idnum=f.get("idnum");c.address=f.get("address");
  save();closeModal();toast("Customer updated");render("customers");
}
function openLoan(){
  const opts=data.customers.map(c=>`<option value="${c.id}">${c.name} · ${c.mobile}</option>`).join("");
  openModal("New Loan",`<form onsubmit="addLoan(event)">
    <div class="form-section-title">Customer</div>
    <div class="form-grid"><div class="field" style="grid-column:1/-1"><label>Select Existing Customer *</label><select name="customerId" required><option value="">Choose customer...</option>${opts}</select></div></div>
    <div class="form-section-title">Loan Details</div>
    <div class="form-grid">
      <div class="field"><label>Principal Amount *</label><input name="amount" type="number" min="1" required></div>
      <div class="field"><label>Loan Type</label><select name="type"><option>Personal</option><option>Business</option><option>Emergency</option><option>Vehicle</option></select></div>
      <div class="field"><label>Interest Type</label><select name="interestType"><option value="flat">Flat</option><option value="reducing">Reducing Balance</option></select></div>
      <div class="field"><label>Interest Rate (%) *</label><input name="rate" type="number" step="0.01" min="0" value="10" required></div>
      <div class="field"><label>Tenure (Months) *</label><input name="tenure" type="number" min="1" value="10" required></div>
      <div class="field"><label>Start Date</label><input name="start" type="date" value="${today}" required></div>
      <div class="field"><label>First Due Date</label><input name="due" type="date" value="${today}" required></div>
      <div class="field"><label>Repayment Frequency</label><select name="frequency"><option>Monthly</option><option>Weekly</option><option>Daily</option></select></div>
    </div>
    <div class="loan-calculation" id="loanCalc"><span>Enter amount and rate to calculate</span></div>
    <div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Create Loan</button></div>
  </form>`);
  setTimeout(()=>{
    const form=document.querySelector("#modal form");
    form?.querySelectorAll("input,select").forEach(x=>x.addEventListener("input",()=>updateLoanCalc(form)));
    updateLoanCalc(form);
  },0);
}
function updateLoanCalc(form){
  const amount=+(form.querySelector('[name="amount"]')?.value||0),rate=+(form.querySelector('[name="rate"]')?.value||0),tenure=+(form.querySelector('[name="tenure"]')?.value||1);
  const interest=amount*rate/100,total=amount+interest,installment=total/tenure;
  const box=form.querySelector("#loanCalc");
  if(box)box.innerHTML=`<div><span>Principal</span><b>${money(amount)}</b></div><div><span>Interest</span><b>${money(interest)}</b></div><div><span>Total Payable</span><b>${money(total)}</b></div><div><span>Installment</span><b>${money(installment)}</b></div>`;
}
function addLoan(e){
  e.preventDefault();const f=new FormData(e.target),customerId=f.get("customerId"),amount=+(f.get("amount")||0),rate=+(f.get("rate")||0),tenure=+(f.get("tenure")||1),interest=amount*rate/100,total=amount+interest,installment=total/tenure;
  if(!customerId||!amount){toast("Select a customer and enter loan amount");return;}
  const id="LN-"+String(data.loans.length+123).padStart(5,"0");
  data.loans.push({id,customerId,amount,balance:total,interest,rate,interestType:f.get("interestType"),type:f.get("type"),tenure,start:f.get("start"),due:f.get("due"),frequency:f.get("frequency"),installment,status:"Active",payments:[]});
  const c=getCustomer(customerId);c.borrowed=(c.borrowed||0)+amount;c.balance=(c.balance||0)+total;
  save();closeModal();toast("Loan created");render("loans");
}
function loanDetail(id){
  const l=data.loans.find(x=>x.id===id);if(!l)return;const c=getCustomer(l.customerId),paid=Math.max(0,(l.amount||0)-(l.balance||0));
  openModal("Loan "+l.id,`<div class="profile-head"><div><div class="customer-head"><div class="avatar big">${(c?.name||"?")[0].toUpperCase()}</div><div><h2>${c?.name||"Unknown"}</h2><small>${c?.id||""} · ${c?.mobile||""}</small><div class="profile-tags"><span class="status ${l.balance<=0?"closed":l.status.toLowerCase()}">${l.balance<=0?"Closed":l.status}</span></div></div></div></div><div class="profile-actions">${l.balance>0?`<button class="btn green" onclick="openPayment('${l.id}')">Collect Payment</button>`:""}<button class="btn light" onclick="loanSchedule('${l.id}')">Schedule</button><button class="btn light" onclick="loanStatement('${l.id}')">Statement</button><button class="btn light" onclick="loanWhatsapp('${l.id}')">WhatsApp</button></div></div>
  <div class="kpis"><div class="kpi"><span>Principal</span><b>${money(l.amount)}</b></div><div class="kpi"><span>Interest</span><b>${money(l.interest||0)}</b></div><div class="kpi"><span>Total Payable</span><b>${money((l.amount||0)+(l.interest||0))}</b></div><div class="kpi"><span>Outstanding</span><b>${money(l.balance)}</b></div></div>
  <div class="profile-grid"><div class="section"><h3>Loan Details</h3><div class="detail-list"><span>Loan Type <b>${l.type||"Personal"}</b></span><span>Interest <b>${l.rate||0}% · ${l.interestType||"Flat"}</b></span><span>Tenure <b>${l.tenure||"-"} months</b></span><span>Frequency <b>${l.frequency||"Monthly"}</b></span><span>Start Date <b>${l.start||"-"}</b></span><span>Next Due <b>${l.due||"-"}</b></span></div></div><div class="section"><h3>Payment Summary</h3><div class="detail-list"><span>Paid <b>${money(paid)}</b></span><span>Balance <b>${money(l.balance)}</b></span><span>Installment <b>${money(l.installment||0)}</b></span><span>Customer Balance <b>${money(c?.balance||0)}</b></span></div></div></div>`);
}
function loanSchedule(id){
  const l=data.loans.find(x=>x.id===id),n=l?.tenure||1,paidPayments=(data.payments||[]).filter(p=>p.loanId===id).sort((a,b)=>a.date.localeCompare(b.date));
  if(!l)return;
  let rows="",remaining=(l.amount||0)+(l.interest||0),start=new Date(l.start||today);
  for(let i=1;i<=n;i++){
    const due=new Date(start); if(l.frequency==="Weekly")due.setDate(due.getDate()+7*i);else if(l.frequency==="Daily")due.setDate(due.getDate()+i);else due.setMonth(due.getMonth()+i);
    const amount=Math.min(l.installment||remaining,remaining), paid=paidPayments.reduce((s,p)=>s+p.amount,0);
    const cumulative=Math.min(paid,((l.installment||0)*i)), rowPaid=Math.max(0,Math.min(amount,cumulative-(i-1)*(l.installment||0)));
    const isPaid=rowPaid>=amount-0.01, dueStr=due.toISOString().slice(0,10);
    const status=isPaid?"Paid":(dueStr<today?"Overdue":(dueStr===today?"Due Today":"Upcoming"));
    rows+=`<tr><td>${i}</td><td>${dueStr}</td><td>${money(amount)}</td><td>${money(rowPaid)}</td><td><span class="status ${status.toLowerCase().replace(" ","-")}">${status}</span></td></tr>`;
    remaining-=amount;if(remaining<=0)break;
  }
  openModal("Repayment Schedule · "+id,`<div class="section"><div class="schedule-head"><div><b>${getCustomer(l.customerId)?.name||""}</b><span>${id} · ${l.frequency||"Monthly"}</span></div><div><b>${money(l.installment||0)}</b><span>per installment</span></div></div><div class="table-scroll"><table class="table"><thead><tr><th>#</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function loanStatement(id){
  const l=data.loans.find(x=>x.id===id),c=getCustomer(l.customerId),ps=data.payments.filter(p=>p.loanId===id).sort((a,b)=>a.date.localeCompare(b.date));
  openModal("Loan Statement",`<div class="statement"><div class="statement-head"><div><h2>FINOVA FINANCE</h2><span>Loan Statement</span></div><b>${today}</b></div><div class="statement-customer"><b>${c?.name||""}</b><span>${l.id} · ${c?.mobile||""}</span></div><div class="kpis"><div class="kpi"><span>Principal</span><b>${money(l.amount)}</b></div><div class="kpi"><span>Interest</span><b>${money(l.interest||0)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(l.balance)}</b></div></div><h3>Payment History</h3>${ps.length?`<table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Amount</th><th>Mode</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.date}</td><td>${p.id}</td><td>${money(p.amount)}</td><td>${p.mode}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">No payments</div>`}</div><div class="form-actions"><button class="btn light" onclick="printLoanStatement('${id}')">Print / PDF</button></div>`);
}
function printLoanStatement(id){
  const body=document.querySelector(".statement")?.outerHTML||"",w=window.open("","_blank");
  w.document.write(`<html><head><title>${id} Statement</title><style>body{font-family:Arial;padding:30px;max-width:850px;margin:auto;color:#10243d}.statement-head{display:flex;justify-content:space-between;border-bottom:2px solid #20ad72;padding-bottom:12px}.statement-head h2{margin:0}.statement-customer{margin:20px 0;display:flex;justify-content:space-between}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.kpi{padding:12px;background:#f4f7fa}.kpi span{display:block;font-size:10px;color:#77859a}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:9px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}</style></head><body>${body}</body></html>`);w.document.close();w.print();
}
function loanWhatsapp(id){
  const l=data.loans.find(x=>x.id===id),c=getCustomer(l.customerId);if(!c)return;
  const text=encodeURIComponent(`Hello ${c.name}, this is FINOVA FINANCE. Your loan ${l.id} has an outstanding amount of ${money(l.balance)}. ${l.balance>0?`Your next due date is ${l.due}.`:"Thank you for completing your loan."}`);
  window.open(`https://wa.me/${String(c.mobile||"").replace(/\D/g,"")}?text=${text}`,"_blank");
}
function editLoan(id){
  const l=data.loans.find(x=>x.id===id);if(!l)return;
  openModal("Edit Loan",`<form onsubmit="saveLoanEdit(event,'${id}')"><div class="form-grid">
    <div class="field"><label>Due Date</label><input type="date" name="due" value="${l.due||today}"></div>
    <div class="field"><label>Status</label><select name="status"><option ${l.status==="Active"?"selected":""}>Active</option><option ${l.status==="Overdue"?"selected":""}>Overdue</option><option ${l.status==="Closed"?"selected":""}>Closed</option></select></div>
    <div class="field"><label>Frequency</label><select name="frequency"><option ${l.frequency==="Daily"?"selected":""}>Daily</option><option ${l.frequency==="Weekly"?"selected":""}>Weekly</option><option ${l.frequency==="Monthly"?"selected":""}>Monthly</option></select></div>
  </div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Changes</button></div></form>`);
}
function saveLoanEdit(e,id){
  e.preventDefault();const l=data.loans.find(x=>x.id===id),f=new FormData(e.target);l.due=f.get("due");l.status=f.get("status");l.frequency=f.get("frequency");if(l.balance<=0)l.status="Closed";save();closeModal();toast("Loan updated");render("loans");
}
function openPayment(loanId){
  const l=data.loans.find(x=>x.id===loanId),c=getCustomer(l?.customerId);if(!l||!c)return;
  openModal("Collect Payment",`<form onsubmit="collectPayment(event,'${loanId}')">
    <div class="payment-summary"><div><span>Customer</span><b>${c.name}</b></div><div><span>Loan</span><b>${l.id}</b></div><div><span>Outstanding</span><b>${money(l.balance)}</b></div></div>
    <div class="form-grid"><div class="field"><label>Amount *</label><input name="amount" type="number" min="1" max="${l.balance}" value="${Math.min(l.balance,l.installment||5000)}" required></div><div class="field"><label>Payment Mode</label><select name="mode"><option>Cash</option><option>UPI</option><option>Bank</option></select></div><div class="field"><label>Payment Date</label><input name="date" type="date" value="${today}" required></div><div class="field"><label>Notes</label><input name="notes"></div></div>
    <div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Collect Payment</button></div>
  </form>`);
}
function collectPayment(e,loanId){
  e.preventDefault();const f=new FormData(e.target),l=data.loans.find(x=>x.id===loanId),c=getCustomer(l.customerId),amount=+(f.get("amount")||0);
  if(!l||amount<=0||amount>l.balance){toast("Enter a valid payment amount");return;}
  const id="RC-"+String(data.payments.length+4).padStart(5,"0");
  data.payments.push({id,loanId,customerId:c.id,amount,date:f.get("date"),mode:f.get("mode"),notes:f.get("notes")});
  l.balance=Math.max(0,l.balance-amount);
  c.balance=Math.max(0,c.balance-amount);
  l.status=l.balance<=0?"Closed":(l.due<today?"Overdue":"Active");
  save();closeModal();toast("Payment collected · "+id);render("loans");
}
function receipt(id){
  let p=data.payments.find(x=>x.id===id),c=getCustomer(p.customerId),l=data.loans.find(x=>x.id===p.loanId);
  const previous=(l?.balance||0)+p.amount;
  const msg=encodeURIComponent(`FINOVA FINANCE Payment Receipt%0AReceipt: ${p.id}%0ACustomer: ${c.name}%0ALoan: ${l.id}%0APaid: ${money(p.amount)}%0ABalance: ${money(l.balance)}%0ADate: ${p.date}%0AMode: ${p.mode}`);
  openModal("Payment Receipt",`<div id="printReceipt" class="receipt">
    <div class="receipt-brand"><div class="logo">₹</div><div><h2>FINOVA FINANCE</h2><span>Official Payment Receipt</span></div></div>
    <div class="receipt-grid"><div><span>Receipt No</span><b>${p.id}</b></div><div><span>Date</span><b>${p.date}</b></div><div><span>Customer</span><b>${c.name}</b></div><div><span>Loan No</span><b>${l.id}</b></div></div>
    <div class="receipt-amount"><span>Payment Received</span><strong>${money(p.amount)}</strong></div>
    <div class="receipt-grid"><div><span>Previous Outstanding</span><b>${money(previous)}</b></div><div><span>Balance Outstanding</span><b>${money(l.balance)}</b></div><div><span>Payment Mode</span><b>${p.mode}</b></div><div><span>Reference</span><b>${p.ref||"-"}</b></div></div>
    <div class="receipt-note">Thank you for your payment. Please keep this receipt for your records.</div>
  </div>
  <div class="form-actions">
    <button class="btn light" onclick="printReceipt('${p.id}')">Print / PDF</button>
    <button class="btn green" onclick="window.open('https://wa.me/${(c.mobile||'').replace(/\\D/g,'')}?text=${msg}','_blank')">WhatsApp</button>
  </div>`);
}
function printReceipt(id){
  const el=document.getElementById("printReceipt"),w=window.open("","_blank");
  w.document.write(`<html><head><title>${id}</title><style>body{font-family:Arial;padding:30px;max-width:650px;margin:auto}.receipt-brand{display:flex;gap:12px;align-items:center;border-bottom:2px solid #1fac70;padding-bottom:16px}.logo{width:40px;height:40px;background:#20b879;color:white;border-radius:10px;display:grid;place-items:center;font-weight:bold}.receipt-brand h2{margin:0}.receipt-brand span{color:#777;font-size:12px}.receipt-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}.receipt-grid span{display:block;color:#777;font-size:11px;margin-bottom:4px}.receipt-amount{background:#effaf5;padding:18px;border-radius:10px;display:flex;justify-content:space-between;align-items:center}.receipt-amount strong{font-size:25px;color:#158c59}.receipt-note{margin-top:20px;padding-top:15px;border-top:1px solid #ddd;color:#777;font-size:12px}</style></head><body>${el.outerHTML}</body></html>`);
  w.document.close();w.print();
}
function openExpense(){openModal("Add Expense",`<form onsubmit="addExpense(event)"><div class="form-grid"><div class="field"><label>Category</label><select name="category"><option>Office</option><option>Travel</option><option>Salary</option><option>Commission</option><option>Other</option></select></div><div class="field"><label>Amount</label><input name="amount" type="number" required></div><div class="field"><label>Date</label><input name="date" type="date" value="${today}"></div><div class="field"><label>Mode</label><select name="mode"><option>Cash</option><option>UPI</option><option>Bank</option></select></div><div class="field" style="grid-column:1/-1"><label>Description</label><textarea name="description"></textarea></div></div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Expense</button></div></form>`)}
function addExpense(e){e.preventDefault();let f=new FormData(e.target);data.expenses.push({category:f.get("category"),amount:+f.get("amount"),date:f.get("date"),mode:f.get("mode"),description:f.get("description")});save();closeModal();toast("Expense added");render("expenses")}
function customerDetail(id){
  const c=getCustomer(id),ls=data.loans.filter(l=>l.customerId===id),ps=data.payments.filter(p=>p.customerId===id).sort((a,b)=>b.date.localeCompare(a.date));
  const paid=Math.max(0,(c.borrowed||0)-(c.balance||0)),interest=ls.reduce((s,l)=>s+(l.interest||0),0),due=ls.find(l=>l.balance>0);
  const loansHtml=ls.length?loanTable(ls):`<div class="empty">No loans</div>`;
  const paymentsHtml=ps.length?`<div style="overflow:auto"><table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Loan</th><th>Amount</th><th>Mode</th><th>Action</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.date}</td><td><b>${p.id}</b></td><td>${p.loanId}</td><td>${money(p.amount)}</td><td>${p.mode}</td><td><button class="mini-btn" onclick="receipt('${p.id}')">Receipt</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No payments</div>`;
  openModal(c.name,`<div class="profile-head"><div><div class="customer-head"><div class="avatar big">${(c.name||"?")[0].toUpperCase()}</div><div><h2>${c.name}</h2><small>${c.id} · ${c.mobile}</small><div class="profile-tags"><span class="status ${c.balance>0?"active":"closed"}">${c.balance>0?"Active":"Closed"}</span><span class="kyc-badge">${c.kyc||"KYC Pending"}</span></div></div></div></div><div class="profile-actions">${c.balance>0?`<button class="btn green" onclick="openCustomerPayment('${id}')">Collect Payment</button>`:""}<button class="btn light" onclick="editCustomer('${id}')">Edit</button><button class="btn light" onclick="customerStatement('${id}')">Statement</button><button class="btn light" onclick="whatsappCustomer('${id}')">WhatsApp</button></div></div>
  <div class="kpis"><div class="kpi"><span>Total Borrowed</span><b>${money(c.borrowed)}</b></div><div class="kpi"><span>Total Paid</span><b>${money(paid)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(c.balance)}</b></div><div class="kpi"><span>Interest Portfolio</span><b>${money(interest)}</b></div></div>
  <div class="profile-tabs"><button class="active" onclick="profileTab(this,'overview-${id}')">Overview</button><button onclick="profileTab(this,'loans-${id}')">Loans</button><button onclick="profileTab(this,'payments-${id}')">Payments</button><button onclick="profileTab(this,'kyc-${id}')">KYC</button><button onclick="profileTab(this,'activity-${id}')">Activity</button></div>
  <div id="overview-${id}" class="profile-tab"><div class="profile-grid"><div class="section"><h3>Current Loan</h3>${due?`<div class="loan-highlight"><b>${due.id}</b><span>${money(due.balance)} outstanding</span><small>Due: ${due.due} · ${due.status}</small></div>`:`<div class="empty">No active loan</div>`}</div><div class="section"><h3>Customer Details</h3><div class="detail-list"><span>Area <b>${c.area||"-"}</b></span><span>Occupation <b>${c.occupation||"-"}</b></span><span>Address <b>${c.address||"-"}</b></span><span>Last Payment <b>${ps[0]?money(ps[0].amount):"-"}</b></span></div></div></div></div>
  <div id="loans-${id}" class="profile-tab hidden">${loansHtml}</div>
  <div id="payments-${id}" class="profile-tab hidden">${paymentsHtml}</div>
  <div id="kyc-${id}" class="profile-tab hidden"><div class="profile-grid"><div class="section"><h3>KYC Information</h3><div class="detail-list"><span>ID Type <b>${c.idtype||"-"}</b></span><span>ID Number <b>${c.idnum?maskKyc(c.idnum):"-"}</b></span><span>PAN <b>${c.pan?maskKyc(c.pan):"-"}</b></span><span>KYC Status <b>${c.kyc||"Pending"}</b></span></div></div><div class="section"><h3>References</h3><div class="detail-list"><span>Name <b>${c.refname||"-"}</b></span><span>Mobile <b>${c.ref||"-"}</b></span></div></div></div></div>
  <div id="activity-${id}" class="profile-tab hidden">${activityHtml(c,ls,ps)}</div>`);
}
function profileTab(btn,id){
  btn.parentElement.querySelectorAll("button").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  btn.parentElement.parentElement.querySelectorAll(".profile-tab").forEach(x=>x.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}
function maskKyc(v){const s=String(v);return s.length<=4?"••••":("•".repeat(Math.max(0,s.length-4))+s.slice(-4));}
function activityHtml(c,ls,ps){
  const items=[];
  if(c)items.push(`<div class="activity-item"><b>Customer created</b><span>${c.id}</span></div>`);
  ls.forEach(l=>items.push(`<div class="activity-item"><b>Loan ${l.id} · ${l.status}</b><span>${money(l.amount)} · Due ${l.due}</span></div>`));
  ps.forEach(p=>items.push(`<div class="activity-item"><b>Payment ${p.id}</b><span>${p.date} · ${money(p.amount)} · ${p.mode}</span></div>`));
  return `<div class="section"><h3>Activity History</h3>${items.reverse().join("")}</div>`;
}
function customerStatement(id){
  const c=getCustomer(id),ls=data.loans.filter(l=>l.customerId===id),ps=data.payments.filter(p=>p.customerId===id).sort((a,b)=>a.date.localeCompare(b.date));
  const paid=Math.max(0,(c.borrowed||0)-(c.balance||0));
  const html=`<div class="statement"><div class="statement-head"><div><h2>FINOVA FINANCE</h2><span>Customer Statement</span></div><b>${today}</b></div><div class="statement-customer"><b>${c.name}</b><span>${c.id} · ${c.mobile}</span></div><div class="kpis"><div class="kpi"><span>Total Borrowed</span><b>${money(c.borrowed)}</b></div><div class="kpi"><span>Total Paid</span><b>${money(paid)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(c.balance)}</b></div></div><h3>Loans</h3>${loanTable(ls)}<h3 style="margin-top:18px">Payments</h3>${ps.length?`<table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Amount</th><th>Mode</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.date}</td><td>${p.id}</td><td>${money(p.amount)}</td><td>${p.mode}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">No payments</div>`}</div><div class="form-actions"><button class="btn light" onclick="printStatement('${id}')">Print / PDF</button></div>`;
  openModal("Customer Statement",html);
}
function printStatement(id){
  const c=getCustomer(id),w=window.open("","_blank");
  const body=document.querySelector(".statement")?.outerHTML||"";
  w.document.write(`<html><head><title>${c.name} - Statement</title><style>body{font-family:Arial;padding:30px;max-width:850px;margin:auto;color:#10243d}.statement-head{display:flex;justify-content:space-between;border-bottom:2px solid #20ad72;padding-bottom:12px}.statement-head h2{margin:0}.statement-head span{color:#77859a}.statement-customer{margin:20px 0;display:flex;justify-content:space-between}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.kpi{padding:12px;background:#f4f7fa;border-radius:8px}.kpi span{display:block;font-size:10px;color:#77859a}.kpi b{font-size:16px}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:9px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}</style></head><body>${body}</body></html>`);w.document.close();w.print();
}
function whatsappCustomer(id){
  const c=getCustomer(id),l=data.loans.find(x=>x.customerId===id&&x.balance>0);
  const text=encodeURIComponent(`Hello ${c.name}, this is FINOVA FINANCE. Your current outstanding amount is ${money(c.balance)}${l?`. Your loan ${l.id} due amount is ${money(Math.min(l.balance,5000))} on ${l.due}.`:"."}`);
  window.open(`https://wa.me/${String(c.mobile||"").replace(/\D/g,"")}?text=${text}`,"_blank");
}
function openModal(t,b){document.getElementById("modalTitle").textContent=t;document.getElementById("modalBody").innerHTML=b;document.getElementById("modal").classList.remove("hidden")}function closeModal(){document.getElementById("modal").classList.add("hidden")}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2200)}
function exportData(){let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="finova-v2-backup.json";a.click()}
function resetData(){if(confirm("Reset demo data?")){localStorage.removeItem(KEY);location.reload()}}
try{render("dashboard")}catch(err){console.error(err);document.getElementById("page").innerHTML=`<div class="card error-card"><h2>FINOVA could not load</h2><p>Saved data was incompatible. Reset the demo data and reload.</p><button class="btn green" onclick="resetData()">Reset Demo Data</button><button class="btn light" onclick="location.reload()">Reload</button><pre>${String(err.message||err)}</pre></div>`}
function resetData(){localStorage.removeItem(KEY);location.reload()}

/* FINOVA V7 - Customer 360 + Loan Detail enhancements */
function customerDetail(id){
  const c=getCustomer(id); if(!c)return;
  const ls=data.loans.filter(l=>l.customerId===id);
  const ps=data.payments.filter(p=>p.customerId===id).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const totalPayable=ls.reduce((s,l)=>s+(Number(l.amount)||0)+(Number(l.interest)||0),0);
  const outstanding=ls.reduce((s,l)=>s+(Number(l.balance)||0),0);
  const totalPaid=Math.max(0,totalPayable-outstanding);
  const overdue=ls.filter(l=>l.balance>0&&l.status==='Overdue').reduce((s,l)=>s+l.balance,0);
  const active=ls.filter(l=>l.balance>0).length;
  const last=ps[0];
  const escx=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const loanRowsHtml=ls.length?`<div class="table-scroll"><table class="table"><thead><tr><th>Loan</th><th>Principal</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>${ls.map(l=>{const total=(l.amount||0)+(l.interest||0),paid=Math.max(0,total-(l.balance||0)),st=l.balance<=0?'Closed':l.status;return `<tr><td><b>${l.id}</b><small>${l.type||'Personal'} · ${l.frequency||'Monthly'}</small></td><td>${money(l.amount)}</td><td>${money(total)}</td><td>${money(paid)}</td><td><b>${money(l.balance)}</b></td><td>${l.balance>0?(l.due||'-'):'-'}</td><td><span class="status ${st.toLowerCase()}">${st}</span></td><td><button class="mini-btn" onclick="loanDetail('${l.id}')">Open</button></td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty">No loans for this customer</div>`;
  const paymentRows=ps.length?`<div class="table-scroll"><table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Loan</th><th>Amount</th><th>Mode</th><th></th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.date||'-'}</td><td><b>${p.id}</b></td><td>${p.loanId||'-'}</td><td><b>${money(p.amount)}</b></td><td>${p.mode||'-'}</td><td><button class="mini-btn" onclick="receipt('${p.id}')">Receipt</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">No payments recorded</div>`;
  const activity=[...ls.map(l=>({date:l.start||l.due||'',html:`<b>Loan ${l.id}</b><span>${money(l.amount)} principal · ${l.status}</span>`})),...ps.map(p=>({date:p.date||'',html:`<b>Payment ${p.id}</b><span>${money(p.amount)} · ${p.mode||'-'}</span>`}))].sort((a,b)=>b.date.localeCompare(a.date));
  openModal('Customer 360 · '+c.name,`<div class="v7-profile">
    <div class="v7-hero"><div class="customer-head"><div class="avatar big">${(c.name||'?')[0].toUpperCase()}</div><div><h2>${escx(c.name)}</h2><small>${escx(c.id)} · ${escx(c.mobile)}</small><div class="profile-tags"><span class="status ${outstanding>0?'active':'closed'}">${outstanding>0?'Active':'Closed'}</span><span class="kyc-badge">${escx(c.kyc||'KYC Pending')}</span></div></div></div><div class="profile-actions"><button class="btn green" onclick="openCustomerPayment('${id}')" ${outstanding<=0?'disabled':''}>Collect Payment</button><button class="btn light" onclick="openLoanForCustomer('${id}')">+ New Loan</button><button class="btn light" onclick="editCustomer('${id}')">Edit</button><button class="btn light" onclick="customerStatement('${id}')">Statement</button><button class="btn light" onclick="whatsappCustomer('${id}')">WhatsApp</button></div></div>
    <div class="kpis v7-kpis"><div class="kpi"><span>Total Borrowed</span><b>${money(c.borrowed||ls.reduce((s,l)=>s+l.amount,0))}</b></div><div class="kpi"><span>Total Paid</span><b>${money(totalPaid)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(outstanding)}</b></div><div class="kpi"><span>Overdue</span><b class="amount-red">${money(overdue)}</b></div></div>
    <div class="v7-grid"><div class="section"><h3>Customer Details</h3><div class="detail-list"><span>Mobile <b>${escx(c.mobile||'-')}</b></span><span>Alternate Mobile <b>${escx(c.altmobile||'-')}</b></span><span>Area <b>${escx(c.area||'-')}</b></span><span>Occupation <b>${escx(c.occupation||'-')}</b></span><span>Monthly Income <b>${c.income?money(c.income):'-'}</b></span><span>Address <b>${escx(c.address||'-')}</b></span></div></div><div class="section"><h3>KYC & Reference</h3><div class="detail-list"><span>ID Type <b>${escx(c.idtype||'-')}</b></span><span>ID Number <b>${c.idnum?maskKyc(c.idnum):'-'}</b></span><span>PAN <b>${c.pan?maskKyc(c.pan):'-'}</b></span><span>KYC Status <b>${escx(c.kyc||'Pending')}</b></span><span>Reference <b>${escx(c.refname||'-')}</b></span><span>Reference Mobile <b>${escx(c.ref||'-')}</b></span></div></div></div>
    <div class="v7-section"><div class="section-head"><h3>All Loans (${ls.length})</h3><button class="btn light" onclick="render('loans');closeModal()">View Loans</button></div>${loanRowsHtml}</div>
    <div class="v7-section"><div class="section-head"><h3>Payment History (${ps.length})</h3><span class="muted">Last payment: ${last?last.date+' · '+money(last.amount):'No payment'}</span></div>${paymentRows}</div>
    <div class="v7-grid"><div class="section"><h3>Portfolio Summary</h3><div class="detail-list"><span>Active Loans <b>${active}</b></span><span>Closed Loans <b>${ls.filter(l=>l.balance<=0).length}</b></span><span>Total Receipts <b>${ps.length}</b></span><span>Recovery <b>${totalPayable?Math.round(totalPaid/totalPayable*100):0}%</b></span></div></div><div class="section"><h3>Recent Activity</h3>${activity.length?activity.slice(0,6).map(x=>`<div class="activity-item"><b>${x.html.split('<span>')[0].replace('<b>','').replace('</b>','')}</b><span>${x.date}</span></div>`).join(''):'<div class="empty">No activity</div>'}</div></div>
  </div>`);
}
function openLoanForCustomer(customerId){closeModal();setTimeout(()=>{openLoan();const s=document.querySelector('#modal select[name="customerId"]');if(s)s.value=customerId;},0)}
function loanDetail(id){
  const l=data.loans.find(x=>x.id===id);if(!l)return;const c=getCustomer(l.customerId);const total=(l.amount||0)+(l.interest||0),paid=Math.max(0,total-(l.balance||0));
  const ps=data.payments.filter(p=>p.loanId===id).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const st=l.balance<=0?'Closed':l.status;
  const scheduleRows=buildV7Schedule(l);
  openModal('Loan Detail · '+l.id,`<div class="v7-profile"><div class="v7-hero"><div class="customer-head"><div class="avatar big">${(c?.name||'?')[0].toUpperCase()}</div><div><h2>${c?.name||'Unknown'}</h2><small>${c?.id||''} · ${c?.mobile||''} · ${l.id}</small><div class="profile-tags"><span class="status ${st.toLowerCase()}">${st}</span></div></div></div><div class="profile-actions">${l.balance>0?`<button class="btn green" onclick="openPayment('${id}')">Collect Payment</button>`:''}<button class="btn light" onclick="loanSchedule('${id}')">Full Schedule</button><button class="btn light" onclick="loanStatement('${id}')">Statement</button><button class="btn light" onclick="loanWhatsapp('${id}')">WhatsApp</button><button class="btn light" onclick="editLoan('${id}')">Edit</button></div></div>
  <div class="kpis v7-kpis"><div class="kpi"><span>Principal</span><b>${money(l.amount)}</b></div><div class="kpi"><span>Interest</span><b>${money(l.interest)}</b></div><div class="kpi"><span>Total Payable</span><b>${money(total)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(l.balance)}</b></div></div>
  <div class="v7-grid"><div class="section"><h3>Loan Details</h3><div class="detail-list"><span>Loan Type <b>${l.type||'Personal'}</b></span><span>Interest <b>${l.rate||0}% · ${l.interestType||'Flat'}</b></span><span>Tenure <b>${l.tenure||'-'} months</b></span><span>Frequency <b>${l.frequency||'Monthly'}</b></span><span>Start Date <b>${l.start||'-'}</b></span><span>Next Due <b>${l.balance>0?(l.due||'-'):'Closed'}</b></span></div></div><div class="section"><h3>Repayment Summary</h3><div class="detail-list"><span>Total Paid <b>${money(paid)}</b></span><span>Installment <b>${money(l.installment||0)}</b></span><span>Payments <b>${ps.length}</b></span><span>Recovery <b>${total?Math.round(paid/total*100):0}%</b></span></div><div class="progress-track" style="margin-top:14px"><div class="progress-fill" style="width:${total?Math.min(100,paid/total*100):0}%"></div></div></div></div>
  <div class="v7-section"><div class="section-head"><h3>Repayment Schedule</h3><span class="muted">${l.frequency||'Monthly'} · ${l.tenure||1} installments</span></div>${scheduleRows}</div>
  <div class="v7-section"><div class="section-head"><h3>Payment History (${ps.length})</h3></div>${ps.length?`<div class="table-scroll"><table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Amount</th><th>Mode</th><th>Balance After</th><th></th></tr></thead><tbody>${ps.map(p=>{const balAfter=(l.balance||0)+ps.filter(x=>(x.date||'')>= (p.date||'')).reduce((s,x)=>s+x.amount,0)-p.amount;return `<tr><td>${p.date||'-'}</td><td><b>${p.id}</b></td><td><b>${money(p.amount)}</b></td><td>${p.mode||'-'}</td><td>${money(Math.max(0,balAfter))}</td><td><button class="mini-btn" onclick="receipt('${p.id}')">Receipt</button></td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty">No payments recorded</div>`}</div></div>`);
}
function buildV7Schedule(l){
  const n=Math.max(1,Number(l.tenure||1));let remaining=(l.amount||0)+(l.interest||0);const start=new Date(l.start||today);const payments=[...data.payments.filter(p=>p.loanId===l.id)].sort((a,b)=>(a.date||'').localeCompare(b.date||''));let paidPool=payments.reduce((s,p)=>s+Number(p.amount||0),0),rows='';
  for(let i=1;i<=n&&remaining>0.009;i++){const d=new Date(start);if(l.frequency==='Weekly')d.setDate(d.getDate()+7*i);else if(l.frequency==='Daily')d.setDate(d.getDate()+i);else d.setMonth(d.getMonth()+i);const due=d.toISOString().slice(0,10);const amt=Math.min(Number(l.installment||remaining),remaining);const rowPaid=Math.min(amt,paidPool);paidPool=Math.max(0,paidPool-rowPaid);const status=rowPaid>=amt-.01?'Paid':due<today?'Overdue':due===today?'Due Today':'Upcoming';rows+=`<tr><td>${i}</td><td>${due}</td><td>${money(amt)}</td><td>${money(rowPaid)}</td><td>${money(Math.max(0,amt-rowPaid))}</td><td><span class="status ${status.toLowerCase().replace(/ /g,'-')}">${status}</span></td></tr>`;remaining-=amt;}
  return `<div class="table-scroll"><table class="table"><thead><tr><th>#</th><th>Due Date</th><th>Installment</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// FINOVA V9 sidebar polish: desktop collapse, mobile menu remains unchanged.
document.addEventListener('DOMContentLoaded',()=>{
  const sb=document.querySelector('.sidebar'), btn=document.getElementById('sidebarCollapse');
  if(btn&&sb){btn.addEventListener('click',()=>{if(window.innerWidth>760){sb.classList.toggle('is-collapsed');btn.textContent=sb.classList.contains('is-collapsed')?'›':'‹';localStorage.setItem('finovaSidebarCollapsed',sb.classList.contains('is-collapsed')?'1':'0');}});if(window.innerWidth>760&&localStorage.getItem('finovaSidebarCollapsed')==='1'){sb.classList.add('is-collapsed');btn.textContent='›';}}
});

// FINOVA V10: working notification + admin dropdown menus.
function closeTopMenus(){
  ['notificationMenu','profileMenu'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
  document.getElementById('notificationBtn')?.setAttribute('aria-expanded','false');
  document.getElementById('profileBtn')?.setAttribute('aria-expanded','false');
}
function getNotifications(){
  const overdue=(data.loans||[]).filter(l=>Number(l.balance||0)>0 && (l.status==='Overdue' || (l.due&&l.due<today)));
  const due=(data.loans||[]).filter(l=>Number(l.balance||0)>0 && l.due===today);
  const recent=(data.payments||[]).filter(p=>p.date===today).slice(0,3);
  const items=[];
  overdue.slice(0,4).forEach(l=>{const c=getCustomer(l.customerId);items.push({title:`Overdue: ${c?.name||'Customer'}`,text:`${l.id} · ${money(l.balance)} outstanding`,page:'dues'});});
  due.slice(0,3).forEach(l=>{const c=getCustomer(l.customerId);items.push({title:`Payment due today: ${c?.name||'Customer'}`,text:`${l.id} · ${money(l.installment||l.balance||0)}`,page:'dues'});});
  recent.forEach(p=>items.push({title:'Payment received',text:`${p.id} · ${money(p.amount)} · ${p.mode||'Cash'}`,page:'collections'}));
  return items;
}
function renderNotifications(){
  const list=document.getElementById('notificationList'), count=document.getElementById('alertCount'); if(!list)return;
  const items=getNotifications(); if(count){count.textContent=items.length;count.style.display=items.length?'block':'none';}
  list.innerHTML=items.length?items.slice(0,7).map((x,i)=>`<button class="notification-item" style="width:100%;background:transparent;border:0;text-align:left" onclick="render('${x.page}');closeTopMenus()"><span class="notification-dot"></span><span><b>${escx(x.title)}</b><small>${escx(x.text)}</small></span></button>`).join(''):`<div class="empty" style="padding:24px 8px;font-size:11px">No new notifications</div>`;
}
function clearNotifications(){
  const list=document.getElementById('notificationList'); if(list)list.innerHTML='<div class="empty" style="padding:24px 8px;font-size:11px">Notifications cleared</div>';
  const count=document.getElementById('alertCount');if(count){count.textContent='0';count.style.display='none'}
}
function showProfileInfo(){
  closeTopMenus();
  const s=data.settings||{};
  openModal('Admin Profile',`<div class="profile-info"><div class="avatar big">A</div><div><h2 style="margin:0">${escx(s.ownerName||'Admin')}</h2><p class="muted">Finance Manager</p><div class="detail-list"><span>Business <b>${escx(s.businessName||'FINOVA Finance')}</b></span><span>Mobile <b>${escx(s.mobile||'-')}</b></span></div></div></div>`);
}
function appLogout(){
  closeTopMenus();
  if(confirm('Logout from FINOVA on this device?')) toast('Logged out');
}

document.addEventListener('DOMContentLoaded',()=>{
  const nb=document.getElementById('notificationBtn'), pb=document.getElementById('profileBtn');
  renderNotifications();
  nb?.addEventListener('click',e=>{e.stopPropagation();const m=document.getElementById('notificationMenu');const open=m.classList.contains('hidden');closeTopMenus();if(open){m.classList.remove('hidden');nb.setAttribute('aria-expanded','true');}});
  pb?.addEventListener('click',e=>{e.stopPropagation();const m=document.getElementById('profileMenu');const open=m.classList.contains('hidden');closeTopMenus();if(open){m.classList.remove('hidden');pb.setAttribute('aria-expanded','true');}});
  document.addEventListener('click',e=>{if(!e.target.closest('.top-menu-wrap'))closeTopMenus()});
});

/* =========================================================
   FINOVA PROFESSIONAL PACK
   Functionality-only upgrade. Existing visual structure is preserved.
   ========================================================= */
(function(){
  data.followUps=Array.isArray(data.followUps)?data.followUps:[];
  data.auditLog=Array.isArray(data.auditLog)?data.auditLog:[];
  data.cashClosings=Array.isArray(data.cashClosings)?data.cashClosings:[];
  data.users=Array.isArray(data.users)?data.users:[{id:'USR-001',name:'Admin',role:'Admin',active:true}];
  data.settings=data.settings||{};
  data.settings.role=data.settings.role||'Admin';
  data.settings.graceDays=Number(data.settings.graceDays||0);
  data.loans.forEach(l=>{
    l.createdAt=l.createdAt||l.start||today;
    l.interestType=l.interestType||'Flat';
    l.frequency=l.frequency||'Monthly';
    l.tenure=Number(l.tenure||1);
    l.installment=Number(l.installment||(((l.amount||0)+(l.interest||0))/Math.max(1,l.tenure)));
    l.status=l.balance<=0?'Closed':((l.due&&l.due<today)?'Overdue':(l.due===today?'Active':(l.status||'Active')));
  });
  data.payments.forEach(p=>{p.time=p.time||'';p.ref=p.ref||p.reference||'';p.notes=p.notes||'';p.createdAt=p.createdAt||p.date||today;});
  data.customers.forEach(c=>{c.balance=Number(c.balance||0);c.borrowed=Number(c.borrowed||0);c.followUpStatus=c.followUpStatus||'Pending';});
  save();
})();

function profNow(){return new Date().toISOString();}
function audit(action,entity,entityId,details){
  data.auditLog=data.auditLog||[];
  data.auditLog.unshift({id:'AUD-'+Date.now(),timestamp:profNow(),user:(data.settings?.ownerName||'Admin'),role:(data.settings?.role||'Admin'),action,entity,entityId:entityId||'',details:details||''});
  data.auditLog=data.auditLog.slice(0,1000); save();
}
function roleAllowed(roles){const r=data.settings?.role||'Admin';return roles.includes(r)||r==='Admin';}
function guard(roles){if(roleAllowed(roles))return true;toast('Your role does not have permission for this action');return false;}
function refreshLoanStatuses(){
  let changed=false;
  data.loans.forEach(l=>{const old=l.status; l.status=l.balance<=0?'Closed':(l.due&&l.due<today?'Overdue':'Active');if(old!==l.status)changed=true;});
  if(changed)save();
}
function loanTotal(l){return Number(l.amount||0)+Number(l.interest||0)}
function paidForLoan(l){return Math.max(0,loanTotal(l)-Number(l.balance||0))}
function dueAmountToday(){return data.loans.filter(l=>l.balance>0&&l.due===today).reduce((s,l)=>s+Math.min(Number(l.balance||0),Number(l.installment||l.balance||0)),0)}
function overdueLoans(){return data.loans.filter(l=>l.balance>0&&(l.status==='Overdue'||(l.due&&l.due<today)))}
function nextDueDate(l){
  const start=new Date(l.start||today); const n=Math.max(1,Number(l.tenure||1));
  const ps=data.payments.filter(p=>p.loanId===l.id).reduce((s,p)=>s+Number(p.amount||0),0);
  const inst=Number(l.installment||loanTotal(l)/n)||loanTotal(l);
  let paidInst=Math.floor(ps/inst);
  if(ps>=loanTotal(l)-.01)return '';
  const d=new Date(start); const idx=Math.min(n,Math.max(1,paidInst+1));
  if(l.frequency==='Weekly')d.setDate(d.getDate()+7*idx);else if(l.frequency==='Daily')d.setDate(d.getDate()+idx);else d.setMonth(d.getMonth()+idx);
  return d.toISOString().slice(0,10);
}
function escapeCsv(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function downloadTextFile(name,text,type='text/plain'){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function exportProfessionalCSV(kind){
  if(!guard(['Admin','Manager','Viewer']))return;
  let rows=[],name='finova-export.csv';
  if(kind==='customers'){rows=[['ID','Name','Mobile','Area','Occupation','Borrowed','Outstanding','Follow-up Status'],...data.customers.map(c=>[c.id,c.name,c.mobile,c.area,c.occupation,c.borrowed,c.balance,c.followUpStatus])];name='finova-customers.csv';}
  if(kind==='loans'){rows=[['Loan ID','Customer','Principal','Interest','Total','Paid','Outstanding','Due','Frequency','Status'],...data.loans.map(l=>[l.id,getCustomer(l.customerId)?.name||'',l.amount,l.interest,loanTotal(l),paidForLoan(l),l.balance,l.due,l.frequency,l.balance<=0?'Closed':l.status])];name='finova-loans.csv';}
  if(kind==='payments'){rows=[['Receipt','Date','Customer','Loan','Amount','Mode','Reference','Notes'],...data.payments.map(p=>[p.id,p.date,getCustomer(p.customerId)?.name||'',p.loanId,p.amount,p.mode,p.ref,p.notes])];name='finova-payments.csv';}
  if(kind==='audit'){rows=[['Timestamp','User','Role','Action','Entity','Entity ID','Details'],...data.auditLog.map(a=>[a.timestamp,a.user,a.role,a.action,a.entity,a.entityId,a.details])];name='finova-audit-log.csv';}
  downloadTextFile(name,rows.map(r=>r.map(escapeCsv).join(',')).join('\n'),'text/csv');toast('CSV exported');
}

function openFollowUp(customerId,loanId){
  if(!guard(['Admin','Manager','Collector']))return;
  const c=getCustomer(customerId); if(!c)return;
  const existing=(data.followUps||[]).filter(x=>x.customerId===customerId).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
  openModal('Customer Follow-up',`<form onsubmit="saveFollowUp(event,'${customerId}','${loanId||''}')"><div class="form-grid">
    <div class="field"><label>Status</label><select name="status"><option>Pending</option><option>Contacted</option><option>Promised</option><option>Done</option></select></div>
    <div class="field"><label>Priority</label><select name="priority"><option>High</option><option selected>Medium</option><option>Low</option></select></div>
    <div class="field"><label>Next Follow-up</label><input type="date" name="date" value="${existing?.date||today}"></div>
    <div class="field"><label>Loan</label><select name="loanId"><option value="">Customer</option>${data.loans.filter(l=>l.customerId===customerId).map(l=>`<option value="${l.id}" ${l.id===loanId?'selected':''}>${l.id} · ${money(l.balance)}</option>`).join('')}</select></div>
    <div class="field" style="grid-column:1/-1"><label>Notes</label><textarea name="notes" rows="4" placeholder="Call result, promise date, next action...">${esc(existing?.notes||'')}</textarea></div>
  </div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Follow-up</button></div></form>`);
}
function saveFollowUp(e,customerId,loanId){
  e.preventDefault(); const f=new FormData(e.target); const item={id:'FU-'+Date.now(),customerId,loanId:f.get('loanId')||loanId||'',status:f.get('status'),priority:f.get('priority'),date:f.get('date')||today,notes:f.get('notes')||'',createdAt:profNow()};
  data.followUps=data.followUps||[];data.followUps.unshift(item);const c=getCustomer(customerId);if(c)c.followUpStatus=item.status;save();audit('Follow-up saved','Customer',customerId,`${item.status} · ${item.priority}`);closeModal();toast('Follow-up saved');render('dues');
}
function followUpHistory(customerId){
  const c=getCustomer(customerId),items=(data.followUps||[]).filter(x=>x.customerId===customerId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  openModal('Follow-up History · '+(c?.name||''),items.length?`<div class="followup-history">${items.map(x=>`<div class="followup-item"><div><b>${x.status}</b><small>${x.date||'-'} · ${x.priority||'Medium'} ${x.loanId?'· '+x.loanId:''}</small></div><p>${esc(x.notes||'No notes')}</p></div>`).join('')}</div>`:`<div class="empty">No follow-up history</div>`);
}

function professionalDues(){
  refreshLoanStatuses();
  const over=overdueLoans(), todayLoans=data.loans.filter(l=>l.balance>0&&l.due===today), upcoming=data.loans.filter(l=>l.balance>0&&l.due>today).sort((a,b)=>a.due.localeCompare(b.due));
  const promised=(data.followUps||[]).filter(x=>x.status==='Promised'&&x.date>=today).length;
  page.innerHTML=title('Due Management','Today, upcoming and overdue collection workflow',`<button class="btn green" onclick="openPayment()">Collect Payment</button><button class="btn light" onclick="exportProfessionalCSV('loans')">Export Loans</button>`)+
  `<div class="cards"><div class="card metric"><div><div class="label">Today's Due</div><div class="value">${money(dueAmountToday())}</div><div class="sub">${todayLoans.length} loans</div></div><div class="metric-icon">◷</div></div>
  <div class="card metric"><div><div class="label">Upcoming</div><div class="value">${upcoming.length}</div><div class="sub">Future installments</div></div><div class="metric-icon">→</div></div>
  <div class="card metric"><div><div class="label">Overdue</div><div class="value">${money(over.reduce((s,l)=>s+l.balance,0))}</div><div class="sub">${over.length} loans</div></div><div class="metric-icon">!</div></div>
  <div class="card metric"><div><div class="label">Promised Follow-ups</div><div class="value">${promised}</div><div class="sub">Need monitoring</div></div><div class="metric-icon">✓</div></div></div>
  <div class="section" style="margin-top:17px"><div class="section-head"><div><h3>🔴 Overdue Follow-up Queue</h3><p class="muted">Prioritize accounts and record every contact</p></div></div>
  ${over.length?`<div class="table-scroll"><table class="table"><thead><tr><th>CUSTOMER</th><th>LOAN</th><th>OVERDUE</th><th>OUTSTANDING</th><th>FOLLOW-UP</th><th>ACTION</th></tr></thead><tbody>${over.map(l=>{const c=getCustomer(l.customerId);const fu=(data.followUps||[]).filter(x=>x.customerId===c?.id).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0];const days=Math.max(1,Math.floor((Date.parse(today)-Date.parse(l.due))/86400000));return `<tr><td><b>${esc(c?.name||'Customer')}</b><small>${esc(c?.mobile||'')}</small></td><td>${l.id}</td><td>${days} days</td><td><b>${money(l.balance)}</b></td><td><span class="status ${String(fu?.status||'Pending').toLowerCase()}">${fu?.status||'Pending'}</span>${fu?.date?`<small>${fu.date}</small>`:''}</td><td><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button> <button class="mini-btn" onclick="openFollowUp('${c?.id}','${l.id}')">Follow-up</button></td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty">No overdue loans 🎉</div>`}</div>
  <div class="section" style="margin-top:17px"><div class="section-head"><div><h3>📅 Today's Due</h3><p class="muted">Expected collection</p></div></div>${loanRows(todayLoans)}</div>
  <div class="section" style="margin-top:17px"><div class="section-head"><div><h3>Upcoming Loans</h3><p class="muted">Next scheduled installments</p></div></div>${loanRows(upcoming.slice(0,30))}</div>`;
}
dues=professionalDues;

function openPaymentPro(loanId){
  if(!guard(['Admin','Manager','Collector']))return;
  let l=data.loans.find(x=>x.id===loanId); if(!l){const active=data.loans.filter(x=>x.balance>0);if(active.length===1)l=active[0];}
  if(!l)return toast('Select a loan to collect payment');
  const c=getCustomer(l.customerId);if(!c)return;
  const suggested=Math.min(Number(l.balance||0),Number(l.installment||5000));
  openModal('Collect Payment',`<form onsubmit="collectPaymentPro(event,'${l.id}')">
    <div class="payment-summary"><div><span>Customer</span><b>${esc(c.name)}</b></div><div><span>Loan</span><b>${l.id}</b></div><div><span>Outstanding</span><b>${money(l.balance)}</b></div></div>
    <div class="form-grid"><div class="field"><label>Amount *</label><input name="amount" type="number" min="1" max="${l.balance}" step="0.01" value="${suggested}" required></div><div class="field"><label>Payment Mode</label><select name="mode"><option>Cash</option><option>UPI</option><option>Bank</option></select></div><div class="field"><label>Payment Date</label><input name="date" type="date" value="${today}" required></div><div class="field"><label>Reference / UTR</label><input name="ref" placeholder="Optional reference"></div><div class="field" style="grid-column:1/-1"><label>Notes</label><textarea name="notes" rows="3" placeholder="Optional collection note"></textarea></div></div>
    <div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Payment & Receipt</button></div></form>`);
}
function collectPaymentPro(e,loanId){
  e.preventDefault();if(!guard(['Admin','Manager','Collector']))return;
  const f=new FormData(e.target),l=data.loans.find(x=>x.id===loanId),c=getCustomer(l?.customerId),amount=Number(f.get('amount')||0);
  if(!l||!c||amount<=0||amount>Number(l.balance||0))return toast('Enter a valid payment amount');
  const id=(data.settings?.receiptPrefix||'RC')+'-'+String(data.payments.length+1).padStart(5,'0');
  const before=Number(l.balance||0),date=f.get('date')||today;
  const p={id,loanId,customerId:c.id,amount,date,mode:f.get('mode')||'Cash',ref:f.get('ref')||'',notes:f.get('notes')||'',time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),createdAt:profNow(),previousBalance:before,balanceAfter:Math.max(0,before-amount)};
  data.payments.push(p);l.balance=Math.max(0,before-amount);c.balance=Math.max(0,Number(c.balance||0)-amount);l.status=l.balance<=0?'Closed':(l.due&&l.due<date?'Overdue':'Active');l.due=nextDueDate(l)||l.due;
  if(l.balance<=0){l.status='Closed';l.due='';}
  save();audit('Payment collected','Payment',id,`${c.name} · ${money(amount)} · ${p.mode} · ${l.id}`);closeModal();toast('Payment saved · '+id);receipt(id);render('collections');
}
openPayment=openPaymentPro; collectPayment=collectPaymentPro;

function receiptPro(id){
  const p=data.payments.find(x=>x.id===id);if(!p)return;const c=getCustomer(p.customerId),l=data.loans.find(x=>x.id===p.loanId);if(!c||!l)return;
  const previous=Number(p.previousBalance??(Number(l.balance||0)+Number(p.amount||0)));const after=Number(p.balanceAfter??l.balance);
  const msg=encodeURIComponent(`FINOVA FINANCE Payment Receipt\nReceipt: ${p.id}\nCustomer: ${c.name}\nLoan: ${l.id}\nPaid: ${money(p.amount)}\nBalance: ${money(after)}\nDate: ${p.date}\nMode: ${p.mode}${p.ref?'\nReference: '+p.ref:''}`);
  openModal('Payment Receipt',`<div id="printReceipt" class="receipt"><div class="receipt-brand"><div class="logo">₹</div><div><h2>${esc(data.settings?.businessName||'FINOVA FINANCE')}</h2><span>Official Payment Receipt</span></div></div><div class="receipt-grid"><div><span>Receipt No</span><b>${esc(p.id)}</b></div><div><span>Date / Time</span><b>${esc(p.date||'-')} ${esc(p.time||'')}</b></div><div><span>Customer</span><b>${esc(c.name)}</b></div><div><span>Loan No</span><b>${esc(l.id)}</b></div></div><div class="receipt-amount"><span>Payment Received</span><strong>${money(p.amount)}</strong></div><div class="receipt-grid"><div><span>Previous Outstanding</span><b>${money(previous)}</b></div><div><span>Balance Outstanding</span><b>${money(after)}</b></div><div><span>Payment Mode</span><b>${esc(p.mode||'-')}</b></div><div><span>Reference</span><b>${esc(p.ref||'-')}</b></div></div>${p.notes?`<div class="receipt-note"><b>Notes:</b> ${esc(p.notes)}</div>`:''}<div class="receipt-note">Thank you for your payment. Please keep this receipt for your records.</div></div><div class="form-actions"><button class="btn light" onclick="printReceipt('${id}')">Print / PDF</button><button class="btn green" onclick="window.open('https://wa.me/${String(c.mobile||'').replace(/\D/g,'')}?text=${msg}','_blank')">WhatsApp</button></div>`);
}
receipt=receiptPro;

function dailyClosing(){
  if(!guard(['Admin','Manager']))return;
  const existing=(data.cashClosings||[]).find(x=>x.date===today);
  const pays=data.payments.filter(p=>p.date===today);const exps=(data.expenses||[]).filter(e=>e.date===today);
  const cashIn=pays.filter(p=>(p.mode||'Cash').toLowerCase()==='cash').reduce((s,p)=>s+Number(p.amount||0),0);
  const cashOut=exps.filter(e=>(e.mode||'Cash').toLowerCase()==='cash').reduce((s,e)=>s+Number(e.amount||0),0);
  const opening=Number(data.settings?.openingCash||0),expected=opening+cashIn-cashOut;
  openModal('End of Day Closing',`<div class="closing-grid"><div><span>Opening Cash</span><b>${money(opening)}</b></div><div><span>Cash Collection</span><b>${money(cashIn)}</b></div><div><span>Cash Expenses</span><b>${money(cashOut)}</b></div><div><span>Expected Closing</span><b>${money(expected)}</b></div></div><form onsubmit="saveDailyClosing(event)"><div class="form-grid"><div class="field"><label>Actual Cash Counted *</label><input name="actual" type="number" min="0" step="0.01" value="${existing?.actual??expected}" required></div><div class="field"><label>Closing Notes</label><input name="notes" value="${esc(existing?.notes||'')}"></div></div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">${existing?'Update':'Close'} Day</button></div></form>`);
}
function saveDailyClosing(e){
  e.preventDefault();const actual=Number(new FormData(e.target).get('actual'));if(!Number.isFinite(actual)||actual<0)return toast('Enter valid cash count');
  const pays=data.payments.filter(p=>p.date===today),exps=(data.expenses||[]).filter(e=>e.date===today);const cashIn=pays.filter(p=>(p.mode||'Cash').toLowerCase()==='cash').reduce((s,p)=>s+Number(p.amount||0),0),cashOut=exps.filter(x=>(x.mode||'Cash').toLowerCase()==='cash').reduce((s,x)=>s+Number(x.amount||0),0),opening=Number(data.settings?.openingCash||0),expected=opening+cashIn-cashOut;
  const rec={date:today,opening,cashCollection:cashIn,cashExpense:cashOut,expected,actual,difference:actual-expected,notes:new FormData(e.target).get('notes')||'',closedAt:profNow(),closedBy:data.settings?.ownerName||'Admin'};
  data.cashClosings=data.cashClosings||[];const i=data.cashClosings.findIndex(x=>x.date===today);if(i>=0)data.cashClosings[i]=rec;else data.cashClosings.push(rec);save();audit('Day closed','Cashbook',today,`Expected ${money(expected)} · Actual ${money(actual)} · Difference ${money(actual-expected)}`);closeModal();toast('Day closing saved');cashbook();
}

function auditLogView(){
  if(!guard(['Admin','Manager','Viewer']))return;
  const rows=(data.auditLog||[]).slice(0,200);openModal('Audit Log',`<div class="section-head"><div><h3>System Activity</h3><p class="muted">Every important change is recorded locally</p></div><button class="btn light" onclick="exportProfessionalCSV('audit')">Export CSV</button></div><div class="table-scroll"><table class="table"><thead><tr><th>TIME</th><th>USER</th><th>ROLE</th><th>ACTION</th><th>ENTITY</th><th>DETAILS</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${esc(a.timestamp||'')}</td><td>${esc(a.user)}</td><td>${esc(a.role)}</td><td><b>${esc(a.action)}</b></td><td>${esc(a.entity)} ${esc(a.entityId)}</td><td>${esc(a.details)}</td></tr>`).join('')||`<tr><td colspan="6"><div class="empty">No audit activity yet</div></td></tr>`}</tbody></table></div>`);
}

function appSettingsPro(){
  const s=data.settings||{};
  page.innerHTML=title('Settings','Business profile, finance defaults, security and professional controls',`<button class="btn" onclick="exportBackup()">Backup Data</button><button class="btn green" onclick="importBackup()">Restore Data</button>`)+
  `<div class="settings-grid">
  <div class="section"><div class="section-head"><div><h3>Business Profile</h3><p class="muted">Shown on receipts and reports</p></div></div><div class="form-grid settings-form"><label>Business Name<input id="setBusinessName" value="${esc(s.businessName||'FINOVA Finance')}"></label><label>Owner / Admin Name<input id="setOwnerName" value="${esc(s.ownerName||'Admin')}"></label><label>Mobile Number<input id="setMobile" value="${esc(s.mobile||'')}"></label><label>Address<input id="setAddress" value="${esc(s.address||'')}"></label><label>Receipt Prefix<input id="setReceiptPrefix" value="${esc(s.receiptPrefix||'RC')}"></label><label>Currency<select id="setCurrency"><option ${s.currency==='INR'||!s.currency?'selected':''}>INR</option><option ${s.currency==='USD'?'selected':''}>USD</option></select></label></div></div>
  <div class="section"><div class="section-head"><div><h3>Loan Defaults</h3><p class="muted">Used for new loans</p></div></div><div class="form-grid settings-form"><label>Default Interest %<input id="setInterest" type="number" step="0.01" value="${Number(s.defaultInterest||10)}"></label><label>Interest Type<select id="setInterestType"><option ${s.interestType==='Flat'||!s.interestType?'selected':''}>Flat</option><option ${s.interestType==='Reducing'?'selected':''}>Reducing</option></select></label><label>Default Frequency<select id="setFrequency"><option ${s.frequency==='Monthly'||!s.frequency?'selected':''}>Monthly</option><option ${s.frequency==='Weekly'?'selected':''}>Weekly</option><option ${s.frequency==='Daily'?'selected':''}>Daily</option></select></label><label>Opening Cash<input id="setOpeningCash" type="number" value="${Number(s.openingCash||50000)}"></label><label>Grace Period (days)<input id="setGrace" type="number" value="${Number(s.graceDays||0)}"></label></div></div>
  <div class="section"><div class="section-head"><div><h3>Roles & Permissions</h3><p class="muted">Local role controls for this device</p></div></div><div class="form-grid settings-form"><label>Current Role<select id="setRole"><option ${s.role==='Admin'?'selected':''}>Admin</option><option ${s.role==='Manager'?'selected':''}>Manager</option><option ${s.role==='Collector'?'selected':''}>Collector</option><option ${s.role==='Viewer'?'selected':''}>Viewer</option></select></label><label>Session User<input id="setUserName" value="${esc(s.ownerName||'Admin')}"></label></div><div class="settings-note">Admin: full access · Manager: finance and reports · Collector: collection and follow-up · Viewer: read-only reports.</div></div>
  <div class="section"><div class="section-head"><div><h3>Receipt & Collection</h3><p class="muted">Payment behavior</p></div></div><div class="settings-options"><label class="toggle-row"><span><b>Allow Partial Payments</b><small>Accept less than installment</small></span><input id="setPartial" type="checkbox" ${s.partialPayments!==false?'checked':''}></label><label class="toggle-row"><span><b>Show Balance on Receipt</b><small>Print remaining balance</small></span><input id="setReceiptBalance" type="checkbox" ${s.receiptBalance!==false?'checked':''}></label><label class="toggle-row"><span><b>Due Reminder</b><small>Highlight due and overdue accounts</small></span><input id="setReminder" type="checkbox" ${s.dueReminder!==false?'checked':''}></label></div></div>
  <div class="section"><div class="section-head"><div><h3>Professional Controls</h3><p class="muted">Operations and audit</p></div></div><div class="data-actions"><button class="btn" onclick="dailyClosing()">End of Day Closing</button><button class="btn" onclick="auditLogView()">Audit Log</button><button class="btn" onclick="exportProfessionalCSV('customers')">Customers CSV</button><button class="btn" onclick="exportProfessionalCSV('loans')">Loans CSV</button><button class="btn" onclick="exportProfessionalCSV('payments')">Payments CSV</button></div><div class="settings-note">Use End of Day Closing to reconcile cash. Audit Log records key actions on this device.</div></div>
  <div class="section"><div class="section-head"><div><h3>Data Management</h3><p class="muted">Protect your local finance records</p></div></div><div class="data-actions"><button class="btn" onclick="exportBackup()">Export Backup</button><button class="btn" onclick="importBackup()">Import Backup</button><button class="btn danger-btn" onclick="resetDemoConfirm()">Reset Demo Data</button></div></div></div>
  <div class="settings-save"><button class="btn green" onclick="saveSettingsPro()">Save Settings</button></div>`;
}
function saveSettingsPro(){
  data.settings=data.settings||{};const oldRole=data.settings.role;
  Object.assign(data.settings,{businessName:document.getElementById('setBusinessName').value.trim()||'FINOVA Finance',ownerName:document.getElementById('setOwnerName').value.trim()||'Admin',mobile:document.getElementById('setMobile').value.trim(),address:document.getElementById('setAddress').value.trim(),receiptPrefix:document.getElementById('setReceiptPrefix').value.trim()||'RC',currency:document.getElementById('setCurrency').value,defaultInterest:Number(document.getElementById('setInterest').value||0),interestType:document.getElementById('setInterestType').value,frequency:document.getElementById('setFrequency').value,openingCash:Number(document.getElementById('setOpeningCash').value||0),graceDays:Number(document.getElementById('setGrace').value||0),role:document.getElementById('setRole').value,partialPayments:document.getElementById('setPartial').checked,receiptBalance:document.getElementById('setReceiptBalance').checked,dueReminder:document.getElementById('setReminder').checked});
  save();audit('Settings updated','System','settings',`Role ${oldRole||'Admin'} → ${data.settings.role}`);toast('✓ Settings saved successfully');setTimeout(()=>appSettingsPro(),250);
}
appSettings=appSettingsPro;

function dashboardPro(){
  refreshLoanStatuses();
  const active=data.loans.filter(l=>l.balance>0).length,dis=data.loans.reduce((s,l)=>s+Number(l.amount||0),0),out=data.loans.reduce((s,l)=>s+Number(l.balance||0),0),col=data.payments.filter(p=>p.date===today).reduce((s,p)=>s+Number(p.amount||0),0),over=overdueLoans(),due=data.loans.filter(l=>l.balance>0&&l.due===today),target=dueAmountToday(),rate=target?Math.round(col/target*100):0;
  const month=new Date(today);month.setDate(1);const monthStart=month.toISOString().slice(0,10);const monthCol=data.payments.filter(p=>p.date>=monthStart&&p.date<=today).reduce((s,p)=>s+Number(p.amount||0),0);const monthExp=(data.expenses||[]).filter(e=>e.date>=monthStart&&e.date<=today).reduce((s,e)=>s+Number(e.amount||0),0);
  page.innerHTML=title('Dashboard','Complete finance overview for today',`<button class="btn green" onclick="openCustomer()">+ New Customer</button><button class="btn" onclick="openLoan()">+ New Loan</button><button class="btn light" onclick="openPayment()">Collect Payment</button>`)+
  `<div class="cards"><div class="card metric"><div><div class="label">Today's Collection</div><div class="value">${money(col)}</div><div class="sub">↑ Payments received</div></div><div class="metric-icon">↙</div></div><div class="card metric"><div><div class="label">Today's Due</div><div class="value">${money(target)}</div><div class="sub">${rate}% collection efficiency</div></div><div class="metric-icon">◷</div></div><div class="card metric"><div><div class="label">Overdue Amount</div><div class="value">${money(over.reduce((s,l)=>s+l.balance,0))}</div><div class="sub" style="color:#d34d59">${over.length} loans need follow-up</div></div><div class="metric-icon">!</div></div><div class="card metric"><div><div class="label">New Loans</div><div class="value">${data.loans.filter(l=>(l.createdAt||l.start||'')>=monthStart).length}</div><div class="sub">This month</div></div><div class="metric-icon">▣</div></div></div>
  <div class="cards" style="margin-top:14px"><div class="card"><div class="label">Active Customers</div><div class="value">${data.customers.filter(c=>c.balance>0).length}</div></div><div class="card"><div class="label">Total Disbursed</div><div class="value">${money(dis)}</div></div><div class="card"><div class="label">Outstanding</div><div class="value">${money(out)}</div></div><div class="card"><div class="label">Month Net Movement</div><div class="value">${money(monthCol-monthExp)}</div></div></div>
  <div class="layout2"><div class="section"><div class="section-head"><h3>Collection Performance</h3><span class="muted">Today vs target</span></div><div class="progress-track" style="height:14px;margin:20px 0"><div class="progress-fill" style="width:${Math.min(100,rate)}%"></div></div><div class="kpis"><div class="kpi"><span>Collected</span><b>${money(col)}</b></div><div class="kpi"><span>Target</span><b>${money(target)}</b></div><div class="kpi"><span>Efficiency</span><b>${rate}%</b></div></div></div><div class="section"><div class="section-head"><h3>Money Position</h3><span class="muted">Today</span></div>${(()=>{const pays=data.payments.filter(p=>p.date===today);const ex=(data.expenses||[]).filter(e=>e.date===today);const modes=['Cash','UPI','Bank'];return `<div class="kpis">${modes.map(m=>{const v=pays.filter(p=>(p.mode||'').toLowerCase()===m.toLowerCase()).reduce((s,p)=>s+Number(p.amount||0),0);return `<div class="kpi"><span>${m}</span><b>${money(v)}</b></div>`}).join('')}</div>`})()}</div></div>
  <div class="section" style="margin-top:17px"><div class="section-head"><h3>🔴 Overdue Customers</h3><button class="btn light" onclick="render('dues')">View All</button></div>${over.slice(0,8).map(l=>{const c=getCustomer(l.customerId);return `<div class="alert-box"><div><b>${esc(c?.name||'Customer')}</b><small>${l.id} · ${Math.max(1,Math.floor((Date.parse(today)-Date.parse(l.due))/86400000))} days overdue</small></div><div style="text-align:right"><div class="amount-red">${money(l.balance)}</div><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button> <button class="mini-btn" onclick="openFollowUp('${c?.id}','${l.id}')">Follow-up</button></div></div>`}).join('')||`<div class="empty">No overdue loans 🎉</div>`}</div>
  <div class="section" style="margin-top:17px"><div class="section-head"><h3>📅 Today's Due</h3><button class="btn light" onclick="render('dues')">View All</button></div>${due.map(l=>{const c=getCustomer(l.customerId);return `<div class="due-row"><div class="person"><div class="avatar">${(c?.name||'?')[0]}</div><div><b>${esc(c?.name||'Customer')}</b><small>${l.id}</small></div></div><div>${money(Math.min(l.balance,l.installment||l.balance))}</div><div>${l.due}</div><span class="status due">Due</span><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button></div>`}).join('')||`<div class="empty">No dues today</div>`}</div>
  <div class="layout2"><div class="section"><div class="section-head"><h3>Recent Transactions</h3><button class="btn light" onclick="render('collections')">View All</button></div>${data.payments.slice().sort((a,b)=>(b.createdAt||b.date||'').localeCompare(a.createdAt||a.date||'')).slice(0,6).map(p=>{const c=getCustomer(p.customerId);return `<div class="txn"><div class="txn-left"><div class="txn-icon">↙</div><div><b>${esc(c?.name||'Customer')} payment</b><small>${p.date} · ${p.mode}${p.ref?' · '+esc(p.ref):''}</small></div></div><span class="positive">+ ${money(p.amount)}</span></div>`}).join('')||`<div class="empty">No transactions</div>`}</div><div class="section"><div class="section-head"><h3>Quick Reports</h3></div><div class="data-actions"><button class="btn light" onclick="render('reports')">Reports</button><button class="btn light" onclick="dailyClosing()">End of Day</button><button class="btn light" onclick="auditLogView()">Audit Log</button></div><div class="detail-list"><span>Monthly Collections <b>${money(monthCol)}</b></span><span>Monthly Expenses <b>${money(monthExp)}</b></span><span>Outstanding <b>${money(out)}</b></span></div></div></div>`;
}
dashboard=dashboardPro;

/* Attach non-visual top-bar menus without changing the existing header layout. */
document.addEventListener('DOMContentLoaded',()=>{
  const actions=document.querySelector('.top-actions'); if(!actions)return;
  const bell=actions.querySelector('.icon-btn'); const profile=actions.querySelector('.profile');
  if(bell){bell.id='notificationBtn';bell.style.position='relative';const wrap=document.createElement('div');wrap.className='top-menu-wrap';bell.parentNode.insertBefore(wrap,bell);wrap.appendChild(bell);wrap.insertAdjacentHTML('beforeend','<div id="notificationMenu" class="top-menu hidden"><div class="top-menu-head"><b>Notifications</b><button onclick="clearNotifications()">Clear</button></div><div id="notificationList"></div></div>');}
  if(profile){profile.id='profileBtn';profile.style.position='relative';const wrap=document.createElement('div');wrap.className='top-menu-wrap';profile.parentNode.insertBefore(wrap,profile);wrap.appendChild(profile);wrap.insertAdjacentHTML('beforeend','<div id="profileMenu" class="top-menu profile-menu hidden"><button onclick="showProfileInfo()">👤 Admin Profile</button><button onclick="appSettings()">⚙ Settings</button><button onclick="auditLogView()">▣ Audit Log</button><button onclick="appLogout()">↪ Logout</button></div>');}
  renderNotifications();
});

/* Make new loan creation auditable and preserve existing workflow. */
const _addLoanOriginal=addLoan;
addLoan=function(e){
  if(!guard(['Admin','Manager']))return;
  e.preventDefault();const f=new FormData(e.target),customerId=f.get('customerId'),amount=+(f.get('amount')||0),rate=+(f.get('rate')||0),tenure=+(f.get('tenure')||1),interest=amount*rate/100,total=amount+interest,installment=total/tenure;
  if(!customerId||!amount)return toast('Select a customer and enter loan amount');
  const id='LN-'+String(data.loans.length+123).padStart(5,'0');
  data.loans.push({id,customerId,amount,balance:total,interest,rate,interestType:f.get('interestType'),type:f.get('type'),tenure,start:f.get('start'),due:f.get('due'),frequency:f.get('frequency'),installment,status:'Active',payments:[],createdAt:profNow()});
  const c=getCustomer(customerId);c.borrowed=(c.borrowed||0)+amount;c.balance=(c.balance||0)+total;save();audit('Loan created','Loan',id,`${c.name} · ${money(amount)} · ${tenure} ${f.get('frequency')}`);closeModal();toast('Loan created');render('loans');
};

/* Track expense creation through the existing expense form. */
const _addExpenseOriginal=addExpense;
addExpense=function(e){if(!guard(['Admin','Manager']))return;e.preventDefault();let f=new FormData(e.target);const rec={id:'EX-'+String((data.expenses||[]).length+1).padStart(4,'0'),category:f.get('category'),amount:+f.get('amount'),date:f.get('date')||today,mode:f.get('mode'),description:f.get('description'),createdAt:profNow()};data.expenses=data.expenses||[];data.expenses.push(rec);save();audit('Expense added','Expense',rec.id,`${rec.category} · ${money(rec.amount)} · ${rec.mode}`);closeModal();toast('Expense added');render('expenses');};

/* Existing exports remain available; this adds an auditable professional backup. */
const _exportBackupOriginal=exportBackup;
exportBackup=function(){try{data.meta={...(data.meta||{}),exportedAt:profNow(),version:'FINOVA Professional'};audit('Backup exported','System','backup','Local JSON backup');const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='finova-professional-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}catch(e){toast('Backup failed');}};

/* FINOVA Professional+ Pack — additive functionality; existing navigation/design preserved. */
(function(){
  data.followUps=data.followUps||[]; data.auditLog=data.auditLog||[]; data.cashClosings=data.cashClosings||[];
  data.pdc=data.pdc||[]; data.guarantors=data.guarantors||[]; data.documents=data.documents||[]; data.recycleBin=data.recycleBin||[];
  data.branches=data.branches||[{id:'BR-001',name:'Main Branch',active:true}];
  data.targets=data.targets||{}; data.monthLocks=data.monthLocks||{};
  data.customers.forEach(c=>{c.riskScore=Number(c.riskScore||0);c.guarantorId=c.guarantorId||'';c.documents=Array.isArray(c.documents)?c.documents:[]});
  data.loans.forEach(l=>{l.pdcIds=Array.isArray(l.pdcIds)?l.pdcIds:[];l.guarantorId=l.guarantorId||'';l.branchId=l.branchId||data.branches[0].id});
  save();
})();

function riskScore(c){
  const ls=data.loans.filter(l=>l.customerId===c.id&&l.balance>0), overdue=ls.filter(l=>l.due&&l.due<today).length;
  const ps=data.payments.filter(p=>p.customerId===c.id); const late=Math.min(5,overdue); const score=Math.min(100,late*15+Math.min(30,ls.reduce((s,l)=>s+l.balance,0)/(Math.max(1,c.borrowed||1))*30)+Math.max(0,10-ps.length));
  return Math.round(score);
}
function riskLabel(score){return score>=60?'High':score>=30?'Medium':'Low'}
function professionalCenter(){
  const overdue=overdueLoans(), todayDue=data.loans.filter(l=>l.balance>0&&l.due===today).length;
  openModal('Professional Controls',`<div class="pro-center">
    <div class="cards"><div class="card"><div class="label">High Risk</div><div class="value">${data.customers.filter(c=>riskScore(c)>=60).length}</div></div><div class="card"><div class="label">PDC Pending</div><div class="value">${data.pdc.filter(x=>x.status==='Pending').length}</div></div><div class="card"><div class="label">Documents</div><div class="value">${data.documents.length}</div></div><div class="card"><div class="label">Recycle Bin</div><div class="value">${data.recycleBin.length}</div></div></div>
    <div class="data-actions"><button class="btn" onclick="targetManager()">Collection Targets</button><button class="btn" onclick="pdcManager()">PDC / Cheques</button><button class="btn" onclick="guarantorManager()">Guarantors</button><button class="btn" onclick="documentManager()">Documents</button><button class="btn" onclick="riskManager()">Risk Scores</button><button class="btn" onclick="lockManager()">Month Lock</button><button class="btn" onclick="recycleManager()">Recycle Bin</button><button class="btn" onclick="systemHealth()">System Health</button></div>
    <div class="settings-note">${todayDue} due today · ${overdue.length} overdue. These tools add controls without changing the existing page layout.</div>
  </div>`);
}
function targetManager(){
  const key=today.slice(0,7), t=data.targets[key]||{daily:0,weekly:0,monthly:0};
  openModal('Collection Targets',`<form onsubmit="saveTargets(event)"><div class="form-grid"><label>Daily Target<input name="daily" type="number" value="${t.daily||0}"></label><label>Weekly Target<input name="weekly" type="number" value="${t.weekly||0}"></label><label>Monthly Target<input name="monthly" type="number" value="${t.monthly||0}"></label></div><div class="form-actions"><button type="button" class="btn light" onclick="professionalCenter()">Cancel</button><button class="btn green">Save</button></div></form>`);
}
function saveTargets(e){e.preventDefault();const f=new FormData(e.target),key=today.slice(0,7);data.targets[key]={daily:+f.get('daily')||0,weekly:+f.get('weekly')||0,monthly:+f.get('monthly')||0};save();audit('Collection targets updated','System',key,'Targets saved');toast('Targets saved');professionalCenter()}
function pdcManager(){
  const rows=data.pdc.map(x=>{const c=getCustomer(x.customerId);return `<tr><td>${esc(x.chequeNo)}</td><td>${esc(c?.name||'-')}</td><td>${money(x.amount)}</td><td>${x.dueDate}</td><td>${esc(x.bank||'-')}</td><td><span class="status ${String(x.status).toLowerCase()}">${x.status}</span></td><td><button class="mini-btn" onclick="updatePdc('${x.id}')">Update</button></td></tr>`}).join('');
  openModal('PDC / Cheque Management',`<div class="section-head"><h3>Cheques</h3><button class="btn green" onclick="addPdc()">+ Add PDC</button></div><div class="table-scroll"><table class="table"><thead><tr><th>CHEQUE</th><th>CUSTOMER</th><th>AMOUNT</th><th>DATE</th><th>BANK</th><th>STATUS</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="empty">No PDC records</div></td></tr>'}</tbody></table></div>`);
}
function addPdc(){
  openModal('Add PDC / Cheque',`<form onsubmit="savePdc(event)"><div class="form-grid"><label>Customer<select name="customerId" required>${data.customers.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.mobile||'')}</option>`).join('')}</select></label><label>Loan<select name="loanId">${data.loans.map(l=>`<option value="${l.id}">${l.id}</option>`).join('')}</select></label><label>Cheque Number<input name="chequeNo" required></label><label>Bank<input name="bank"></label><label>Amount<input name="amount" type="number" required></label><label>Due Date<input name="dueDate" type="date" value="${today}" required></label></div><div class="form-actions"><button type="button" class="btn light" onclick="pdcManager()">Cancel</button><button class="btn green">Save PDC</button></div></form>`)
}
function savePdc(e){e.preventDefault();const f=new FormData(e.target),x={id:'PDC-'+Date.now(),customerId:f.get('customerId'),loanId:f.get('loanId'),chequeNo:f.get('chequeNo'),bank:f.get('bank'),amount:+f.get('amount')||0,dueDate:f.get('dueDate'),status:'Pending',createdAt:profNow()};data.pdc.unshift(x);save();audit('PDC added','PDC',x.id,`${x.chequeNo} · ${money(x.amount)}`);toast('PDC saved');pdcManager()}
function updatePdc(id){const x=data.pdc.find(p=>p.id===id);if(!x)return;const status=prompt('Status: Pending / Deposited / Cleared / Returned',x.status);if(status&&['Pending','Deposited','Cleared','Returned'].includes(status)){x.status=status;save();audit('PDC status updated','PDC',id,status);pdcManager()}}
function guarantorManager(){
  openModal('Guarantors',`<div class="section-head"><h3>Guarantor Registry</h3><button class="btn green" onclick="addGuarantor()">+ Add Guarantor</button></div><div class="table-scroll"><table class="table"><thead><tr><th>NAME</th><th>MOBILE</th><th>RELATION</th><th>LINKED LOANS</th></tr></thead><tbody>${data.guarantors.map(g=>`<tr><td><b>${esc(g.name)}</b></td><td>${esc(g.mobile||'-')}</td><td>${esc(g.relation||'-')}</td><td>${data.loans.filter(l=>l.guarantorId===g.id).length}</td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">No guarantors</div></td></tr>'}</tbody></table></div>`)
}
function addGuarantor(){openModal('Add Guarantor',`<form onsubmit="saveGuarantor(event)"><div class="form-grid"><label>Name<input name="name" required></label><label>Mobile<input name="mobile"></label><label>Relationship<input name="relation"></label><label>Address<input name="address"></label></div><div class="form-actions"><button type="button" class="btn light" onclick="guarantorManager()">Cancel</button><button class="btn green">Save</button></div></form>`)}
function saveGuarantor(e){e.preventDefault();const f=new FormData(e.target),g={id:'G-'+Date.now(),name:f.get('name'),mobile:f.get('mobile'),relation:f.get('relation'),address:f.get('address')};data.guarantors.push(g);save();audit('Guarantor added','Guarantor',g.id,g.name);toast('Guarantor saved');guarantorManager()}
function documentManager(){
  openModal('Document Management',`<form onsubmit="saveDocument(event)"><div class="form-grid"><label>Customer<select name="customerId">${data.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label><label>Document Type<select name="type"><option>ID Proof</option><option>Address Proof</option><option>Agreement</option><option>Other</option></select></label><label>Document Reference<input name="ref" placeholder="File name / reference"></label><label>Status<select name="status"><option>Pending</option><option>Verified</option><option>Rejected</option></select></label></div><div class="form-actions"><button class="btn green">Add Document</button></div></form><div class="table-scroll" style="margin-top:15px"><table class="table"><thead><tr><th>CUSTOMER</th><th>TYPE</th><th>REFERENCE</th><th>STATUS</th></tr></thead><tbody>${data.documents.map(d=>{const c=getCustomer(d.customerId);return `<tr><td>${esc(c?.name||'-')}</td><td>${esc(d.type)}</td><td>${esc(d.ref||'-')}</td><td>${esc(d.status)}</td></tr>`}).join('')||'<tr><td colspan="4"><div class="empty">No documents</div></td></tr>'}</tbody></table></div>`)
}
function saveDocument(e){e.preventDefault();const f=new FormData(e.target),d={id:'DOC-'+Date.now(),customerId:f.get('customerId'),type:f.get('type'),ref:f.get('ref'),status:f.get('status'),createdAt:profNow()};data.documents.push(d);save();audit('Document added','Document',d.id,d.type);toast('Document saved');documentManager()}
function riskManager(){
  const rows=data.customers.map(c=>{const s=riskScore(c),label=riskLabel(s);return `<tr><td><b>${esc(c.name)}</b><small>${esc(c.mobile||'')}</small></td><td>${s}/100</td><td><span class="status ${label.toLowerCase()}">${label}</span></td><td>${data.loans.filter(l=>l.customerId===c.id&&l.balance>0).length}</td><td>${money(data.loans.filter(l=>l.customerId===c.id).reduce((a,l)=>a+l.balance,0))}</td></tr>`}).join('');openModal('Customer Risk Scores',`<div class="table-scroll"><table class="table"><thead><tr><th>CUSTOMER</th><th>SCORE</th><th>RISK</th><th>ACTIVE LOANS</th><th>OUTSTANDING</th></tr></thead><tbody>${rows}</tbody></table></div>`)}
function lockManager(){
  const months=[...new Set([...data.payments.map(x=>(x.date||'').slice(0,7)),...data.expenses.map(x=>(x.date||'').slice(0,7)),today.slice(0,7)])].filter(Boolean).sort().reverse();
  openModal('Month Lock',`<div class="settings-note">Lock a month after reconciliation. Existing screens remain unchanged; locked periods are protected by transaction checks.</div><div class="table-scroll"><table class="table"><thead><tr><th>MONTH</th><th>STATUS</th><th></th></tr></thead><tbody>${months.map(m=>`<tr><td>${m}</td><td>${data.monthLocks[m]?'Locked':'Open'}</td><td><button class="mini-btn" onclick="toggleMonthLock('${m}')">${data.monthLocks[m]?'Unlock':'Lock'}</button></td></tr>`).join('')}</tbody></table></div>`)
}
function toggleMonthLock(m){if(data.monthLocks[m]){if(!guard(['Admin']))return;delete data.monthLocks[m];audit('Month unlocked','System',m,'Period reopened')}else{if(!guard(['Admin','Manager']))return;data.monthLocks[m]=true;audit('Month locked','System',m,'Period locked')}save();lockManager()}
function recycleManager(){openModal('Recycle Bin',`<div class="section-head"><h3>Deleted Records</h3><button class="btn danger-btn" onclick="emptyRecycleBin()">Empty Bin</button></div><div class="table-scroll"><table class="table"><thead><tr><th>TYPE</th><th>ID</th><th>DELETED</th><th></th></tr></thead><tbody>${data.recycleBin.map(x=>`<tr><td>${esc(x.type)}</td><td>${esc(x.id)}</td><td>${esc(x.deletedAt||'')}</td><td><button class="mini-btn" onclick="restoreRecycle('${x.recycleId}')">Restore</button></td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">Recycle bin empty</div></td></tr>'}</tbody></table></div>`)}
function restoreRecycle(id){const x=data.recycleBin.find(r=>r.recycleId===id);if(!x)return;data[x.type+'s']=data[x.type+'s']||[];data[x.type+'s'].push(x.record);data.recycleBin=data.recycleBin.filter(r=>r.recycleId!==id);save();audit('Record restored','Recycle Bin',id,x.type);toast('Record restored');recycleManager()}
function emptyRecycleBin(){if(!guard(['Admin']))return;if(confirm('Empty recycle bin?')){data.recycleBin=[];save();audit('Recycle bin emptied','System','recycle','All deleted records removed');recycleManager()}}
function systemHealth(){const raw=JSON.stringify(data), bytes=new Blob([raw]).size, lastBackup=data.meta?.exportedAt||'Never', integrity=data.customers.every(c=>c.id&&c.name)&&data.loans.every(l=>l.id&&l.customerId&&Number.isFinite(Number(l.balance)));openModal('System Health',`<div class="detail-list"><span>Data integrity <b>${integrity?'OK':'Needs review'}</b></span><span>Customers <b>${data.customers.length}</b></span><span>Loans <b>${data.loans.length}</b></span><span>Payments <b>${data.payments.length}</b></span><span>Expenses <b>${data.expenses.length}</b></span><span>Storage <b>${(bytes/1024).toFixed(1)} KB</b></span><span>Last backup <b>${esc(lastBackup)}</b></span><span>Branch count <b>${data.branches.length}</b></span></div>`)}
function exportProfessionalPlus(){data.meta={...(data.meta||{}),exportedAt:profNow(),version:'FINOVA Professional+'};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='finova-professional-plus-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Professional+ backup exported')}

/* Additive access point in Settings only; no navigation or visual redesign. */
const _settingsPlus=appSettings;
appSettings=function(){_settingsPlus();setTimeout(()=>{const root=document.querySelector('.settings-grid');if(root&&!document.getElementById('proPlusCard')){root.insertAdjacentHTML('beforeend',`<div class="section" id="proPlusCard"><div class="section-head"><div><h3>Professional+ Controls</h3><p class="muted">Advanced operations, compliance and portfolio controls</p></div></div><div class="data-actions"><button class="btn" onclick="professionalCenter()">Open Professional Center</button><button class="btn" onclick="exportProfessionalPlus()">Export Full Backup</button></div></div>`)}},0)};
window.appSettings=appSettings;

/* Integrity guards for Professional+ */
const _collectPaymentPlus=collectPayment;
collectPayment=function(e,loanId){
  const l=data.loans.find(x=>x.id===loanId); const date=e?.target?new FormData(e.target).get('date'):today; const month=String(date||today).slice(0,7);
  if(data.monthLocks?.[month]){toast('This month is locked. Unlock it from Professional Center.');return}
  const f=e?.target?new FormData(e.target):null; const amount=Number(f?.get('amount')||0); const ref=String(f?.get('ref')||'').trim();
  if(ref && data.payments.some(p=>String(p.ref||'').trim()===ref)){toast('Duplicate reference / UTR detected');return}
  return _collectPaymentPlus(e,loanId);
};
window.collectPayment=collectPayment;

const _addExpensePlus=addExpense;
addExpense=function(e){
  const f=new FormData(e.target), month=String(f.get('date')||today).slice(0,7);
  if(data.monthLocks?.[month]){toast('This month is locked. Unlock it from Professional Center.');return}
  return _addExpensePlus(e);
};
window.addExpense=addExpense;

/* Branch registry: additive, local-first support for future multi-branch use. */
function branchManager(){openModal('Branch Management',`<div class="section-head"><h3>Branches</h3><button class="btn green" onclick="addBranch()">+ Add Branch</button></div><div class="table-scroll"><table class="table"><thead><tr><th>ID</th><th>BRANCH</th><th>STATUS</th><th></th></tr></thead><tbody>${data.branches.map(b=>`<tr><td>${esc(b.id)}</td><td><b>${esc(b.name)}</b></td><td>${b.active?'Active':'Inactive'}</td><td><button class="mini-btn" onclick="toggleBranch('${b.id}')">Toggle</button></td></tr>`).join('')}</tbody></table></div>`)}
function addBranch(){openModal('Add Branch',`<form onsubmit="saveBranch(event)"><div class="form-grid"><label>Branch Name<input name="name" required></label></div><div class="form-actions"><button type="button" class="btn light" onclick="branchManager()">Cancel</button><button class="btn green">Save Branch</button></div></form>`)}
function saveBranch(e){e.preventDefault();const name=new FormData(e.target).get('name').trim();if(!name)return;const b={id:'BR-'+String(data.branches.length+1).padStart(3,'0'),name,active:true};data.branches.push(b);save();audit('Branch added','Branch',b.id,name);toast('Branch added');branchManager()}
function toggleBranch(id){const b=data.branches.find(x=>x.id===id);if(!b)return;b.active=!b.active;save();audit('Branch status changed','Branch',id,b.active?'Active':'Inactive');branchManager()}

const _professionalCenter=professionalCenter;
professionalCenter=function(){
  _professionalCenter();
  setTimeout(()=>{const a=document.querySelector('.pro-center .data-actions');if(a&&!a.querySelector('[data-branch]'))a.insertAdjacentHTML('beforeend','<button class="btn" data-branch onclick="branchManager()">Branches</button>')},0);
};
window.professionalCenter=professionalCenter;
