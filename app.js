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
page.innerHTML=title("Dashboard","Complete finance overview for today",`<button class="btn green" onclick="openCustomer()">+ New Customer</button><button class="btn" onclick="openLoan()">+ New Loan</button><button class="btn light" onclick="openCollectionPicker()">Collect Payment</button>`)+
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
function dues(){let over=data.loans.filter(l=>l.status==="Overdue"),up=data.loans.filter(l=>l.status==="Active");page.innerHTML=title("Due Management","Today's due, upcoming due and overdue follow-up",`<button class="btn green" onclick="openCollectionPicker()">Collect Payment</button>`)+`<div class="cards"><div class="card"><div class="label">Today's Due</div><div class="value">${money(16500)}</div></div><div class="card"><div class="label">Upcoming Loans</div><div class="value">${up.length}</div></div><div class="card"><div class="label">Overdue</div><div class="value">${over.length}</div></div><div class="card"><div class="label">Overdue Amount</div><div class="value">${money(over.reduce((a,l)=>a+l.balance,0))}</div></div></div><div class="section" style="margin-top:17px"><div class="section-head"><h3>Overdue Follow-up</h3></div>${loanTable(over)}</div><div class="section" style="margin-top:17px"><div class="section-head"><h3>Upcoming / Due</h3></div>${loanTable(up)}</div>`}
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
  styledPrompt("Actual Cash Counted", `Expected cash: ${money(expected)}`, String(expected), actual=>{
    if(actual===null)return;
    const n=Number(actual); if(isNaN(n))return toast("Invalid cash amount");
    data.cashClosings=data.cashClosings||[];
    data.cashClosings.push({date:today,opening,cashCollection:totals.cash,cashExpense:cashExp,expected,actual:n,difference:n-expected});
    saveData(); cashbook(); toast("Day closing saved");
  });
}
function cashbookReport(){
  const rows=cashbookTransactions("all");
  const totalIn=rows.filter(r=>r.type==="Collection").reduce((a,r)=>a+r.amount,0);
  const totalOut=rows.filter(r=>r.type==="Expense").reduce((a,r)=>a+r.amount,0);
  openModal("Cashbook Report", `<div class="report-summary-grid"><div><span>Collections</span><b class="positive">${money(totalIn)}</b></div><div><span>Expenses</span><b class="negative">${money(totalOut)}</b></div><div><span>Net Movement</span><b>${money(totalIn-totalOut)}</b></div><div><span>Transactions</span><b>${rows.length}</b></div></div><div class="form-actions"><button class="btn light" onclick="closeModal()">Close</button><button class="btn green" onclick="printCurrentModal()">Print</button></div>`);
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
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`mithra-finance-system-report-${range.start}-to-${range.end}.csv`;a.click();URL.revokeObjectURL(a.href);
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
        <label>Business Name<input id="setBusinessName" value="${esc(s.businessName||"Mithra Finance System")}"></label>
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
    businessName:document.getElementById("setBusinessName").value.trim()||"Mithra Finance System",
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
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));a.download=`mithra-finance-system-backup-${today}.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup exported");
}
function importBackup(){
  const input=document.createElement("input");input.type="file";input.accept=".json,application/json";
  input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);const d=p.data||p;if(!d.customers||!d.loans||!d.payments)throw new Error("Invalid Mithra Finance System backup");data=d;data.settings=(data.settings&&typeof data.settings==="object")?data.settings:{};saveData();toast("Backup restored");appSettings()}catch(e){toast("Invalid backup file")}};r.readAsText(f)};input.click();
}
function resetDemoConfirm(){
  styledConfirm("Reset Demo Data", "All local demo data will be removed. This action cannot be undone.", ()=>{localStorage.removeItem(KEY);localStorage.removeItem(SETTINGS_KEY);location.reload();});
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
  openModal("Loan Statement",`<div class="statement"><div class="statement-head"><div><h2>Mithra Finance System</h2><span>Loan Statement</span></div><b>${today}</b></div><div class="statement-customer"><b>${c?.name||""}</b><span>${l.id} · ${c?.mobile||""}</span></div><div class="kpis"><div class="kpi"><span>Principal</span><b>${money(l.amount)}</b></div><div class="kpi"><span>Interest</span><b>${money(l.interest||0)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(l.balance)}</b></div></div><h3>Payment History</h3>${ps.length?`<table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Amount</th><th>Mode</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.date}</td><td>${p.id}</td><td>${money(p.amount)}</td><td>${p.mode}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">No payments</div>`}</div><div class="form-actions"><button class="btn light" onclick="printLoanStatement('${id}')">Print / PDF</button></div>`);
}
function printLoanStatement(id){
  const body=document.querySelector(".statement")?.outerHTML||"",w=window.open("","_blank");
  w.document.write(`<html><head><title>${id} Statement</title><style>body{font-family:Arial;padding:30px;max-width:850px;margin:auto;color:#10243d}.statement-head{display:flex;justify-content:space-between;border-bottom:2px solid #20ad72;padding-bottom:12px}.statement-head h2{margin:0}.statement-customer{margin:20px 0;display:flex;justify-content:space-between}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.kpi{padding:12px;background:#f4f7fa}.kpi span{display:block;font-size:10px;color:#77859a}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:9px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}</style></head><body>${body}</body></html>`);w.document.close();w.print();
}
function loanWhatsapp(id){
  const l=data.loans.find(x=>x.id===id),c=getCustomer(l.customerId);if(!c)return;
  const text=encodeURIComponent(`Hello ${c.name}, this is Mithra Finance System. Your loan ${l.id} has an outstanding amount of ${money(l.balance)}. ${l.balance>0?`Your next due date is ${l.due}.`:"Thank you for completing your loan."}`);
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
  if(!loanId){openCollectionPicker();return;}
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
  const msg=encodeURIComponent(`Mithra Finance System Payment Receipt%0AReceipt: ${p.id}%0ACustomer: ${c.name}%0ALoan: ${l.id}%0APaid: ${money(p.amount)}%0ABalance: ${money(l.balance)}%0ADate: ${p.date}%0AMode: ${p.mode}`);
  openModal("Payment Receipt",`<div id="printReceipt" class="receipt">
    <div class="receipt-brand"><div class="logo">₹</div><div><h2>Mithra Finance System</h2><span>Official Payment Receipt</span></div></div>
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
  const html=`<div class="statement"><div class="statement-head"><div><h2>Mithra Finance System</h2><span>Customer Statement</span></div><b>${today}</b></div><div class="statement-customer"><b>${c.name}</b><span>${c.id} · ${c.mobile}</span></div><div class="kpis"><div class="kpi"><span>Total Borrowed</span><b>${money(c.borrowed)}</b></div><div class="kpi"><span>Total Paid</span><b>${money(paid)}</b></div><div class="kpi"><span>Outstanding</span><b>${money(c.balance)}</b></div></div><h3>Loans</h3>${loanTable(ls)}<h3 style="margin-top:18px">Payments</h3>${ps.length?`<table class="table"><thead><tr><th>Date</th><th>Receipt</th><th>Amount</th><th>Mode</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.date}</td><td>${p.id}</td><td>${money(p.amount)}</td><td>${p.mode}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">No payments</div>`}</div><div class="form-actions"><button class="btn light" onclick="printStatement('${id}')">Print / PDF</button></div>`;
  openModal("Customer Statement",html);
}
function printStatement(id){
  const c=getCustomer(id),w=window.open("","_blank");
  const body=document.querySelector(".statement")?.outerHTML||"";
  w.document.write(`<html><head><title>${c.name} - Statement</title><style>body{font-family:Arial;padding:30px;max-width:850px;margin:auto;color:#10243d}.statement-head{display:flex;justify-content:space-between;border-bottom:2px solid #20ad72;padding-bottom:12px}.statement-head h2{margin:0}.statement-head span{color:#77859a}.statement-customer{margin:20px 0;display:flex;justify-content:space-between}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.kpi{padding:12px;background:#f4f7fa;border-radius:8px}.kpi span{display:block;font-size:10px;color:#77859a}.kpi b{font-size:16px}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:9px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}</style></head><body>${body}</body></html>`);w.document.close();w.print();
}
function whatsappCustomer(id){
  const c=getCustomer(id),l=data.loans.find(x=>x.customerId===id&&x.balance>0);
  const text=encodeURIComponent(`Hello ${c.name}, this is Mithra Finance System. Your current outstanding amount is ${money(c.balance)}${l?`. Your loan ${l.id} due amount is ${money(Math.min(l.balance,5000))} on ${l.due}.`:"."}`);
  window.open(`https://wa.me/${String(c.mobile||"").replace(/\D/g,"")}?text=${text}`,"_blank");
}
function openModal(t,b){document.getElementById("modalTitle").textContent=t;document.getElementById("modalBody").innerHTML=b;document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function styledConfirm(title,message,onYes){openModal(title,`<div class="confirm-dialog"><div class="confirm-icon">!</div><p class="confirm-message">${esc(message)}</p><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button type="button" class="btn red" id="confirmAction">Confirm</button></div></div>`);document.getElementById("confirmAction")?.addEventListener("click",()=>{closeModal();onYes?.()},{once:true})}
function styledPrompt(title,message,value,onDone){openModal(title,`<div class="prompt-dialog"><p class="prompt-message">${esc(message)}</p><div class="field"><label>Value</label><input id="styledPromptValue" value="${esc(value??"")}" autocomplete="off"></div><div class="form-actions"><button type="button" class="btn light" id="promptCancel">Cancel</button><button type="button" class="btn green" id="promptAction">Save</button></div></div>`);const input=document.getElementById("styledPromptValue");input?.focus();document.getElementById("promptCancel")?.addEventListener("click",()=>{closeModal();onDone(null)},{once:true});document.getElementById("promptAction")?.addEventListener("click",()=>{const v=input?.value??"";closeModal();onDone(v)},{once:true})}
function printCurrentModal(){const card=document.querySelector('#modal .modal-card');if(!card)return;const w=window.open('','_blank','width=900,height=700');if(!w)return;w.document.write('<html><head><title>Mithra Finance System Report</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#152036}.report-summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.report-summary-grid div{border:1px solid #e5eaf1;border-radius:12px;padding:16px}.report-summary-grid span{display:block;color:#7b889b;font-size:12px}.report-summary-grid b{display:block;font-size:20px;margin-top:6px}</style></head><body>'+card.innerHTML+'</body></html>');w.document.close();w.focus();w.print()}
function toast(t){let x=document.createElement("div");x.className="toast";x.innerHTML='<span class="toast-dot">✓</span><span>'+esc(t)+'</span>';document.body.appendChild(x);setTimeout(()=>x.remove(),2200)}
function exportData(){let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mithra-finance-system-v2-backup.json";a.click()}
function resetData(){if(confirm("Reset demo data?")){localStorage.removeItem(KEY);location.reload()}}
try{render("dashboard")}catch(err){console.error(err);document.getElementById("page").innerHTML=`<div class="card error-card"><h2>Mithra Finance System could not load</h2><p>Saved data was incompatible. Reset the demo data and reload.</p><button class="btn green" onclick="resetData()">Reset Demo Data</button><button class="btn light" onclick="location.reload()">Reload</button><pre>${String(err.message||err)}</pre></div>`}
function resetData(){localStorage.removeItem(KEY);location.reload()}

/* Mithra Finance System V7 - Customer 360 + Loan Detail enhancements */
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

// Mithra Finance System V9 sidebar polish: desktop collapse, mobile menu remains unchanged.
document.addEventListener('DOMContentLoaded',()=>{
  const sb=document.querySelector('.sidebar'), btn=document.getElementById('sidebarCollapse');
  if(btn&&sb){btn.addEventListener('click',()=>{if(window.innerWidth>760){sb.classList.toggle('is-collapsed');btn.textContent=sb.classList.contains('is-collapsed')?'›':'‹';localStorage.setItem('finovaSidebarCollapsed',sb.classList.contains('is-collapsed')?'1':'0');}});if(window.innerWidth>760&&localStorage.getItem('finovaSidebarCollapsed')==='1'){sb.classList.add('is-collapsed');btn.textContent='›';}}
});

// Mithra Finance System V10: working notification + admin dropdown menus.
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
  openModal('Admin Profile',`<div class="profile-info"><div class="avatar big">A</div><div><h2 style="margin:0">${escx(s.ownerName||'Admin')}</h2><p class="muted">Finance Manager</p><div class="detail-list"><span>Business <b>${escx(s.businessName||'Mithra Finance System')}</b></span><span>Mobile <b>${escx(s.mobile||'-')}</b></span></div></div></div>`);
}
function appLogout(){
  closeTopMenus();
  styledConfirm('Logout', 'Do you want to logout from Mithra Finance System on this device?', ()=>toast('Logged out'));
}

document.addEventListener('DOMContentLoaded',()=>{
  const nb=document.getElementById('notificationBtn'), pb=document.getElementById('profileBtn');
  renderNotifications();
  nb?.addEventListener('click',e=>{e.stopPropagation();const m=document.getElementById('notificationMenu');const open=m.classList.contains('hidden');closeTopMenus();if(open){m.classList.remove('hidden');nb.setAttribute('aria-expanded','true');}});
  pb?.addEventListener('click',e=>{e.stopPropagation();const m=document.getElementById('profileMenu');const open=m.classList.contains('hidden');closeTopMenus();if(open){m.classList.remove('hidden');pb.setAttribute('aria-expanded','true');}});
  document.addEventListener('click',e=>{if(!e.target.closest('.top-menu-wrap'))closeTopMenus()});
});

/* =========================================================
   Mithra Finance System PROFESSIONAL PACK
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
  let rows=[],name='mithra-finance-system-export.csv';
  if(kind==='customers'){rows=[['ID','Name','Mobile','Area','Occupation','Borrowed','Outstanding','Follow-up Status'],...data.customers.map(c=>[c.id,c.name,c.mobile,c.area,c.occupation,c.borrowed,c.balance,c.followUpStatus])];name='mithra-finance-system-customers.csv';}
  if(kind==='loans'){rows=[['Loan ID','Customer','Principal','Interest','Total','Paid','Outstanding','Due','Frequency','Status'],...data.loans.map(l=>[l.id,getCustomer(l.customerId)?.name||'',l.amount,l.interest,loanTotal(l),paidForLoan(l),l.balance,l.due,l.frequency,l.balance<=0?'Closed':l.status])];name='mithra-finance-system-loans.csv';}
  if(kind==='payments'){rows=[['Receipt','Date','Customer','Loan','Amount','Mode','Reference','Notes'],...data.payments.map(p=>[p.id,p.date,getCustomer(p.customerId)?.name||'',p.loanId,p.amount,p.mode,p.ref,p.notes])];name='mithra-finance-system-payments.csv';}
  if(kind==='audit'){rows=[['Timestamp','User','Role','Action','Entity','Entity ID','Details'],...data.auditLog.map(a=>[a.timestamp,a.user,a.role,a.action,a.entity,a.entityId,a.details])];name='mithra-finance-system-audit-log.csv';}
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
  page.innerHTML=title('Due Management','Today, upcoming and overdue collection workflow',`<button class="btn green" onclick="openCollectionPicker()">Collect Payment</button><button class="btn light" onclick="exportProfessionalCSV('loans')">Export Loans</button>`)+
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
openPayment=function(loanId){ if(!loanId){ openCollectionPicker(); return; } return openPaymentPro(loanId); }; collectPayment=collectPaymentPro; window.openPayment=openPayment;

function receiptPro(id){
  const p=data.payments.find(x=>x.id===id);if(!p)return;const c=getCustomer(p.customerId),l=data.loans.find(x=>x.id===p.loanId);if(!c||!l)return;
  const previous=Number(p.previousBalance??(Number(l.balance||0)+Number(p.amount||0)));const after=Number(p.balanceAfter??l.balance);
  const msg=encodeURIComponent(`Mithra Finance System Payment Receipt\nReceipt: ${p.id}\nCustomer: ${c.name}\nLoan: ${l.id}\nPaid: ${money(p.amount)}\nBalance: ${money(after)}\nDate: ${p.date}\nMode: ${p.mode}${p.ref?'\nReference: '+p.ref:''}`);
  openModal('Payment Receipt',`<div id="printReceipt" class="receipt"><div class="receipt-brand"><div class="logo">₹</div><div><h2>${esc(data.settings?.businessName||'Mithra Finance System')}</h2><span>Official Payment Receipt</span></div></div><div class="receipt-grid"><div><span>Receipt No</span><b>${esc(p.id)}</b></div><div><span>Date / Time</span><b>${esc(p.date||'-')} ${esc(p.time||'')}</b></div><div><span>Customer</span><b>${esc(c.name)}</b></div><div><span>Loan No</span><b>${esc(l.id)}</b></div></div><div class="receipt-amount"><span>Payment Received</span><strong>${money(p.amount)}</strong></div><div class="receipt-grid"><div><span>Previous Outstanding</span><b>${money(previous)}</b></div><div><span>Balance Outstanding</span><b>${money(after)}</b></div><div><span>Payment Mode</span><b>${esc(p.mode||'-')}</b></div><div><span>Reference</span><b>${esc(p.ref||'-')}</b></div></div>${p.notes?`<div class="receipt-note"><b>Notes:</b> ${esc(p.notes)}</div>`:''}<div class="receipt-note">Thank you for your payment. Please keep this receipt for your records.</div></div><div class="form-actions"><button class="btn light" onclick="printReceipt('${id}')">Print / PDF</button><button class="btn green" onclick="window.open('https://wa.me/${String(c.mobile||'').replace(/\D/g,'')}?text=${msg}','_blank')">WhatsApp</button></div>`);
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
  <div class="section"><div class="section-head"><div><h3>Business Profile</h3><p class="muted">Shown on receipts and reports</p></div></div><div class="form-grid settings-form"><label>Business Name<input id="setBusinessName" value="${esc(s.businessName||'Mithra Finance System')}"></label><label>Owner / Admin Name<input id="setOwnerName" value="${esc(s.ownerName||'Admin')}"></label><label>Mobile Number<input id="setMobile" value="${esc(s.mobile||'')}"></label><label>Address<input id="setAddress" value="${esc(s.address||'')}"></label><label>Receipt Prefix<input id="setReceiptPrefix" value="${esc(s.receiptPrefix||'RC')}"></label><label>Currency<select id="setCurrency"><option ${s.currency==='INR'||!s.currency?'selected':''}>INR</option><option ${s.currency==='USD'?'selected':''}>USD</option></select></label></div></div>
  <div class="section"><div class="section-head"><div><h3>Loan Defaults</h3><p class="muted">Used for new loans</p></div></div><div class="form-grid settings-form"><label>Default Interest %<input id="setInterest" type="number" step="0.01" value="${Number(s.defaultInterest||10)}"></label><label>Interest Type<select id="setInterestType"><option ${s.interestType==='Flat'||!s.interestType?'selected':''}>Flat</option><option ${s.interestType==='Reducing'?'selected':''}>Reducing</option></select></label><label>Default Frequency<select id="setFrequency"><option ${s.frequency==='Monthly'||!s.frequency?'selected':''}>Monthly</option><option ${s.frequency==='Weekly'?'selected':''}>Weekly</option><option ${s.frequency==='Daily'?'selected':''}>Daily</option></select></label><label>Opening Cash<input id="setOpeningCash" type="number" value="${Number(s.openingCash||50000)}"></label><label>Grace Period (days)<input id="setGrace" type="number" value="${Number(s.graceDays||0)}"></label></div></div>
  <div class="section"><div class="section-head"><div><h3>Roles & Permissions</h3><p class="muted">Local role controls for this device</p></div></div><div class="form-grid settings-form"><label>Current Role<select id="setRole"><option ${s.role==='Admin'?'selected':''}>Admin</option><option ${s.role==='Manager'?'selected':''}>Manager</option><option ${s.role==='Collector'?'selected':''}>Collector</option><option ${s.role==='Viewer'?'selected':''}>Viewer</option></select></label><label>Session User<input id="setUserName" value="${esc(s.ownerName||'Admin')}"></label></div><div class="settings-note">Admin: full access · Manager: finance and reports · Collector: collection and follow-up · Viewer: read-only reports.</div></div>
  <div class="section"><div class="section-head"><div><h3>Receipt & Collection</h3><p class="muted">Payment behavior</p></div></div><div class="settings-options"><label class="toggle-row"><span><b>Allow Partial Payments</b><small>Accept less than installment</small></span><input id="setPartial" type="checkbox" ${s.partialPayments!==false?'checked':''}></label><label class="toggle-row"><span><b>Show Balance on Receipt</b><small>Print remaining balance</small></span><input id="setReceiptBalance" type="checkbox" ${s.receiptBalance!==false?'checked':''}></label><label class="toggle-row"><span><b>Due Reminder</b><small>Highlight due and overdue accounts</small></span><input id="setReminder" type="checkbox" ${s.dueReminder!==false?'checked':''}></label></div></div>
  <div class="section"><div class="section-head"><div><h3>Professional Controls</h3><p class="muted">Operations and audit</p></div></div><div class="data-actions"><button class="btn" onclick="dailyClosing()">End of Day Closing</button><button class="btn" onclick="auditLogView()">Audit Log</button><button class="btn" onclick="exportProfessionalCSV('customers')">Customers CSV</button><button class="btn" onclick="exportProfessionalCSV('loans')">Loans CSV</button><button class="btn" onclick="exportProfessionalCSV('payments')">Payments CSV</button></div><div class="settings-note">Use End of Day Closing to reconcile cash. Audit Log records key actions on this device.</div></div>
  <div class="section"><div class="section-head"><div><h3>Data Management</h3><p class="muted">Protect your local finance records</p></div></div><div class="data-actions"><button class="btn" onclick="exportBackup()">Export Backup</button><button class="btn" onclick="importBackup()">Import Backup</button><button class="btn danger-btn" onclick="resetDemoConfirm()">Reset Demo Data</button></div></div></div>
  <div class="settings-save"><button class="btn green" onclick="saveSettingsPro()">Save Settings</button></div>`;
}
function saveSettingsPro(){
  data.settings=data.settings||{};const oldRole=data.settings.role;
  Object.assign(data.settings,{businessName:document.getElementById('setBusinessName').value.trim()||'Mithra Finance System',ownerName:document.getElementById('setOwnerName').value.trim()||'Admin',mobile:document.getElementById('setMobile').value.trim(),address:document.getElementById('setAddress').value.trim(),receiptPrefix:document.getElementById('setReceiptPrefix').value.trim()||'RC',currency:document.getElementById('setCurrency').value,defaultInterest:Number(document.getElementById('setInterest').value||0),interestType:document.getElementById('setInterestType').value,frequency:document.getElementById('setFrequency').value,openingCash:Number(document.getElementById('setOpeningCash').value||0),graceDays:Number(document.getElementById('setGrace').value||0),role:document.getElementById('setRole').value,partialPayments:document.getElementById('setPartial').checked,receiptBalance:document.getElementById('setReceiptBalance').checked,dueReminder:document.getElementById('setReminder').checked});
  save();audit('Settings updated','System','settings',`Role ${oldRole||'Admin'} → ${data.settings.role}`);toast('✓ Settings saved successfully');setTimeout(()=>appSettingsPro(),250);
}
appSettings=appSettingsPro;

function dashboardPro(){
  refreshLoanStatuses();
  const loans=data.loans||[], customers=data.customers||[], payments=data.payments||[], expenses=data.expenses||[];
  const activeLoans=loans.filter(l=>Number(l.balance||0)>0), overdue=overdueLoans(), dueToday=loans.filter(l=>Number(l.balance||0)>0&&l.due===today), upcoming=loans.filter(l=>Number(l.balance||0)>0&&l.due>today).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
  const collectionToday=payments.filter(p=>p.date===today).reduce((s,p)=>s+Number(p.amount||0),0);
  const dueAmount=dueAmountToday(), overdueAmount=overdue.reduce((s,l)=>s+Number(l.balance||0),0), outstanding=activeLoans.reduce((s,l)=>s+Number(l.balance||0),0), disbursed=loans.reduce((s,l)=>s+Number(l.amount||0),0);
  const efficiency=dueAmount?Math.min(999,Math.round(collectionToday/dueAmount*100)):0;
  const monthStart=today.slice(0,8)+'01';
  const monthCollections=payments.filter(p=>p.date>=monthStart&&p.date<=today).reduce((s,p)=>s+Number(p.amount||0),0);
  const monthExpenses=expenses.filter(e=>e.date>=monthStart&&e.date<=today).reduce((s,e)=>s+Number(e.amount||0),0);
  const newLoans=loans.filter(l=>String(l.createdAt||l.start||'').slice(0,7)===today.slice(0,7)).length;
  const activeCustomers=customers.filter(c=>Number(c.balance||0)>0).length;
  const followUps=data.followUps||[];
  const followDue=followUps.filter(f=>f.date&&f.date<=today&&f.status!=='Done');
  const promised=followUps.filter(f=>f.status==='Promised'&&f.date>=today).length;
  const riskHigh=customers.filter(c=>riskScore(c)>=60).length;
  const pdcPending=(data.pdc||[]).filter(x=>x.status==='Pending').length;
  const cashToday=payments.filter(p=>p.date===today&&(p.mode||'').toLowerCase()==='cash').reduce((s,p)=>s+Number(p.amount||0),0);
  const upiToday=payments.filter(p=>p.date===today&&(p.mode||'').toLowerCase()==='upi').reduce((s,p)=>s+Number(p.amount||0),0);
  const bankToday=payments.filter(p=>['bank','bank transfer','neft','rtgs','imps'].includes((p.mode||'').toLowerCase())).filter(p=>p.date===today).reduce((s,p)=>s+Number(p.amount||0),0);
  const targetCfg=data.targets?.[today.slice(0,7)]||{};
  const target=Number(targetCfg.daily||dueAmount||0);
  const targetRate=target?Math.round(collectionToday/target*100):0;
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthBars=[];
  const base=new Date(today+'T00:00:00');
  for(let i=5;i>=0;i--){const d=new Date(base.getFullYear(),base.getMonth()-i,1);const key=d.toISOString().slice(0,7);const val=payments.filter(p=>String(p.date||'').slice(0,7)===key).reduce((s,p)=>s+Number(p.amount||0),0);monthBars.push({label:monthNames[d.getMonth()],value:val});}
  const maxBar=Math.max(1,...monthBars.map(x=>x.value));
  const buckets=[
    ['1–7 days',overdue.filter(l=>{const d=Math.max(1,Math.floor((Date.parse(today)-Date.parse(l.due))/86400000));return d<=7;})],
    ['8–30 days',overdue.filter(l=>{const d=Math.floor((Date.parse(today)-Date.parse(l.due))/86400000);return d>=8&&d<=30;})],
    ['31–60 days',overdue.filter(l=>{const d=Math.floor((Date.parse(today)-Date.parse(l.due))/86400000);return d>=31&&d<=60;})],
    ['60+ days',overdue.filter(l=>Math.floor((Date.parse(today)-Date.parse(l.due))/86400000)>60)]
  ];
  const latestFollow=followDue.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,5);
  const latestTransactions=payments.slice().sort((a,b)=>(b.createdAt||b.date||'').localeCompare(a.createdAt||a.date||'')).slice(0,6);
  const nextDue=upcoming.slice(0,5);
  page.innerHTML=title('Dashboard','Complete finance overview for today',`<button class="btn green" onclick="openCustomer()">+ New Customer</button><button class="btn" onclick="openLoan()">+ New Loan</button><button class="btn light" onclick="openCollectionPicker()">Collect Payment</button>`)+
  `<div class="cards">
    <div class="card metric"><div><div class="label">Today's Collection</div><div class="value">${money(collectionToday)}</div><div class="sub">${payments.filter(p=>p.date===today).length} payments received</div></div><div class="metric-icon">↙</div></div>
    <div class="card metric"><div><div class="label">Today's Due</div><div class="value">${money(dueAmount)}</div><div class="sub">${dueToday.length} loans · ${efficiency}% collected</div></div><div class="metric-icon">◷</div></div>
    <div class="card metric"><div><div class="label">Overdue Amount</div><div class="value">${money(overdueAmount)}</div><div class="sub" style="color:#d34d59">${overdue.length} loans need follow-up</div></div><div class="metric-icon">!</div></div>
    <div class="card metric"><div><div class="label">New Loans</div><div class="value">${newLoans}</div><div class="sub">This month</div></div><div class="metric-icon">▣</div></div>
  </div>
  <div class="cards" style="margin-top:14px">
    <div class="card"><div class="label">Active Customers</div><div class="value">${activeCustomers}</div><div class="sub">${customers.length} total customers</div></div>
    <div class="card"><div class="label">Total Disbursed</div><div class="value">${money(disbursed)}</div><div class="sub">All loan principal</div></div>
    <div class="card"><div class="label">Outstanding</div><div class="value">${money(outstanding)}</div><div class="sub">Across active loans</div></div>
    <div class="card"><div class="label">Month Net Movement</div><div class="value">${money(monthCollections-monthExpenses)}</div><div class="sub">Collection − expenses</div></div>
  </div>
  <div class="layout2">
    <div class="section"><div class="section-head"><h3>Collection Performance</h3><span class="muted">Today vs target</span></div>
      <div class="progress-track" style="height:14px;margin:20px 0"><div class="progress-fill" style="width:${Math.min(100,targetRate)}%"></div></div>
      <div class="kpis"><div class="kpi"><span>Collected</span><b>${money(collectionToday)}</b></div><div class="kpi"><span>Target</span><b>${money(target)}</b></div><div class="kpi"><span>Achievement</span><b>${targetRate}%</b></div></div>
      <div class="detail-list" style="margin-top:12px"><span>Monthly Collections <b>${money(monthCollections)}</b></span><span>Monthly Expenses <b>${money(monthExpenses)}</b></span></div>
    </div>
    <div class="section"><div class="section-head"><h3>Money Position</h3><span class="muted">Today's collections</span></div>
      <div class="kpis"><div class="kpi"><span>Cash</span><b>${money(cashToday)}</b></div><div class="kpi"><span>UPI</span><b>${money(upiToday)}</b></div><div class="kpi"><span>Bank</span><b>${money(bankToday)}</b></div></div>
      <div class="kpi" style="margin-top:10px"><span>Digital + Cash Today</span><b>${money(cashToday+upiToday+bankToday)}</b></div>
    </div>
  </div>
  <div class="layout2">
    <div class="section"><div class="section-head"><h3>Collection Trend</h3><span class="muted">Last 6 months</span></div><div class="bars">${monthBars.map(x=>`<div class="bar" style="height:${Math.max(8,Math.round(x.value/maxBar*100))}%"><span>${x.label}</span></div>`).join('')}</div></div>
    <div class="section"><div class="section-head"><h3>Portfolio Health</h3><span class="muted">Live status</span></div>
      <div class="kpis"><div class="kpi"><span>Active Loans</span><b>${activeLoans.length}</b></div><div class="kpi"><span>Overdue Loans</span><b>${overdue.length}</b></div><div class="kpi"><span>High Risk</span><b>${riskHigh}</b></div></div>
      <div class="detail-list" style="margin-top:10px"><span>Pending PDC / Cheques <b>${pdcPending}</b></span><span>Promised Follow-ups <b>${promised}</b></span></div>
    </div>
  </div>
  <div class="layout2">
    <div class="section"><div class="section-head"><h3>🔴 Overdue Customers</h3><button class="btn light" onclick="render('dues')">View All</button></div>${over.slice(0,6).map(l=>{const c=getCustomer(l.customerId);const days=Math.max(1,Math.floor((Date.parse(today)-Date.parse(l.due))/86400000));return `<div class="alert-box"><div><b>${esc(c?.name||'Customer')}</b><small>${l.id} · ${days} days overdue</small></div><div style="text-align:right"><div class="amount-red">${money(l.balance)}</div><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button> <button class="mini-btn" onclick="openFollowUp('${c?.id}','${l.id}')">Follow-up</button></div></div>`}).join('')||`<div class="empty">No overdue loans 🎉</div>`}</div>
    <div class="section"><div class="section-head"><h3>Overdue Ageing</h3><span class="muted">Outstanding by age</span></div>${buckets.map(([label,arr])=>`<div class="kpi" style="margin-bottom:8px"><span>${label} · ${arr.length} loans</span><b>${money(arr.reduce((s,l)=>s+Number(l.balance||0),0))}</b></div>`).join('')}</div>
  </div>
  <div class="section" style="margin-top:17px"><div class="section-head"><h3>📅 Today's Due</h3><button class="btn light" onclick="render('dues')">View All</button></div>${dueToday.map(l=>{const c=getCustomer(l.customerId);const amt=Math.min(Number(l.balance||0),Number(l.installment||l.balance||0));return `<div class="due-row"><div class="person"><div class="avatar">${(c?.name||'?')[0]}</div><div><b>${esc(c?.name||'Customer')}</b><small>${l.id}</small></div></div><div>${money(amt)}</div><div>${l.due}</div><span class="status due">Due</span><button class="mini-btn" onclick="openPayment('${l.id}')">Collect</button></div>`}).join('')||`<div class="empty">No dues today</div>`}</div>
  <div class="layout2">
    <div class="section"><div class="section-head"><h3>Next Upcoming Dues</h3><button class="btn light" onclick="render('dues')">View All</button></div>${nextDue.map(l=>{const c=getCustomer(l.customerId);return `<div class="txn"><div class="txn-left"><div class="txn-icon">◷</div><div><b>${esc(c?.name||'Customer')}</b><small>${l.id} · Due ${l.due}</small></div></div><span class="positive">${money(Math.min(Number(l.balance||0),Number(l.installment||l.balance||0)))}</span></div>`}).join('')||`<div class="empty">No upcoming dues</div>`}</div>
    <div class="section"><div class="section-head"><h3>Follow-up Queue</h3><button class="btn light" onclick="render('dues')">Open</button></div>${latestFollow.map(f=>{const c=getCustomer(f.customerId);return `<div class="txn"><div class="txn-left"><div class="txn-icon">↗</div><div><b>${esc(c?.name||'Customer')}</b><small>${esc(f.status||'Pending')} · ${esc(f.date||'')}</small></div></div><span class="status ${String(f.priority||'Medium').toLowerCase()} ">${esc(f.priority||'Medium')}</span></div>`}).join('')||`<div class="empty">No follow-ups due</div>`}</div>
  </div>
  <div class="layout2">
    <div class="section"><div class="section-head"><h3>Recent Transactions</h3><button class="btn light" onclick="render('collections')">View All</button></div>${latestTransactions.map(p=>{const c=getCustomer(p.customerId);return `<div class="txn"><div class="txn-left"><div class="txn-icon">↙</div><div><b>${esc(c?.name||'Customer')} payment</b><small>${p.date} · ${esc(p.mode||'Cash')}${p.ref?' · '+esc(p.ref):''}</small></div></div><span class="positive">+ ${money(p.amount)}</span></div>`}).join('')||`<div class="empty">No transactions</div>`}</div>
    <div class="section"><div class="section-head"><h3>Quick Actions</h3><span class="muted">Common tasks</span></div><div class="quick-menu"><button onclick="openCollectionPicker()">Collect Payment</button><button onclick="openCustomer()">Add Customer</button><button onclick="openLoan()">Create Loan</button><button onclick="dailyClosing()">End of Day Closing</button><button onclick="render('reports')">Open Reports</button><button onclick="auditLogView()">View Audit Log</button></div></div>
  </div>`;
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
exportBackup=function(){try{data.meta={...(data.meta||{}),exportedAt:profNow(),version:'Mithra Finance System Professional'};audit('Backup exported','System','backup','Local JSON backup');const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mithra-finance-system-professional-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}catch(e){toast('Backup failed');}};

/* Mithra Finance System Professional+ Pack — additive functionality; existing navigation/design preserved. */
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
function updatePdc(id){const x=data.pdc.find(p=>p.id===id);if(!x)return;styledPrompt('Update PDC Status','Enter: Pending / Deposited / Cleared / Returned',x.status,status=>{if(status&&['Pending','Deposited','Cleared','Returned'].includes(status)){x.status=status;save();audit('PDC status updated','PDC',id,status);pdcManager()}else if(status!==null){toast('Invalid PDC status')}})}
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
function emptyRecycleBin(){if(!guard(['Admin']))return;styledConfirm('Empty Recycle Bin','All deleted records will be permanently removed.',()=>{data.recycleBin=[];save();audit('Recycle bin emptied','System','recycle','All deleted records removed');recycleManager()})}
function systemHealth(){const raw=JSON.stringify(data), bytes=new Blob([raw]).size, lastBackup=data.meta?.exportedAt||'Never', integrity=data.customers.every(c=>c.id&&c.name)&&data.loans.every(l=>l.id&&l.customerId&&Number.isFinite(Number(l.balance)));openModal('System Health',`<div class="detail-list"><span>Data integrity <b>${integrity?'OK':'Needs review'}</b></span><span>Customers <b>${data.customers.length}</b></span><span>Loans <b>${data.loans.length}</b></span><span>Payments <b>${data.payments.length}</b></span><span>Expenses <b>${data.expenses.length}</b></span><span>Storage <b>${(bytes/1024).toFixed(1)} KB</b></span><span>Last backup <b>${esc(lastBackup)}</b></span><span>Branch count <b>${data.branches.length}</b></span></div>`)}
function exportProfessionalPlus(){data.meta={...(data.meta||{}),exportedAt:profNow(),version:'Mithra Finance System Professional+'};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mithra-finance-system-professional-plus-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Professional+ backup exported')}

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
/* =========================================================
   Mithra Finance System PROFESSIONAL+ Control Pack 2
   Additive functionality only. Existing visual layout preserved.
   ========================================================= */
(function(){
  const ensure=()=>{
    data.followUps=data.followUps||[]; data.auditLog=data.auditLog||[]; data.cashClosings=data.cashClosings||[];
    data.pdc=data.pdc||[]; data.guarantors=data.guarantors||[]; data.documents=data.documents||[];
    data.recycleBin=data.recycleBin||[]; data.branches=data.branches||[{id:'BR-001',name:'Main Branch',active:true}];
    data.targets=data.targets||{}; data.monthLocks=data.monthLocks||{}; data.users=data.users||[{id:'USR-001',name:'Admin',role:'Admin',active:true}];
    data.approvals=data.approvals||[]; data.communications=data.communications||[]; data.loanProducts=data.loanProducts||[];
    data.importLog=data.importLog||[]; data.systemFlags=data.systemFlags||[]; data.routePlans=data.routePlans||{};
    data.settings=data.settings||{};
    if(!Number.isFinite(Number(data.settings.approvalThreshold))) data.settings.approvalThreshold=50000;
    if(!data.settings.financialYear) data.settings.financialYear=(new Date().getFullYear())+'-'+String(new Date().getFullYear()+1).slice(-2);
  };
  ensure(); save();

  const n=v=>Number(v||0), safe=v=>esc(v==null?'':v), loanBy=id=>data.loans.find(l=>l.id===id), customerBy=id=>getCustomer(id);
  const monthKey=d=>String(d||today).slice(0,7);
  const daysLate=d=>d?Math.max(0,Math.floor((Date.parse(today)-Date.parse(d))/86400000)):0;

  /* 1. Smart notification engine */
  const oldGetNotifications=window.getNotifications;
  window.getNotifications=function(){
    let base=typeof oldGetNotifications==='function'?oldGetNotifications():[];
    const extra=[];
    data.loans.filter(l=>n(l.balance)>0&&l.due===today).slice(0,10).forEach(l=>{const c=customerBy(l.customerId);extra.push({page:'dues',title:'Due today',text:(c?.name||'Customer')+' · '+money(l.installment||l.balance)})});
    data.loans.filter(l=>n(l.balance)>0&&l.due&&l.due<today).slice(0,10).forEach(l=>{const c=customerBy(l.customerId);extra.push({page:'dues',title:'Overdue follow-up',text:(c?.name||'Customer')+' · '+daysLate(l.due)+' days overdue'})});
    data.approvals.filter(a=>a.status==='Pending').slice(0,10).forEach(a=>extra.push({page:'settings',title:'Approval pending',text:a.type+' · '+money(a.amount||0)}));
    data.pdc.filter(x=>x.status==='Pending'&&x.dueDate&&x.dueDate<=today).slice(0,10).forEach(x=>extra.push({page:'settings',title:'PDC attention',text:'Cheque '+x.chequeNo+' · '+x.dueDate}));
    return extra.concat(base).slice(0,30);
  };

  /* 2. Route planning */
  window.routePlanner=function(){
    const rows={};
    data.loans.filter(l=>n(l.balance)>0&&((l.due===today)||(l.due&&l.due<today))).forEach(l=>{const c=customerBy(l.customerId);const area=(c?.area||'Unassigned').trim()||'Unassigned';(rows[area]??=[]).push(l)});
    const html=Object.keys(rows).sort().map(area=>`<div class="section" style="margin-top:12px"><div class="section-head"><h3>${safe(area)}</h3><span class="muted">${rows[area].length} stops</span></div>${rows[area].sort((a,b)=>(customerBy(a.customerId)?.name||'').localeCompare(customerBy(b.customerId)?.name||'')).map(l=>{const c=customerBy(l.customerId);return `<div class="txn"><div class="txn-left"><div class="txn-icon">→</div><div><b>${safe(c?.name||'Customer')}</b><small>${safe(c?.mobile||'')} · ${safe(l.id)}</small></div></div><span class="positive">${money(Math.min(n(l.balance),n(l.installment||l.balance)))}</span></div>`}).join('')}</div>`).join('')||'<div class="empty">No collection stops for today</div>';
    openModal('Collection Route Planner',`<div class="settings-note">Grouped by customer area. Use this as today\'s collection route.</div>${html}`);
  };

  /* 3. Promise-to-pay */
  window.promiseManager=function(){
    const items=data.followUps.filter(f=>f.status==='Promised').slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    openModal('Promise-to-Pay Tracker',`<div class="section-head"><h3>Promises</h3><span class="muted">${items.length} active promises</span></div><div class="table-scroll"><table class="table"><thead><tr><th>CUSTOMER</th><th>LOAN</th><th>PROMISE DATE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>${items.map(f=>{const c=customerBy(f.customerId),l=loanBy(f.loanId);return `<tr><td>${safe(c?.name||'-')}</td><td>${safe(f.loanId||'-')}</td><td>${safe(f.date||'-')}</td><td>${money(n(f.promiseAmount))}</td><td><span class="status ${f.date<today?'overdue':'due'}">${f.date<today?'Missed':'Promised'}</span></td><td><button class="mini-btn" onclick="openFollowUp('${f.customerId}','${f.loanId||''}')">Update</button></td></tr>`}).join('')||'<tr><td colspan="6"><div class="empty">No promises recorded</div></td></tr>'}</tbody></table></div>`);
  };
  const oldOpenFollowUp=window.openFollowUp;
  window.openFollowUp=function(customerId,loanId){
    const c=customerBy(customerId); if(!c)return;
    const existing=data.followUps.filter(x=>x.customerId===customerId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0];
    if(typeof guard==='function'&&!guard(['Admin','Manager','Collector']))return;
    openModal('Customer Follow-up',`<form onsubmit="saveFollowUpPlus(event,'${customerId}','${loanId||''}')"><div class="form-grid"><div class="field"><label>Status</label><select name="status"><option>Pending</option><option>Contacted</option><option selected>Promised</option><option>Done</option></select></div><div class="field"><label>Priority</label><select name="priority"><option>High</option><option selected>Medium</option><option>Low</option></select></div><div class="field"><label>Next Follow-up</label><input type="date" name="date" value="${existing?.date||today}"></div><div class="field"><label>Promise Amount</label><input name="promiseAmount" type="number" min="0" value="${existing?.promiseAmount||''}"></div><div class="field"><label>Loan</label><select name="loanId"><option value="">Customer</option>${data.loans.filter(l=>l.customerId===customerId).map(l=>`<option value="${l.id}" ${l.id===loanId?'selected':''}>${l.id} · ${money(l.balance)}</option>`).join('')}</select></div><div class="field"><label>Contact Type</label><select name="contactType"><option>Call</option><option>Visit</option><option>WhatsApp</option><option>SMS</option><option>Other</option></select></div><div class="field" style="grid-column:1/-1"><label>Notes</label><textarea name="notes" rows="4">${safe(existing?.notes||'')}</textarea></div></div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Save Follow-up</button></div></form>`);
  };
  window.saveFollowUpPlus=function(e,customerId,loanId){
    e.preventDefault();const f=new FormData(e.target);const item={id:'FU-'+Date.now(),customerId,loanId:f.get('loanId')||loanId||'',status:f.get('status'),priority:f.get('priority'),date:f.get('date')||today,notes:f.get('notes')||'',promiseAmount:n(f.get('promiseAmount')),contactType:f.get('contactType')||'Call',createdAt:profNow()};
    data.followUps.unshift(item);data.communications.unshift({id:'COM-'+Date.now(),customerId,loanId:item.loanId,type:item.contactType,note:item.notes,date:today,createdAt:profNow()});save();audit('Follow-up saved','Customer',customerId,item.status+' · '+item.contactType);closeModal();toast('Follow-up saved');render('dues');
  };

  /* 4. Renewal / 5. Top-up / 6. Settlement */
  window.loanActionsPro=function(id){
    const l=loanBy(id);if(!l)return;const c=customerBy(l.customerId);
    openModal('Loan Actions · '+id,`<div class="quick-menu"><button onclick="loanDetail('${id}')">View Loan</button><button onclick="loanSchedule('${id}')">Repayment Schedule</button>${l.balance>0?`<button onclick="openPayment('${id}')">Collect Payment</button>`:''}<button onclick="openLoanRenewal('${id}')">Renew Loan</button><button onclick="openLoanTopup('${id}')">Top-up Loan</button>${l.balance>0?`<button onclick="openSettlement('${id}')">Early Settlement</button>`:''}<button onclick="loanStatement('${id}')">Print Statement</button><button onclick="loanWhatsapp('${id}')">WhatsApp Reminder</button><button onclick="editLoan('${id}')">Edit Loan</button></div>`);
  };
  window.openLoanRenewal=function(id){const l=loanBy(id);if(!l)return;const c=customerBy(l.customerId);openModal('Loan Renewal',`<div class="payment-summary"><div><span>Customer</span><b>${safe(c?.name)}</b></div><div><span>Previous Loan</span><b>${safe(id)}</b></div><div><span>Outstanding</span><b>${money(l.balance)}</b></div></div><form onsubmit="saveLoanRenewal(event,'${id}')"><div class="form-grid"><div class="field"><label>New Amount *</label><input name="amount" type="number" min="1" value="${Math.max(1000,n(l.amount))}" required></div><div class="field"><label>Interest %</label><input name="rate" type="number" min="0" step="0.01" value="${n(l.rate)}"></div><div class="field"><label>Tenure</label><input name="tenure" type="number" min="1" value="${n(l.tenure)||1}"></div><div class="field"><label>Frequency</label><select name="frequency"><option>Daily</option><option>Weekly</option><option selected>Monthly</option></select></div></div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Create Renewal</button></div></form>`)};
  window.saveLoanRenewal=function(e,id){e.preventDefault();const l=loanBy(id),f=new FormData(e.target),amount=n(f.get('amount')),rate=n(f.get('rate')),tenure=Math.max(1,n(f.get('tenure'))),interest=amount*rate/100,total=amount+interest,installment=total/tenure;if(!l||!amount)return toast('Enter valid renewal amount');const nid='LN-'+String(data.loans.length+123).padStart(5,'0');data.loans.push({id:nid,customerId:l.customerId,amount,interest,total,balance:total,paid:0,rate,interestType:'Flat',type:l.type||'Renewal',tenure,start:today,due:today,frequency:f.get('frequency'),installment,status:'Active',payments:[],createdAt:profNow(),renewedFrom:id,branchId:l.branchId||data.branches[0]?.id});const c=customerBy(l.customerId);c.borrowed=(c.borrowed||0)+amount;c.balance=(c.balance||0)+total;save();audit('Loan renewed','Loan',nid,'From '+id+' · '+money(amount));closeModal();toast('Renewal loan created');render('loans')};
  window.openLoanTopup=function(id){const l=loanBy(id);if(!l)return;openModal('Loan Top-up',`<div class="payment-summary"><div><span>Loan</span><b>${id}</b></div><div><span>Current Outstanding</span><b>${money(l.balance)}</b></div></div><form onsubmit="saveLoanTopup(event,'${id}')"><div class="form-grid"><div class="field"><label>Top-up Amount *</label><input name="topup" type="number" min="1" required></div><div class="field"><label>Interest %</label><input name="rate" type="number" min="0" step="0.01" value="${n(l.rate)}"></div><div class="field"><label>Additional Tenure</label><input name="tenure" type="number" min="1" value="${n(l.tenure)||1}"></div></div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Apply Top-up</button></div></form>`)};
  window.saveLoanTopup=function(e,id){e.preventDefault();const l=loanBy(id),f=new FormData(e.target),top=n(f.get('topup')),rate=n(f.get('rate')),tenure=Math.max(1,n(f.get('tenure')));if(!l||top<=0)return toast('Enter valid top-up amount');const interest=top*rate/100,total=top+interest;l.amount=n(l.amount)+top;l.interest=n(l.interest)+interest;l.balance=n(l.balance)+total;l.total=n(l.total)+total;l.rate=rate;l.tenure=n(l.tenure)+tenure;l.installment=(n(l.balance)/Math.max(1,l.tenure));const c=customerBy(l.customerId);if(c)c.balance=n(c.balance)+total;c.borrowed=n(c.borrowed)+top;save();audit('Loan top-up','Loan',id,`Top-up ${money(top)}`);closeModal();toast('Top-up applied');render('loans')};
  window.openSettlement=function(id){const l=loanBy(id);if(!l)return;const discount=Math.min(n(l.balance),n(l.balance)*0.02);const suggested=Math.max(0,n(l.balance)-discount);openModal('Early Settlement',`<div class="payment-summary"><div><span>Outstanding</span><b>${money(l.balance)}</b></div><div><span>Suggested settlement</span><b>${money(suggested)}</b></div></div><form onsubmit="saveSettlement(event,'${id}')"><div class="form-grid"><div class="field"><label>Settlement Amount *</label><input name="amount" type="number" min="0" max="${n(l.balance)}" step="0.01" value="${suggested}" required></div><div class="field"><label>Reason</label><input name="reason" value="Early closure"></div></div><div class="form-actions"><button type="button" class="btn light" onclick="closeModal()">Cancel</button><button class="btn green">Settle & Close</button></div></form>`)};
  window.saveSettlement=function(e,id){e.preventDefault();const l=loanBy(id),f=new FormData(e.target),amount=n(f.get('amount'));if(!l||amount<=0||amount>n(l.balance))return toast('Invalid settlement amount');const before=n(l.balance),c=customerBy(l.customerId),p={id:(data.settings.receiptPrefix||'RC')+'-'+String(data.payments.length+1).padStart(5,'0'),customerId:c.id,loanId:id,amount,date:today,mode:'Cash',notes:'Early settlement: '+(f.get('reason')||''),createdAt:profNow(),previousBalance:before,balanceAfter:0};data.payments.push(p);l.balance=0;l.status='Closed';l.due='';c.balance=Math.max(0,n(c.balance)-before);save();audit('Loan settled','Loan',id,`Settlement ${money(amount)} · Previous ${money(before)}`);closeModal();toast('Loan settled');receipt(p.id);render('loans')};

  /* 7. Collector performance */
  window.collectionPerformance=function(){
    const target=n(data.targets?.[today.slice(0,7)]?.daily);const total=data.payments.filter(p=>p.date===today).reduce((s,p)=>s+n(p.amount),0);const byMode={};data.payments.filter(p=>p.date===today).forEach(p=>byMode[p.mode||'Cash']=(byMode[p.mode||'Cash']||0)+n(p.amount));
    openModal('Collection Performance',`<div class="cards"><div class="card"><div class="label">Today Collected</div><div class="value">${money(total)}</div></div><div class="card"><div class="label">Daily Target</div><div class="value">${money(target)}</div></div><div class="card"><div class="label">Achievement</div><div class="value">${target?Math.round(total/target*100):0}%</div></div><div class="card"><div class="label">Follow-ups Done</div><div class="value">${data.followUps.filter(f=>f.status==='Done'&&f.date===today).length}</div></div></div><div class="section" style="margin-top:14px"><h3>Payment Mode</h3><div class="detail-list">${Object.entries(byMode).map(([k,v])=>`<span>${safe(k)} <b>${money(v)}</b></span>`).join('')||'<span>No payments today</span>'}</div></div>`);
  };

  /* 8. Communication history */
  window.communicationHistory=function(customerId){const c=customerBy(customerId);const rows=data.communications.filter(x=>x.customerId===customerId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));openModal('Communication History · '+safe(c?.name||''),`<div class="section-head"><h3>Timeline</h3><button class="btn green" onclick="logCommunication('${customerId}')">+ Log Contact</button></div>${rows.map(x=>`<div class="activity-item"><div><b>${safe(x.type)}</b><small>${safe(x.note||'')}</small></div><span>${safe(x.date||'')}</span></div>`).join('')||'<div class="empty">No communication history</div>'}`)};
  window.logCommunication=function(customerId){const c=customerBy(customerId);openModal('Log Communication',`<form onsubmit="saveCommunication(event,'${customerId}')"><div class="form-grid"><div class="field"><label>Type</label><select name="type"><option>Call</option><option>Visit</option><option>WhatsApp</option><option>SMS</option><option>Email</option></select></div><div class="field"><label>Date</label><input name="date" type="date" value="${today}"></div><div class="field" style="grid-column:1/-1"><label>Note</label><textarea name="note" required></textarea></div></div><div class="form-actions"><button type="button" class="btn light" onclick="communicationHistory('${customerId}')">Cancel</button><button class="btn green">Save</button></div></form>`)};
  window.saveCommunication=function(e,customerId){e.preventDefault();const f=new FormData(e.target);data.communications.unshift({id:'COM-'+Date.now(),customerId,type:f.get('type'),date:f.get('date')||today,note:f.get('note'),createdAt:profNow()});save();audit('Communication logged','Customer',customerId,f.get('type'));toast('Communication saved');communicationHistory(customerId)};

  /* 9. Fraud / integrity scanner */
  window.fraudScanner=function(){
    const flags=[];const refs={};data.payments.forEach(p=>{if(p.ref){const k=String(p.ref).trim().toLowerCase();if(refs[k])flags.push(`Duplicate payment reference ${p.ref} on ${p.id} and ${refs[k]}`);else refs[k]=p.id}const l=loanBy(p.loanId);if(l&&n(p.amount)>n(p.previousBalance??l.balance)+n(p.amount))flags.push(`Payment exceeds balance: ${p.id}`);});
    data.customers.forEach(c=>{const same=data.customers.filter(x=>x.mobile&&x.mobile===c.mobile);if(same.length>1)flags.push(`Duplicate mobile: ${c.mobile}`)});
    data.loans.forEach(l=>{if(l.balance<0)flags.push(`Negative balance: ${l.id}`);if(!l.customerId||!customerBy(l.customerId))flags.push(`Loan has missing customer: ${l.id}`)});
    data.systemFlags=flags.map((x,i)=>({id:'FLAG-'+i+1,text:x,createdAt:profNow()}));save();openModal('Data Integrity & Risk Scan',`<div class="section-head"><h3>${flags.length?'Issues Found':'All Checks Passed'}</h3><span class="muted">${flags.length} flags</span></div>${flags.map(x=>`<div class="alert-box"><div><b>⚠ ${safe(x)}</b><small>Review before financial closing</small></div></div>`).join('')||'<div class="empty">No duplicate or integrity issues detected.</div>'}`)};

  /* 10. Financial calendar */
  window.financialCalendar=function(){
    const rows=[...data.loans.filter(l=>n(l.balance)>0&&l.due).map(l=>({date:l.due,type:l.due<today?'Overdue':'Due',text:(customerBy(l.customerId)?.name||'Customer')+' · '+money(l.installment||l.balance)})),...data.pdc.filter(x=>x.status==='Pending').map(x=>({date:x.dueDate,type:'PDC',text:'Cheque '+x.chequeNo+' · '+money(x.amount)})),...data.followUps.filter(f=>f.status!=='Done'&&f.date).map(f=>({date:f.date,type:'Follow-up',text:(customerBy(f.customerId)?.name||'Customer')}))].sort((a,b)=>a.date.localeCompare(b.date));
    openModal('Financial Calendar',`<div class="table-scroll"><table class="table"><thead><tr><th>DATE</th><th>TYPE</th><th>DETAIL</th></tr></thead><tbody>${rows.slice(0,100).map(x=>`<tr><td>${safe(x.date)}</td><td><span class="status ${x.type.toLowerCase().replace(/\s/g,'')}">${safe(x.type)}</span></td><td>${safe(x.text)}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">No scheduled items</div></td></tr>'}</tbody></table></div>`)};

  /* 11. KPI center */
  window.kpiCenter=function(){const loans=data.loans,pay=data.payments,exp=data.expenses||[],out=loans.reduce((s,l)=>s+n(l.balance),0),od=overdueLoans().reduce((s,l)=>s+n(l.balance),0),month=today.slice(0,7);const mc=pay.filter(p=>String(p.date).slice(0,7)===month).reduce((s,p)=>s+n(p.amount),0),me=exp.filter(x=>String(x.date).slice(0,7)===month).reduce((s,x)=>s+n(x.amount),0),eff=dueAmountToday()?Math.round(pay.filter(p=>p.date===today).reduce((s,p)=>s+n(p.amount),0)/dueAmountToday()*100):0;openModal('Business KPI',`<div class="cards"><div class="card"><div class="label">Outstanding</div><div class="value">${money(out)}</div></div><div class="card"><div class="label">Overdue Portfolio</div><div class="value">${money(od)}</div></div><div class="card"><div class="label">Collection Efficiency</div><div class="value">${eff}%</div></div><div class="card"><div class="label">Month Net</div><div class="value">${money(mc-me)}</div></div></div><div class="detail-list" style="margin-top:14px"><span>Interest in portfolio <b>${money(loans.reduce((s,l)=>s+n(l.interest),0))}</b></span><span>Active customers <b>${data.customers.filter(c=>n(c.balance)>0).length}</b></span><span>High-risk customers <b>${data.customers.filter(c=>riskScore(c)>=60).length}</b></span></div>`)};

  /* 12. Import wizard */
  window.importWizard=function(){openModal('Data Import Wizard',`<div class="settings-note">Import a JSON backup safely. The file is validated before replacing local data.</div><div class="form-actions"><button class="btn green" onclick="importBackupValidated()">Choose Backup File</button></div>`)};
  window.importBackupValidated=function(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result),d=p.data||p;if(!Array.isArray(d.customers)||!Array.isArray(d.loans)||!Array.isArray(d.payments))throw Error('Invalid');const issues=[];d.loans.forEach(l=>{if(!l.id||!l.customerId)issues.push('Loan missing ID/customer')});d.payments.forEach(x=>{if(!x.id||!x.loanId)issues.push('Payment missing receipt/loan')});if(issues.length)return toast(issues[0]);const old=data;data=d;ensure();data.importLog.unshift({at:profNow(),file:f.name,records:data.customers.length+data.loans.length+data.payments.length});save();audit('Validated backup imported','System','import',f.name);toast('Validated backup restored');appSettings()}catch(e){toast('Invalid backup file')}};r.readAsText(f)};input.click()};

  /* 13. Loan product manager */
  window.loanProductManager=function(){const rows=data.loanProducts.map(p=>`<tr><td><b>${safe(p.name)}</b></td><td>${n(p.rate)}%</td><td>${safe(p.frequency)}</td><td>${n(p.tenure)}</td></tr>`).join('');openModal('Loan Products',`<div class="section-head"><h3>Products</h3><button class="btn green" onclick="addLoanProduct()">+ Add Product</button></div><div class="table-scroll"><table class="table"><thead><tr><th>NAME</th><th>RATE</th><th>FREQUENCY</th><th>TENURE</th></tr></thead><tbody>${rows||'<tr><td colspan="4"><div class="empty">No custom products</div></td></tr>'}</tbody></table></div>`)};
  window.addLoanProduct=function(){openModal('Add Loan Product',`<form onsubmit="saveLoanProduct(event)"><div class="form-grid"><div class="field"><label>Product Name</label><input name="name" required></div><div class="field"><label>Interest %</label><input name="rate" type="number" min="0" step="0.01"></div><div class="field"><label>Frequency</label><select name="frequency"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div><div class="field"><label>Default Tenure</label><input name="tenure" type="number" min="1" value="12"></div></div><div class="form-actions"><button type="button" class="btn light" onclick="loanProductManager()">Cancel</button><button class="btn green">Save Product</button></div></form>`)};
  window.saveLoanProduct=function(e){e.preventDefault();const f=new FormData(e.target);data.loanProducts.push({id:'LP-'+Date.now(),name:f.get('name'),rate:n(f.get('rate')),frequency:f.get('frequency'),tenure:n(f.get('tenure'))});save();audit('Loan product added','System',data.loanProducts.at(-1).id,f.get('name'));toast('Loan product saved');loanProductManager()};

  /* 14. Approval workflow */
  window.approvalManager=function(){const rows=data.approvals.slice().reverse().map(a=>`<tr><td>${safe(a.type)}</td><td>${safe(a.reference)}</td><td>${money(a.amount)}</td><td><span class="status ${a.status.toLowerCase()}">${safe(a.status)}</span></td><td>${a.status==='Pending'?`<button class="mini-btn green-mini" onclick="approveItem('${a.id}')">Approve</button>`:''}</td></tr>`).join('');openModal('Approval Workflow',`<div class="settings-note">Large-value transactions can be reviewed before final processing.</div><div class="table-scroll"><table class="table"><thead><tr><th>TYPE</th><th>REFERENCE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="5"><div class="empty">No approval requests</div></td></tr>'}</tbody></table></div>`)};
  window.approveItem=function(id){if(typeof guard==='function'&&!guard(['Admin','Manager']))return;const a=data.approvals.find(x=>x.id===id);if(!a)return;a.status='Approved';a.approvedAt=profNow();save();audit('Approval granted','Approval',id,a.type+' · '+money(a.amount));toast('Approval granted');approvalManager()};

  /* 15. End-of-month lock helper */
  window.financialPeriodManager=function(){lockManager()};

  /* 16. Multi-branch assignment */
  window.branchAssignment=function(){const rows=data.loans.map(l=>{const c=customerBy(l.customerId);return `<tr><td>${safe(l.id)}</td><td>${safe(c?.name||'-')}</td><td><select onchange="assignLoanBranch('${l.id}',this.value)">${data.branches.map(b=>`<option value="${b.id}" ${b.id===(l.branchId||data.branches[0]?.id)?'selected':''}>${safe(b.name)}</option>`).join('')}</select></td></tr>`}).join('');openModal('Branch Assignment',`<div class="table-scroll"><table class="table"><thead><tr><th>LOAN</th><th>CUSTOMER</th><th>BRANCH</th></tr></thead><tbody>${rows||'<tr><td colspan="3"><div class="empty">No loans</div></td></tr>'}</tbody></table></div>`)};
  window.assignLoanBranch=function(id,bid){const l=loanBy(id);if(!l)return;l.branchId=bid;save();audit('Loan branch changed','Loan',id,bid);toast('Branch updated')};

  /* 17. Daily route + KPI quick center, injected into existing Professional Controls only */
  const oldPC=window.professionalCenter;
  window.professionalCenter=function(){
    oldPC();
    setTimeout(()=>{
      const root=document.querySelector('.pro-center'); if(!root)return;
      const actions=root.querySelector('.data-actions'); if(!actions)return;
      const defs=[['routePlanner','Collection Route'],['promiseManager','Promise-to-Pay'],['collectionPerformance','Collection Performance'],['communicationHistory','Customer Communications'],['fraudScanner','Integrity Scanner'],['financialCalendar','Financial Calendar'],['kpiCenter','Business KPI'],['importWizard','Import Wizard'],['loanProductManager','Loan Products'],['approvalManager','Approvals'],['branchAssignment','Branch Assignment']];
      defs.forEach(([fn,label])=>{if(!actions.querySelector(`[data-plus="${fn}"]`)){const b=document.createElement('button');b.className='btn';b.dataset.plus=fn;b.textContent=label;b.onclick=()=>window[fn]();actions.appendChild(b)}});
    },0);
  };
  window.professionalCenter=professionalCenter;

  /* Make loan menu expose the advanced workflow while retaining existing options. */
  window.loanMenu=function(id){loanActionsPro(id)};

  /* Customer profile quick access: communication history remains additive. */
  window.customerCommunication=function(id){communicationHistory(id)};

  /* Protect edits in locked months for common date-bearing records. */
  const oldSaveFollow=window.saveFollowUp;
  window.saveFollowUp=function(e,customerId,loanId){
    const f=e?.target?new FormData(e.target):null;const m=monthKey(f?.get('date'));if(data.monthLocks?.[m]){toast('This month is locked');return;}return oldSaveFollow?oldSaveFollow(e,customerId,loanId):saveFollowUpPlus(e,customerId,loanId);
  };

  /* Approval helper for large manual disbursement / top-up requests. */
  window.requestApproval=function(type,reference,amount,details){const x={id:'APR-'+Date.now(),type,reference,amount:n(amount),details:details||'',status:'Pending',requestedAt:profNow()};data.approvals.push(x);save();audit('Approval requested','Approval',x.id,type+' · '+money(amount));toast('Approval request created');return x};

  save();

  /* ============================================================
     MITHRA ULTIMATE — ACTION CENTER / INTELLIGENCE LAYER
     Additive-only. Reuses existing data and UI helpers.
     No duplicate pages, no duplicate IDs, no existing function replacement.
     ============================================================ */
  data.mithraUltimate = data.mithraUltimate || {
    version: 1,
    watched: [],
    actionSeen: {},
    forecastDays: 30
  };
  data.mithraUltimate.watched = Array.isArray(data.mithraUltimate.watched) ? data.mithraUltimate.watched : [];
  data.mithraUltimate.actionSeen = data.mithraUltimate.actionSeen || {};
  save();

  const muMoney = v => money(Number(v||0));
  const muLoan = id => data.loans.find(l=>l.id===id);
  const muCust = id => data.customers.find(c=>c.id===id);
  const muOverdueDays = d => d ? Math.max(0,Math.floor((Date.parse(today)-Date.parse(d))/86400000)) : 0;
  const muPaymentsFor = id => data.payments.filter(p=>p.loanId===id);
  const muCollection = (from,to) => data.payments.filter(p=>String(p.date)>=from&&String(p.date)<=to).reduce((s,p)=>s+Number(p.amount||0),0);
  const muDaysAgo = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const muDaysAhead = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

  function muActions(){
    const a=[];
    const overdue=data.loans.filter(l=>Number(l.balance)>0&&l.due&&l.due<today);
    const critical=overdue.filter(l=>muOverdueDays(l.due)>=30);
    const dueToday=data.loans.filter(l=>Number(l.balance)>0&&l.due===today);
    const follow=(data.followups||[]).filter(f=>f.status!=='Done'&&f.date&&f.date<=today);
    const promises=(data.mithraPromises||[]).filter(x=>x.status==='Pending'&&x.date&&x.date<=today);
    const audit=(data.auditLog||[]).length;
    const orphan=data.payments.filter(p=>!muLoan(p.loanId));
    const badBal=data.loans.filter(l=>Number(l.balance)<-0.01);
    critical.slice(0,10).forEach(l=>a.push({type:'Critical Overdue',level:'high',title:`${muCust(l.customerId)?.name||'Customer'} · ${l.id}`,detail:`${muOverdueDays(l.due)} days overdue · ${muMoney(l.balance)}`,loan:l.id}));
    dueToday.slice(0,10).forEach(l=>a.push({type:'Due Today',level:'medium',title:`${muCust(l.customerId)?.name||'Customer'} · ${l.id}`,detail:`Due ${muMoney(l.installment||l.balance)}`,loan:l.id}));
    follow.slice(0,10).forEach(f=>a.push({type:'Follow-up',level:'medium',title:`Follow-up · ${muCust(f.customerId)?.name||'Customer'}`,detail:`Due ${f.date}`,customer:f.customerId}));
    promises.slice(0,10).forEach(p=>a.push({type:'Promise Due',level:'medium',title:`Promise · ${muCust(p.customerId)?.name||'Customer'}`,detail:`${muMoney(p.amount)} promised`,loan:p.loanId}));
    if(orphan.length)a.push({type:'Data Exception',level:'high',title:'Orphan payments',detail:`${orphan.length} payment(s) reference missing loans`});
    if(badBal.length)a.push({type:'Data Exception',level:'high',title:'Invalid loan balances',detail:`${badBal.length} loan(s) have negative balance`});
    if(!audit)a.push({type:'Control',level:'low',title:'Audit log empty',detail:'Review system activity controls'});
    return a;
  }

  window.mithraActionCenter=function(){
    const a=muActions(), high=a.filter(x=>x.level==='high').length, med=a.filter(x=>x.level==='medium').length, low=a.filter(x=>x.level==='low').length;
    openModal('Mithra Action Center',`
      <div class="cards">
        <div class="card"><div class="label">Immediate</div><div class="value">${high}</div></div>
        <div class="card"><div class="label">Follow-up</div><div class="value">${med}</div></div>
        <div class="card"><div class="label">Review</div><div class="value">${low}</div></div>
        <div class="card"><div class="label">Total Actions</div><div class="value">${a.length}</div></div>
      </div>
      <div class="table-scroll" style="margin-top:14px"><table class="table"><thead><tr><th>LEVEL</th><th>ACTION</th><th>DETAIL</th><th></th></tr></thead><tbody>
      ${a.map((x,i)=>`<tr><td>${x.level==='high'?'🔴':x.level==='medium'?'🟠':'🟡'} ${x.level}</td><td><b>${esc(x.type)}</b><br>${esc(x.title)}</td><td>${esc(x.detail)}</td><td>${x.loan?`<button class="mini-btn" onclick="mfsLifecycleDetail('${x.loan}')">Open</button>`:x.customer?`<button class="mini-btn" onclick="openCustomer('${x.customer}')">Open</button>`:''}</td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">No actions required 🎉</div></td></tr>'}
      </tbody></table></div>
      <div class="form-actions"><button class="btn" onclick="mithraBusinessSnapshot()">Business Snapshot</button><button class="btn" onclick="mithraCashForecast()">Cashflow Forecast</button><button class="btn" onclick="mithraDataHealth()">Data Health</button></div>`);
  };

  window.mithraBusinessSnapshot=function(){
    const from=muDaysAgo(30), k=data.loans.reduce((s,l)=>s+Number(l.balance||0),0);
    const col=muCollection(from,today), overdue=data.loans.filter(l=>Number(l.balance)>0&&l.due&&l.due<today).reduce((s,l)=>s+Number(l.balance||0),0);
    const due=data.loans.filter(l=>Number(l.balance)>0&&l.due>=today&&l.due<=muDaysAhead(30)).reduce((s,l)=>s+Number(l.installment||l.balance||0),0);
    const exp=(data.expenses||[]).filter(x=>String(x.date)>=from&&String(x.date)<=today).reduce((s,x)=>s+Number(x.amount||0),0);
    const target=Number(data.settings?.monthlyTarget||0);
    const ach=target?Math.round(col/target*100):0;
    openModal('Business Snapshot',`
      <div class="cards">
        <div class="card"><div class="label">30-Day Collection</div><div class="value">${muMoney(col)}</div></div>
        <div class="card"><div class="label">Outstanding</div><div class="value">${muMoney(k)}</div></div>
        <div class="card"><div class="label">Overdue</div><div class="value">${muMoney(overdue)}</div></div>
        <div class="card"><div class="label">Next 30-Day Due</div><div class="value">${muMoney(due)}</div></div>
      </div>
      <div class="detail-list" style="margin-top:14px"><span>30-day expenses <b>${muMoney(exp)}</b></span><span>Net movement <b>${muMoney(col-exp)}</b></span><span>Monthly target achievement <b>${target?ach+'%':'Not configured'}</b></span><span>Actions required <b>${muActions().length}</b></span></div>`);
  };

  window.mithraCashForecast=function(){
    const days=Math.max(7,Math.min(90,Number(data.mithraUltimate.forecastDays)||30)), end=muDaysAhead(days);
    const expected=data.loans.filter(l=>Number(l.balance)>0&&l.due>=today&&l.due<=end).reduce((s,l)=>s+Number(l.installment||l.balance||0),0);
    const historical=muCollection(muDaysAgo(30),today);
    const daily=historical/30;
    const projected=Math.round(daily*days);
    const expenses=(data.expenses||[]).filter(x=>String(x.date)>=today&&String(x.date)<=end).reduce((s,x)=>s+Number(x.amount||0),0);
    openModal('Cashflow Forecast',`
      <div class="cards"><div class="card"><div class="label">Scheduled Due</div><div class="value">${muMoney(expected)}</div></div><div class="card"><div class="label">Historical Pace</div><div class="value">${muMoney(projected)}</div></div><div class="card"><div class="label">Planned Expenses</div><div class="value">${muMoney(expenses)}</div></div><div class="card"><div class="label">Projected Net</div><div class="value">${muMoney(projected-expenses)}</div></div></div>
      <div class="settings-note" style="margin-top:12px">Forecast is based only on existing local payment history and scheduled dues; it does not modify actual transactions.</div>`);
  };

  window.mithraDataHealth=function(){
    const issues=[];
    const custIds=new Set(data.customers.map(c=>c.id));
    const loanIds=new Set(data.loans.map(l=>l.id));
    data.loans.forEach(l=>{
      if(!custIds.has(l.customerId))issues.push('Loan '+l.id+' has no customer');
      if(l.due&&l.start&&String(l.due)<String(l.start))issues.push('Loan '+l.id+' has due date before start');
      if(Number(l.balance)<0)issues.push('Loan '+l.id+' has negative balance');
    });
    data.payments.forEach(p=>{if(!loanIds.has(p.loanId))issues.push('Payment '+p.id+' has no loan')});
    const mobiles={}; data.customers.forEach(c=>{const m=String(c.mobile||'').replace(/\D/g,'');if(m){if(mobiles[m])issues.push(`Possible duplicate mobile: ${m}`);else mobiles[m]=c.id}});
    const missing=data.customers.filter(c=>!c.name||!c.mobile).length;
    if(missing)issues.push(`${missing} customer(s) missing name or mobile`);
    const score=Math.max(0,Math.round(100-(issues.length/Math.max(1,data.customers.length+data.loans.length+data.payments.length))*100));
    openModal('Data Health',`
      <div class="cards"><div class="card"><div class="label">Health Score</div><div class="value">${score}%</div></div><div class="card"><div class="label">Issues</div><div class="value">${issues.length}</div></div><div class="card"><div class="label">Customers</div><div class="value">${data.customers.length}</div></div><div class="card"><div class="label">Loans</div><div class="value">${data.loans.length}</div></div></div>
      <div class="detail-list" style="margin-top:14px">${issues.slice(0,30).map(x=>`<span>⚠ <b>${esc(x)}</b></span>`).join('')||'<span>✓ No data-quality issues detected.</span>'}</div>`);
  };

  /* Add one non-duplicating Action Center button to the existing dashboard quick-action area. */
  function muInstallActionButton(){
    const candidates=[...document.querySelectorAll('button,a')].filter(x=>/quick action|action center/i.test(x.textContent||''));
    const host=candidates[0]?.parentElement;
    if(host&&!host.querySelector('[data-mithra-action-center]')){
      const b=document.createElement('button'); b.className='btn'; b.textContent='Action Center'; b.dataset.mithraActionCenter='1'; b.onclick=()=>mithraActionCenter(); host.appendChild(b);
    }
  }
  setTimeout(muInstallActionButton,300);
  setInterval(()=>{ try{muInstallActionButton()}catch(e){} },5000);
  save();


  /* ============================================================
     MITHRA PREMIUM UX LAYER
     Additive only — no existing page/function is replaced.
     ============================================================ */
  data.mithraPremium = data.mithraPremium || {pinned:[], recent:[], notifications:[]};
  data.mithraPremium.pinned = Array.isArray(data.mithraPremium.pinned) ? data.mithraPremium.pinned : [];
  data.mithraPremium.recent = Array.isArray(data.mithraPremium.recent) ? data.mithraPremium.recent : [];
  save();

  const mpEsc = v => esc(String(v ?? ''));
  const mpPushRecent = (type,id,label)=>{
    if(!id)return;
    data.mithraPremium.recent=[{type,id,label,at:profNow()},...data.mithraPremium.recent.filter(x=>!(x.type===type&&x.id===id))].slice(0,12);
    save();
  };

  window.mithraCommandPalette=function(){
    openModal('Mithra Command Palette',`
      <div class="mp-command">
        <input id="mpCommandSearch" autofocus placeholder="Search customer, loan, receipt or action..." oninput="mithraCommandFilter(this.value)">
        <div id="mpCommandResults" class="mp-command-results">
          <button class="mp-command-item" onclick="mithraActionCenter()"><b>Action Center</b><small>Open today's actions</small></button>
          <button class="mp-command-item" onclick="mithraBusinessSnapshot()"><b>Executive Snapshot</b><small>Business overview</small></button>
          <button class="mp-command-item" onclick="mithraCashForecast()"><b>Cashflow Forecast</b><small>Expected cash movement</small></button>
          <button class="mp-command-item" onclick="mithraDataHealth()"><b>Data Health</b><small>Find data-quality issues</small></button>
          <button class="mp-command-item" onclick="mfsAccountingCenter()"><b>Accounting Center</b><small>Collections and expenses</small></button>
          <button class="mp-command-item" onclick="mfsReminderCenter()"><b>Reminder Center</b><small>Due and follow-up queue</small></button>
        </div>
      </div>`);
  };

  window.mithraCommandFilter=function(q){
    q=String(q||'').trim().toLowerCase();
    const box=document.getElementById('mpCommandResults'); if(!box)return;
    if(!q){
      [...box.children].forEach(x=>x.style.display='');
      return;
    }
    const items=[];
    data.customers.forEach(c=>{if((c.name+' '+c.mobile+' '+c.id).toLowerCase().includes(q))items.push(`<button class="mp-command-item" onclick="openCustomer('${c.id}');mithraRecordRecent('Customer','${c.id}','${mpEsc(c.name)}')"><b>${mpEsc(c.name)}</b><small>Customer · ${mpEsc(c.mobile||c.id)}</small></button>`)});
    data.loans.forEach(l=>{if((l.id+' '+(mpCust(l.customerId)?.name||'')).toLowerCase().includes(q))items.push(`<button class="mp-command-item" onclick="mfsLifecycleDetail('${l.id}');mithraRecordRecent('Loan','${l.id}','${mpEsc(l.id)}')"><b>${mpEsc(l.id)}</b><small>Loan · ${mpEsc(mpCust(l.customerId)?.name||'')}</small></button>`)});
    data.payments.forEach(p=>{if((p.id+' '+p.loanId+' '+(p.ref||'')).toLowerCase().includes(q))items.push(`<button class="mp-command-item" onclick="mithraPaymentResult('${p.id}')"><b>${mpEsc(p.id)}</b><small>Payment · ${mpEsc(p.loanId||'')}</small></button>`)});
    box.innerHTML=items.slice(0,12).join('')||'<div class="empty">No matching records</div>';
  };

  window.mithraPaymentResult=function(id){
    const p=data.payments.find(x=>x.id===id); if(!p)return;
    const l=muLoan(p.loanId), c=muCust(l?.customerId);
    mpPushRecent('Payment',id,id);
    openModal('Payment Details',`<div class="detail-list"><span>Receipt <b>${mpEsc(p.id)}</b></span><span>Date <b>${mpEsc(p.date)}</b></span><span>Customer <b>${mpEsc(c?.name||'-')}</b></span><span>Loan <b>${mpEsc(p.loanId||'-')}</b></span><span>Amount <b>${muMoney(p.amount)}</b></span><span>Mode <b>${mpEsc(p.mode||'-')}</b></span></div>`);
  };

  window.mithraRecordRecent=function(type,id,label){mpPushRecent(type,id,label);};

  window.mithraRecentPinned=function(){
    const pinned=data.mithraPremium.pinned, recent=data.mithraPremium.recent;
    openModal('Quick Access',`
      <h4>Pinned</h4>
      <div class="mp-list">${pinned.map(x=>`<button class="mp-row" onclick="mithraOpenQuick('${x.type}','${x.id}')"><b>${mpEsc(x.label)}</b><small>${mpEsc(x.type)}</small></button>`).join('')||'<div class="empty">Nothing pinned</div>'}</div>
      <h4 style="margin-top:18px">Recently Viewed</h4>
      <div class="mp-list">${recent.map(x=>`<button class="mp-row" onclick="mithraOpenQuick('${x.type}','${x.id}')"><b>${mpEsc(x.label)}</b><small>${mpEsc(x.type)} · ${mpEsc(x.at)}</small></button>`).join('')||'<div class="empty">No recent records</div>'}</div>`);
  };

  window.mithraOpenQuick=function(type,id){
    if(type==='Customer')return openCustomer(id);
    if(type==='Loan')return mfsLifecycleDetail(id);
    if(type==='Payment')return mithraPaymentResult(id);
  };

  window.mithraPin=function(type,id,label){
    const p=data.mithraPremium.pinned;
    const i=p.findIndex(x=>x.type===type&&x.id===id);
    if(i>=0)p.splice(i,1); else p.unshift({type,id,label});
    data.mithraPremium.pinned=p.slice(0,20); save(); toast(i>=0?'Removed from pinned':'Pinned');
  };

  function mpInstallTopTools(){
    const top=document.querySelector('.top-actions');
    if(top&&!top.querySelector('[data-mithra-premium-tools]')){
      const wrap=document.createElement('div');
      wrap.dataset.mithraPremiumTools='1';
      wrap.className='mp-top-tools';
      wrap.innerHTML=`<button class="icon-btn" title="Command Palette" onclick="mithraCommandPalette()">⌘</button><button class="icon-btn" title="Quick Access" onclick="mithraRecentPinned()">★</button>`;
      top.insertBefore(wrap,top.firstChild);
    }
  }
  setTimeout(mpInstallTopTools,300);
  setInterval(()=>{try{mpInstallTopTools()}catch(e){}},5000);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ try{closeModal()}catch(x){} }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();mithraCommandPalette();}
    if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();document.getElementById('globalSearch')?.focus();}
  });

  /* Keep existing page structure; add non-invasive status class hooks to existing badges. */
  function mpPolishStatuses(){
    document.querySelectorAll('.badge,.status,.pill').forEach(el=>{
      if(el.dataset.mithraPolished)return;
      el.dataset.mithraPolished='1';
      el.classList.add('mp-status');
    });
  }
  setTimeout(mpPolishStatuses,500);
  setInterval(()=>{try{mpPolishStatuses()}catch(e){}},5000);
  save();


  /* ============================================================
     MITHRA SMART OPERATIONS
     Additive-only: anomaly detection, reconciliation suggestions,
     balance explanation, payment-pattern analysis, business-day
     lifecycle. No existing page/function is replaced.
     ============================================================ */
  data.mithraSmartOps=data.mithraSmartOps||{businessDay:'OPEN',openedAt:today};
  save();

  const soLoan=id=>data.loans.find(x=>x.id===id);
  const soCust=id=>data.customers.find(x=>x.id===id);
  const soPayments=id=>data.payments.filter(x=>x.loanId===id);
  const soNum=x=>Number(x||0);
  const soDate=d=>String(d||'');
  const soDays=(a,b)=>Math.max(0,Math.floor((Date.parse(b)-Date.parse(a))/86400000));

  window.mithraBalanceExplain=function(id){
    const l=soLoan(id); if(!l)return;
    const ps=soPayments(id), paid=ps.reduce((s,p)=>s+soNum(p.amount),0);
    const principal=soNum(l.principal||l.amount||l.loanAmount);
    const interest=soNum(l.interest||l.totalInterest);
    const charges=soNum(l.fees||l.processingFee||l.charges);
    const shown=soNum(l.balance);
    const calculated=Math.max(0,principal+interest+charges-paid);
    openModal('Balance Explanation',`
      <div class="cards">
        <div class="card"><div class="label">Principal</div><div class="value">${muMoney(principal)}</div></div>
        <div class="card"><div class="label">Interest</div><div class="value">${muMoney(interest)}</div></div>
        <div class="card"><div class="label">Charges</div><div class="value">${muMoney(charges)}</div></div>
        <div class="card"><div class="label">Paid</div><div class="value">${muMoney(paid)}</div></div>
      </div>
      <div class="detail-list" style="margin-top:14px"><span>Calculated balance <b>${muMoney(calculated)}</b></span><span>Recorded balance <b>${muMoney(shown)}</b></span><span>Difference <b>${muMoney(calculated-shown)}</b></span></div>`);
  };

  window.mithraPaymentPattern=function(id){
    const l=soLoan(id), ps=soPayments(id).sort((a,b)=>soDate(a.date).localeCompare(soDate(b.date)));
    if(!l)return;
    let gaps=[]; for(let i=1;i<ps.length;i++)gaps.push(soDays(ps[i-1].date,ps[i].date));
    const late=ps.filter(p=>l.due&&soDate(p.date)>soDate(l.due)).length;
    const avg=gaps.length?Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length):0;
    const total=ps.reduce((s,p)=>s+soNum(p.amount),0);
    openModal('Payment Pattern',`
      <div class="cards"><div class="card"><div class="label">Payments</div><div class="value">${ps.length}</div></div><div class="card"><div class="label">Total Paid</div><div class="value">${muMoney(total)}</div></div><div class="card"><div class="label">Late Payments</div><div class="value">${late}</div></div><div class="card"><div class="label">Avg Gap</div><div class="value">${avg||0} days</div></div></div>
      <div class="settings-note" style="margin-top:12px">Pattern is descriptive only and does not make lending or collection decisions automatically.</div>`);
  };

  window.mithraAnomalies=function(){
    const found=[];
    const seen={};
    data.payments.forEach(p=>{
      const key=[p.loanId,p.date,soNum(p.amount),p.ref||''].join('|');
      if(seen[key])found.push({level:'high',title:'Possible repeated payment',detail:`${p.id} resembles ${seen[key]}`});
      else seen[key]=p.id;
      if(!soLoan(p.loanId))found.push({level:'high',title:'Payment without loan',detail:p.id});
      if(soNum(p.amount)<=0)found.push({level:'high',title:'Non-positive payment',detail:p.id});
    });
    data.loans.forEach(l=>{
      if(soNum(l.balance)<0)found.push({level:'high',title:'Negative balance',detail:l.id});
      if(l.start&&l.due&&soDate(l.due)<soDate(l.start))found.push({level:'medium',title:'Date anomaly',detail:`${l.id}: due before start`});
    });
    const amounts=data.payments.map(p=>soNum(p.amount)).filter(x=>x>0);
    const avg=amounts.length?amounts.reduce((a,b)=>a+b,0)/amounts.length:0;
    const threshold=avg*5;
    data.payments.forEach(p=>{if(threshold>0&&soNum(p.amount)>threshold)found.push({level:'medium',title:'Unusually large payment',detail:`${p.id}: ${muMoney(p.amount)}`})});
    openModal('Anomaly Detector',`
      <div class="cards"><div class="card"><div class="label">Findings</div><div class="value">${found.length}</div></div><div class="card"><div class="label">High</div><div class="value">${found.filter(x=>x.level==='high').length}</div></div><div class="card"><div class="label">Medium</div><div class="value">${found.filter(x=>x.level==='medium').length}</div></div><div class="card"><div class="label">Payments Scanned</div><div class="value">${data.payments.length}</div></div></div>
      <div class="table-scroll" style="margin-top:14px"><table class="table"><thead><tr><th>LEVEL</th><th>FINDING</th><th>DETAIL</th></tr></thead><tbody>${found.slice(0,50).map(x=>`<tr><td>${x.level==='high'?'🔴':'🟠'} ${x.level}</td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">No anomalies detected.</div></td></tr>'}</tbody></table></div>`);
  };

  window.mithraReconcile=function(){
    const rows=[];
    const refs={};
    data.payments.forEach(p=>{const r=String(p.ref||p.reference||'').trim();if(r){if(refs[r])rows.push({type:'Duplicate reference candidate',ref:r,items:[refs[r],p.id]});else refs[r]=p.id}});
    const loans=new Set(data.loans.map(l=>l.id));
    data.payments.forEach(p=>{if(!loans.has(p.loanId))rows.push({type:'Unmatched payment',ref:p.id,items:[p.loanId||'No loan']})});
    openModal('Reconciliation Matching',`
      <div class="cards"><div class="card"><div class="label">Suggestions</div><div class="value">${rows.length}</div></div><div class="card"><div class="label">Payments</div><div class="value">${data.payments.length}</div></div><div class="card"><div class="label">Matched Loans</div><div class="value">${data.payments.filter(p=>loans.has(p.loanId)).length}</div></div><div class="card"><div class="label">Unmatched</div><div class="value">${data.payments.filter(p=>!loans.has(p.loanId)).length}</div></div></div>
      <div class="table-scroll" style="margin-top:14px"><table class="table"><thead><tr><th>TYPE</th><th>REFERENCE</th><th>RECORDS</th></tr></thead><tbody>${rows.slice(0,50).map(x=>`<tr><td>${esc(x.type)}</td><td>${esc(x.ref)}</td><td>${esc(x.items.join(', '))}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">No reconciliation suggestions.</div></td></tr>'}</tbody></table></div>`);
  };

  window.mithraBusinessDay=function(){
    const state=data.mithraSmartOps.businessDay||'OPEN';
    const action=state==='OPEN'?'Close Day':'Re-open Day';
    openModal('Business Day Lifecycle',`
      <div class="cards"><div class="card"><div class="label">Current State</div><div class="value">${esc(state)}</div></div><div class="card"><div class="label">Opened</div><div class="value">${esc(data.mithraSmartOps.openedAt||today)}</div></div></div>
      <div class="detail-list" style="margin-top:14px"><span>Workflow <b>Open → Operations → Reconciliation → Close</b></span><span>Current date <b>${esc(today)}</b></span></div>
      <div class="form-actions"><button class="btn" onclick="mithraToggleBusinessDay()">${action}</button><button class="btn" onclick="mithraReconcile()">Reconciliation</button></div>`);
  };

  window.mithraToggleBusinessDay=function(){
    const old=data.mithraSmartOps.businessDay||'OPEN';
    data.mithraSmartOps.businessDay=old==='OPEN'?'CLOSED':'OPEN';
    if(data.mithraSmartOps.businessDay==='OPEN')data.mithraSmartOps.openedAt=today;
    save(); toast(data.mithraSmartOps.businessDay==='CLOSED'?'Business day closed':'Business day opened');
    mithraBusinessDay();
  };

  function soInstall(){
    const host=[...document.querySelectorAll('button,a')].find(x=>/Action Center/i.test(x.textContent||''))?.parentElement;
    if(host&&!host.querySelector('[data-mithra-smartops]')){
      const wrap=document.createElement('div');wrap.dataset.mithraSmartops='1';wrap.className='form-actions';
      wrap.innerHTML='<button class="btn" onclick="mithraAnomalies()">Anomalies</button><button class="btn" onclick="mithraReconcile()">Reconcile</button><button class="btn" onclick="mithraBusinessDay()">Business Day</button>';
      host.appendChild(wrap);
    }
  }
  setTimeout(soInstall,700); setInterval(()=>{try{soInstall()}catch(e){}},5000);
  save();


  /* ============================================================
     MITHRA PREMIUM PRO UX
     Additive-only visual/UX layer. Existing pages and functions
     are preserved; no duplicate business pages are created.
     ============================================================ */
  data.mithraPro=data.mithraPro||{notificationsRead:{},lastSearch:''};
  data.mithraPro.notificationsRead=data.mithraPro.notificationsRead||{};
  save();

  function mpProActions(){
    const actions=[];
    const overdue=data.loans.filter(l=>Number(l.balance)>0&&l.due&&l.due<today);
    const due=data.loans.filter(l=>Number(l.balance)>0&&l.due===today);
    const follow=(data.followups||[]).filter(f=>f.status!=='Done'&&f.date&&f.date<=today);
    overdue.slice(0,8).forEach(l=>actions.push({kind:'Finance',level:'critical',text:`${muCust(l.customerId)?.name||'Customer'} · overdue`,detail:muMoney(l.balance),id:l.id,type:'Loan'}));
    due.slice(0,8).forEach(l=>actions.push({kind:'Finance',level:'warning',text:`${muCust(l.customerId)?.name||'Customer'} · due today`,detail:muMoney(l.installment||l.balance),id:l.id,type:'Loan'}));
    follow.slice(0,8).forEach(f=>actions.push({kind:'Follow-up',level:'warning',text:`${muCust(f.customerId)?.name||'Customer'} · follow-up`,detail:f.date,id:f.customerId,type:'Customer'}));
    return actions;
  }

  window.mithraNotificationDrawer=function(){
    const a=mpProActions(), unread=a.filter((x,i)=>!data.mithraPro.notificationsRead[i]).length;
    openModal('Notification Center',`
      <div class="mp-pro-notify-head"><span><b>${unread}</b> unread</span><button class="btn" onclick="mithraMarkNotificationsRead()">Mark all read</button></div>
      <div class="mp-pro-notify-list">${a.map((x,i)=>`<button class="mp-pro-notify-item ${x.level}" onclick="mithraOpenNotification(${i})"><span class="mp-pro-dot"></span><span><b>${mpEsc(x.text)}</b><small>${mpEsc(x.kind)} · ${mpEsc(x.detail)}</small></span></button>`).join('')||'<div class="empty">No new notifications 🎉</div>'}</div>`);
  };
  window.mithraOpenNotification=function(i){
    const a=mpProActions()[i]; if(!a)return;
    data.mithraPro.notificationsRead[i]=true; save();
    if(a.type==='Loan')return mfsLifecycleDetail(a.id);
    if(a.type==='Customer')return openCustomer(a.id);
  };
  window.mithraMarkNotificationsRead=function(){
    mpProActions().forEach((_,i)=>data.mithraPro.notificationsRead[i]=true);
    save(); mithraNotificationDrawer();
  };

  window.mithraAdvancedSearch=function(){
    openModal('Advanced Search',`
      <div class="mp-search-box"><input id="mpProSearch" autofocus placeholder="Customer, mobile, loan ID, receipt ID..." oninput="mithraRunAdvancedSearch(this.value)"></div>
      <div id="mpProResults" class="mp-pro-results"><div class="empty">Start typing to search existing records.</div></div>`);
  };
  window.mithraRunAdvancedSearch=function(q){
    q=String(q||'').trim().toLowerCase();
    data.mithraPro.lastSearch=q; save();
    const box=document.getElementById('mpProResults'); if(!box)return;
    if(!q){box.innerHTML='<div class="empty">Start typing to search existing records.</div>';return;}
    const out=[];
    data.customers.forEach(c=>{if(`${c.name} ${c.mobile} ${c.id}`.toLowerCase().includes(q))out.push({type:'Customer',id:c.id,title:c.name||c.id,sub:c.mobile||''})});
    data.loans.forEach(l=>{if(`${l.id} ${l.customerId}`.toLowerCase().includes(q))out.push({type:'Loan',id:l.id,title:l.id,sub:soCust(l.customerId)?.name||''})});
    data.payments.forEach(p=>{if(`${p.id} ${p.loanId} ${p.ref||p.reference||''}`.toLowerCase().includes(q))out.push({type:'Payment',id:p.id,title:p.id,sub:p.loanId||''})});
    box.innerHTML=out.slice(0,25).map(x=>`<button class="mp-pro-result" onclick="mithraProOpen('${x.type}','${x.id}')"><span class="mp-pro-result-type">${mpEsc(x.type)}</span><b>${mpEsc(x.title)}</b><small>${mpEsc(x.sub)}</small></button>`).join('')||'<div class="empty">No matching records.</div>';
  };
  window.mithraProOpen=function(type,id){
    if(type==='Customer')return openCustomer(id);
    if(type==='Loan')return mfsLifecycleDetail(id);
    if(type==='Payment')return mithraPaymentResult(id);
  };

  window.mithraExecutiveSnapshot=function(){
    const a=mpProActions(), col=muCollection(muDaysAgo(30),today);
    const outstanding=data.loans.reduce((s,l)=>s+Number(l.balance||0),0);
    const overdue=data.loans.filter(l=>Number(l.balance)>0&&l.due&&l.due<today).reduce((s,l)=>s+Number(l.balance||0),0);
    openModal('Executive Snapshot',`
      <div class="mp-kpi-grid">
        <div class="mp-kpi"><small>30-Day Collection</small><strong>${muMoney(col)}</strong><span>Recent actual payments</span></div>
        <div class="mp-kpi"><small>Outstanding</small><strong>${muMoney(outstanding)}</strong><span>Current loan balances</span></div>
        <div class="mp-kpi"><small>Overdue</small><strong>${muMoney(overdue)}</strong><span>Accounts requiring attention</span></div>
        <div class="mp-kpi"><small>Actions</small><strong>${a.length}</strong><span>Open operational items</span></div>
      </div>
      <div class="mp-mini-note">Snapshot uses existing system data only and does not change transactions.</div>`);
  };

  function mpProInstall(){
    const top=document.querySelector('.top-actions');
    if(top&&!top.querySelector('[data-mithra-pro-tools]')){
      const wrap=document.createElement('div');wrap.dataset.mithraProTools='1';wrap.className='mp-pro-tools';
      wrap.innerHTML=`<button class="icon-btn" title="Notifications" onclick="mithraNotificationDrawer()">🔔</button><button class="icon-btn" title="Advanced Search" onclick="mithraAdvancedSearch()">⌕</button><button class="icon-btn" title="Executive Snapshot" onclick="mithraExecutiveSnapshot()">◈</button>`;
      top.insertBefore(wrap,top.firstChild);
    }
    document.querySelectorAll('table').forEach(t=>{if(!t.dataset.mithraSticky){t.dataset.mithraSticky='1';t.classList.add('mp-smart-table')}});
  }
  setTimeout(mpProInstall,500); setInterval(()=>{try{mpProInstall()}catch(e){}},5000);
  save();


  /* ============================================================
     MITHRA CONTEXT ACTIONS
     Additive-only contextual buttons. Existing actions preserved.
     ============================================================ */
  window.mithraCopy=function(text){
    navigator.clipboard?.writeText(String(text)).then(()=>toast('Copied')).catch(()=>toast('Copy unavailable'));
  };
  window.mithraResetFilters=function(){
    document.querySelectorAll('input[type="search"],input[placeholder*="Search"],select').forEach(el=>{
      if(el.dataset.mithraKeep) return;
      if(el.tagName==='SELECT') el.selectedIndex=0; else el.value='';
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    toast('Filters reset');
  };
  window.mithraPrintCurrent=function(){window.print();};

  window.mithraCustomerActions=function(id){
    const c=soCust(id); if(!c)return;
    mpPushRecent('Customer',id,c.name||id);
    openModal('Customer Actions',`
      <div class="mp-action-grid">
        <button class="mp-action-btn" onclick="openCustomer('${id}')"><b>👤 View Customer</b><small>Open profile</small></button>
        <button class="mp-action-btn" onclick="mfsLifecycleDetail('${(data.loans.find(l=>l.customerId===id)||{}).id||''}');"><b>💳 View Loan</b><small>Open linked loan</small></button>
        <button class="mp-action-btn" onclick="mithraRecentPinned();"><b>★ Quick Access</b><small>Pinned & recent</small></button>
        <button class="mp-action-btn" onclick="mithraPin('Customer','${id}','${mpEsc(c.name||id)}')"><b>📌 Pin</b><small>Keep for quick access</small></button>
        <button class="mp-action-btn" onclick="mithraCopy('${mpEsc(id)}')"><b>⧉ Copy ID</b><small>Copy customer ID</small></button>
      </div>`);
  };

  window.mithraLoanActions=function(id){
    const l=soLoan(id); if(!l)return;
    mpPushRecent('Loan',id,id);
    openModal('Loan Actions',`
      <div class="mp-action-grid">
        <button class="mp-action-btn" onclick="mfsLifecycleDetail('${id}')"><b>💳 View Loan</b><small>Open loan details</small></button>
        <button class="mp-action-btn" onclick="mithraBalanceExplain('${id}')"><b>🧮 Balance Breakdown</b><small>Explain current balance</small></button>
        <button class="mp-action-btn" onclick="mithraPaymentPattern('${id}')"><b>📈 Payment Pattern</b><small>Review payment behaviour</small></button>
        <button class="mp-action-btn" onclick="mithraCopy('${mpEsc(id)}')"><b>⧉ Copy Loan ID</b><small>Copy identifier</small></button>
        <button class="mp-action-btn" onclick="mithraPrintCurrent()"><b>🖨️ Print</b><small>Print current view</small></button>
      </div>`);
  };

  window.mithraDueActions=function(id){
    const l=soLoan(id); if(!l)return;
    openModal('Due Actions',`
      <div class="mp-action-grid">
        <button class="mp-action-btn primary" onclick="mfsLifecycleDetail('${id}')"><b>💰 Collect</b><small>Open loan for collection</small></button>
        <button class="mp-action-btn" onclick="mithraCustomerActions('${l.customerId}')"><b>📞 Follow-up</b><small>Open customer actions</small></button>
        <button class="mp-action-btn" onclick="mithraCopy('${mpEsc(id)}')"><b>⧉ Copy Loan ID</b><small>Copy identifier</small></button>
        <button class="mp-action-btn" onclick="mithraBalanceExplain('${id}')"><b>🧮 Balance</b><small>See calculation</small></button>
      </div>`);
  };

  function mithraInjectContextButtons(){
    // Add one compact "More" button to existing table rows where a record ID is detectable.
    document.querySelectorAll('table tbody tr').forEach(row=>{
      if(row.dataset.mithraContext) return;
      const text=(row.textContent||'').trim();
      const loanMatch=text.match(/\b(LN[-_A-Z0-9]+)\b/i);
      const custMatch=text.match(/\b(CUS[-_A-Z0-9]+)\b/i);
      const payMatch=text.match(/\b(RCT[-_A-Z0-9]+|PAY[-_A-Z0-9]+)\b/i);
      const id=loanMatch?.[1]||custMatch?.[1]||payMatch?.[1];
      if(!id)return;
      row.dataset.mithraContext='1';
      const cell=document.createElement('td');
      cell.className='mp-context-cell';
      const b=document.createElement('button');
      b.className='icon-btn mp-more-btn'; b.title='More actions'; b.textContent='⋮';
      if(loanMatch)b.onclick=()=>mithraLoanActions(id);
      else if(custMatch)b.onclick=()=>mithraCustomerActions(id);
      else b.onclick=()=>mithraPaymentResult(id);
      cell.appendChild(b); row.appendChild(cell);
    });
  }
  setTimeout(mithraInjectContextButtons,900);
  setInterval(()=>{try{mithraInjectContextButtons()}catch(e){}},5000);
  save();


  /* ============================================================
     MITHRA CONTROL & CONVENIENCE
     Additive-only: saved views, timeline, task board, summary
     drawer, table preferences, alert snooze, mobile action bar.
     ============================================================ */
  data.mithraControl=data.mithraControl||{
    savedViews:[], tasks:[], snoozed:{}, tableDensity:'comfortable',
    visibleColumns:{}, mobileBar:true
  };
  data.mithraControl.savedViews=Array.isArray(data.mithraControl.savedViews)?data.mithraControl.savedViews:[];
  data.mithraControl.tasks=Array.isArray(data.mithraControl.tasks)?data.mithraControl.tasks:[];
  data.mithraControl.snoozed=data.mithraControl.snoozed||{};
  save();

  window.mithraSavedViews=function(){
    openModal('Saved Views',`
      <div class="mc-toolbar"><button class="btn" onclick="mithraSaveCurrentView()">＋ Save Current View</button><button class="btn" onclick="mithraResetFilters()">Reset Filters</button></div>
      <div class="mc-list">${data.mithraControl.savedViews.map((v,i)=>`
        <div class="mc-list-row"><div><b>${mpEsc(v.name)}</b><small>${mpEsc(v.query||'All filters')}</small></div>
        <div class="mc-row-actions"><button class="icon-btn" onclick="mithraApplyView(${i})">Open</button><button class="icon-btn" onclick="mithraDeleteView(${i})">×</button></div></div>
      `).join('')||'<div class="empty">No saved views yet.</div>'}</div>`);
  };
  window.mithraSaveCurrentView=function(){
    const name=prompt('Name this view');
    if(!name)return;
    const query=[...document.querySelectorAll('input[type="search"],input[placeholder*="Search"]')].map(x=>x.value).find(Boolean)||'';
    const filters=[...document.querySelectorAll('select')].map(x=>x.value).filter(Boolean);
    data.mithraControl.savedViews.unshift({name,query,filters,at:profNow()});
    data.mithraControl.savedViews=data.mithraControl.savedViews.slice(0,20);save();
    toast('View saved');mithraSavedViews();
  };
  window.mithraApplyView=function(i){
    const v=data.mithraControl.savedViews[i];if(!v)return;
    const search=[...document.querySelectorAll('input[type="search"],input[placeholder*="Search"]')].find(x=>x.offsetParent!==null);
    if(search&&v.query){search.value=v.query;search.dispatchEvent(new Event('input',{bubbles:true}));}
    [...document.querySelectorAll('select')].forEach((s,j)=>{if(v.filters?.[j]!==undefined){s.value=v.filters[j];s.dispatchEvent(new Event('change',{bubbles:true));}});
    toast('View applied');closeModal();
  };
  window.mithraDeleteView=function(i){data.mithraControl.savedViews.splice(i,1);save();mithraSavedViews();};

  window.mithraTimeline=function(type,id){
    const events=[];
    const c=type==='Customer'?soCust(id):null;
    if(c)events.push({date:c.createdAt||c.created||today,title:'Customer created',detail:c.name||id});
    data.loans.filter(l=>type==='Customer'?l.customerId===id:l.id===id).forEach(l=>{
      events.push({date:l.start||l.createdAt||today,title:'Loan opened',detail:`${l.id} · ${muMoney(l.amount||l.principal||0)}`});
      soPayments(l.id).forEach(p=>events.push({date:p.date||today,title:'Payment recorded',detail:`${p.id} · ${muMoney(p.amount)}`}));
    });
    (data.followups||[]).filter(f=>type==='Customer'?f.customerId===id:f.loanId===id).forEach(f=>events.push({date:f.date||today,title:'Follow-up',detail:f.note||f.status||'Follow-up'}));
    events.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    openModal(`${type} Timeline`,`<div class="mc-timeline">${events.slice(0,60).map(e=>`<div class="mc-timeline-item"><div class="mc-timeline-dot"></div><div><b>${mpEsc(e.title)}</b><small>${mpEsc(e.date)} · ${mpEsc(e.detail)}</small></div></div>`).join('')||'<div class="empty">No activity available.</div>'}</div>`);
  };

  window.mithraSummaryDrawer=function(type,id){
    const c=type==='Customer'?soCust(id):null,l=type==='Loan'?soLoan(id):(c?data.loans.find(x=>x.customerId===id):null);
    if(!c&&!l)return;
    const cust=c||soCust(l.customerId), loans=c?data.loans.filter(x=>x.customerId===id):[l];
    const outstanding=loans.reduce((s,x)=>s+Number(x.balance||0),0);
    openModal('Record Summary',`
      <div class="mc-summary-head"><div><small>${mpEsc(type)}</small><h3>${mpEsc(cust?.name||l?.id||id)}</h3></div><span class="mp-status">${l?.status||'CUSTOMER'}</span></div>
      <div class="mc-summary-grid">
        <div><small>Mobile</small><b>${mpEsc(cust?.mobile||'-')}</b></div>
        <div><small>Loans</small><b>${loans.length}</b></div>
        <div><small>Outstanding</small><b>${muMoney(outstanding)}</b></div>
        <div><small>Last Payment</small><b>${mpEsc((data.payments.filter(p=>loans.some(x=>x.id===p.loanId)).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||{}).date||'-')}</b></div>
      </div>
      <div class="mc-toolbar"><button class="btn" onclick="mithraTimeline('${c?'Customer':'Loan'}','${mpEsc(c?cust.id:l.id)}')">Timeline</button><button class="btn" onclick="mithraPrintCurrent()">Print</button></div>`);
  };

  window.mithraTaskBoard=function(){
    const t=data.mithraControl.tasks;
    openModal('Task Board',`
      <div class="mc-toolbar"><button class="btn" onclick="mithraAddTask()">＋ Add Task</button></div>
      <div class="mc-task-grid">${['To Do','In Progress','Done'].map(status=>`
        <section class="mc-task-col"><h4>${status}</h4>${t.filter(x=>x.status===status).map(x=>`<div class="mc-task"><b>${mpEsc(x.title)}</b><small>${mpEsc(x.priority||'Normal')} · ${mpEsc(x.due||'')}</small><div><button class="icon-btn" onclick="mithraCycleTask('${x.id}')">Move</button><button class="icon-btn" onclick="mithraDeleteTask('${x.id}')">×</button></div></div>`).join('')||'<div class="empty">Empty</div>'}</section>`).join('')}</div>`);
  };
  window.mithraAddTask=function(){
    const title=prompt('Task title');if(!title)return;
    data.mithraControl.tasks.push({id:'TSK-'+Date.now(),title,status:'To Do',priority:'Normal',due:today});
    save();toast('Task added');mithraTaskBoard();
  };
  window.mithraCycleTask=function(id){
    const x=data.mithraControl.tasks.find(t=>t.id===id);if(!x)return;
    x.status=x.status==='To Do'?'In Progress':x.status==='In Progress'?'Done':'To Do';save();mithraTaskBoard();
  };
  window.mithraDeleteTask=function(id){data.mithraControl.tasks=data.mithraControl.tasks.filter(t=>t.id!==id);save();mithraTaskBoard();};

  window.mithraTablePreferences=function(){
    const cur=data.mithraControl.tableDensity||'comfortable';
    openModal('Table Preferences',`
      <div class="mc-pref-row"><b>Density</b><div><button class="btn" onclick="mithraSetDensity('compact')">Compact</button><button class="btn" onclick="mithraSetDensity('comfortable')">Comfortable</button></div></div>
      <div class="mc-pref-row"><b>Sticky headers</b><span class="mp-status">ON</span></div>
      <div class="mc-pref-row"><b>Saved density</b><span>${mpEsc(cur)}</span></div>`);
  };
  window.mithraSetDensity=function(v){
    data.mithraControl.tableDensity=v;save();
    document.documentElement.classList.toggle('mc-compact',v==='compact');
    toast(`Table density: ${v}`);mithraTablePreferences();
  };

  window.mithraSnooze=function(key,mins){
    data.mithraControl.snoozed[key]=Date.now()+mins*60000;save();toast('Notification snoozed');closeModal();
  };

  function mcInstall(){
    const top=document.querySelector('.top-actions');
    if(top&&!top.querySelector('[data-mithra-control]')){
      const w=document.createElement('div');w.dataset.mithraControl='1';w.className='mc-tools';
      w.innerHTML=`<button class="icon-btn" title="Saved Views" onclick="mithraSavedViews()">▣</button><button class="icon-btn" title="Task Board" onclick="mithraTaskBoard()">✓</button><button class="icon-btn" title="Table Preferences" onclick="mithraTablePreferences()">☷</button>`;
      top.insertBefore(w,top.firstChild);
    }
    if(data.mithraControl.mobileBar!==false && !document.querySelector('[data-mithra-mobilebar]')){
      const bar=document.createElement('div');bar.dataset.mithraMobilebar='1';bar.className='mc-mobile-bar';
      bar.innerHTML=`<button onclick="mithraAdvancedSearch()">⌕<small>Search</small></button><button onclick="mithraNotificationDrawer()">🔔<small>Alerts</small></button><button onclick="mithraSavedViews()">▣<small>Views</small></button><button onclick="mithraTaskBoard()">✓<small>Tasks</small></button>`;
      document.body.appendChild(bar);
    }
  }
  setTimeout(mcInstall,700);setInterval(()=>{try{mcInstall()}catch(e){}},5000);
  save();

})();
