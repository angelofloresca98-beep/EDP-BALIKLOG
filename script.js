// Browser-side app controller: loads records, updates the dashboard, and handles user actions.
// Optional starter data can be supplied as window.BALIKLOG_SEED_DATA before this script loads.
const KEY = "baliklog.records";
const APP_CONFIG = {
  seedRecords: window.BALIKLOG_SEED_DATA || []
};
let records = [];
let editId = null;
const $ = id => document.getElementById(id);

// Date helpers use local calendar dates to avoid shifting a date across time zones.
function today(){ const d = new Date(); d.setHours(0,0,0,0); return d; }
function iso(d){ const z = n => String(n).padStart(2,"0"); return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); }

// Coerce optional starter data into the shape used by the app.
function normalizeSeedRecord(record){
  if (!record || typeof record !== "object") return null;
  return {
    id: Number(record.id) || Date.now() + Math.random(),
    item: String(record.item || "").trim(),
    person: String(record.person || "").trim(),
    dir: record.dir === "borrowed" ? "borrowed" : "lent",
    borrowed: record.borrowed || iso(today()),
    due: record.due || record.borrowed || iso(today()),
    returned: Boolean(record.returned),
    notes: record.notes || ""
  };
}

function getSeedRecords(){
  return Array.isArray(APP_CONFIG.seedRecords)
    ? APP_CONFIG.seedRecords.map(normalizeSeedRecord).filter(Boolean)
    : [];
}

// Persist records in this browser; starter data is used only when no saved data is available.
function load(){
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { records = JSON.parse(raw); return; }
  } catch (e) { /* storage unavailable */ }
  records = getSeedRecords();
  save();
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(records)); } catch (e) { /* ignore */ } }

// Display helpers used to calculate status, format dates, escape record text, and draw action icons.
function status(r){
  if (r.returned) return "ret";
  return r.due < iso(today()) ? "late" : "not";
}
function fmt(s){
  if (!s) return "—";
  const [y,m,d] = s.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"});
}
function esc(s){ return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function pencilIcon(){ return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/></svg>'; }
function trashIcon(){ return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14M10 10v6M14 10v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

// Rebuild the summary counts and visible table from current records and filter controls.
function render(){
  const counts = {ret:0,late:0,not:0};
  records.forEach(r => counts[status(r)]++);
  $("sTotal").textContent = records.length;
  $("sRet").textContent = counts.ret;
  $("sLate").textContent = counts.late;
  $("sNot").textContent = counts.not;

  const q = $("q").value.trim().toLowerCase();
  const fs = $("fStatus").value, fd = $("fDir").value;
  const list = records.filter(r => {
    const st = status(r);
    const okStatus = fs === "all" || st === fs;
    const okDir = fd === "all" || r.dir === fd;
    const okQ = !q || r.item.toLowerCase().includes(q) || r.person.toLowerCase().includes(q);
    return okStatus && okDir && okQ;
  }).sort((a,b) => $("sortOrder").value === "latest" ? b.due.localeCompare(a.due) : a.due.localeCompare(b.due));

  if (!list.length) {
    $("rows").innerHTML = '<tr><td colspan="7" class="empty">' + (records.length ? "No records match your search or filter." : "No records yet. Add your first lent or borrowed item above.") + "</td></tr>";
    return;
  }
  $("rows").innerHTML = list.map(r => {
    const st = status(r);
    const badge = st === "ret" ? '<span class="badge b-ok">Returned</span>' : st === "late" ? '<span class="badge b-late">Overdue</span>' : '<span class="badge b-wait">Not yet returned</span>';
    return '<tr class="' + (st === "late" ? "row-late" : "") + '">' +
      '<td data-label="Item"><div class="item">' + esc(r.item) + '</div>' + (r.notes ? '<div class="dir">' + esc(r.notes) + '</div>' : '') + '</td>' +
      '<td data-label="Person">' + esc(r.person) + '</td><td data-label="Type">' + (r.dir === "lent" ? "Lent" : "Borrowed") + '</td>' +
      '<td data-label="Borrowed">' + fmt(r.borrowed) + '</td><td data-label="Expected return">' + fmt(r.due) + '</td><td data-label="Status">' + badge + '</td>' +
      '<td><div class="acts">' +
      '<button data-a="toggle" data-id="' + r.id + '">' + (r.returned ? "Mark not returned" : "Mark returned") + '</button>' +
      '<button class="icon-btn" data-a="edit" data-id="' + r.id + '" aria-label="Edit record" title="Edit">' + pencilIcon() + '</button>' +
      '<button class="icon-btn danger" data-a="del" data-id="' + r.id + '" aria-label="Delete record" title="Delete">' + trashIcon() + '</button>' +
      '</div></td></tr>';
  }).join("");
}

// Reset the editor and switch between the overview and record-entry screens.
function resetForm(){
  editId = null;
  $("f").reset();
  $("dBorrow").value = iso(today());
  $("formTitle").textContent = "Add new record";
  $("saveBtn").textContent = "Save record";
  $("f").elements.returnStatus.value = "not";
  $("err").textContent = "";
}

function showDashboard(){
  $("recordScreen").hidden = true;
  $("dashboardScreen").hidden = false;
  setActiveNav("overview", "Overview");
  window.scrollTo({top:0, behavior:"smooth"});
}
function showRecordForm(){
  $("dashboardScreen").hidden = true;
  $("recordScreen").hidden = false;
  setActiveNav("add", $("formTitle").textContent);
  window.scrollTo({top:0, behavior:"smooth"});
  $("item").focus();
}
function setActiveNav(name, title){
  document.querySelectorAll(".nav-link").forEach(button => {
    const active = button.dataset.nav === name;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("pageTitle").textContent = title;
}
function showRecords(){
  $("dashboardScreen").hidden = false;
  $("recordScreen").hidden = true;
  setActiveNav("records", "All records");
  $("recordsPanel").scrollIntoView({behavior:"smooth"});
}

// Validate submitted form values, then create or update a record and refresh the overview.
$("f").addEventListener("submit", e => {
  e.preventDefault();
  const item = $("item").value.trim(), person = $("person").value.trim();
  const borrowed = $("dBorrow").value, due = $("dReturn").value;
  const returned = $("f").elements.returnStatus.value === "ret";
  const notes = $("notes").value.trim();
  if (!item || !person || !borrowed || !due) { $("err").textContent = "Fill in the item, the person’s name, and both dates."; return; }
  if (due < borrowed) { $("err").textContent = "The expected return date can’t be before the borrowed date."; return; }
  if (editId) {
    const r = records.find(x => x.id === editId);
    Object.assign(r, {item, person, dir:$("dir").value, borrowed, due, returned, notes});
  } else {
    records.push({id:Date.now(), item, person, dir:$("dir").value, borrowed, due, returned, notes});
  }
  save(); resetForm(); render(); showDashboard();
});

// Wire static buttons and sidebar navigation to the corresponding screen actions.
$("clearBtn").addEventListener("click", resetForm);
$("cancelBtn").addEventListener("click", () => { resetForm(); showDashboard(); });
$("closeFormBtn").addEventListener("click", () => { resetForm(); showDashboard(); });
$("addBtn").addEventListener("click", () => { resetForm(); showRecordForm(); });
$("headerAddBtn").addEventListener("click", () => { resetForm(); showRecordForm(); });
$("viewRecordsBtn").addEventListener("click", showRecords);
document.querySelector(".side-nav").addEventListener("click", e => {
  const button = e.target.closest("button[data-nav]");
  if (!button) return;
  if (button.dataset.nav === "overview") showDashboard();
  if (button.dataset.nav === "records") showRecords();
  if (button.dataset.nav === "add") { resetForm(); showRecordForm(); }
});

// Delegate table actions so buttons continue to work after render() replaces the table rows.
$("rows").addEventListener("click", e => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const id = Number(b.dataset.id), r = records.find(x => x.id === id);
  if (!r) return;
  if (b.dataset.a === "toggle") { r.returned = !r.returned; save(); render(); }
  if (b.dataset.a === "del") {
    if (confirm("Delete the record for “" + r.item + "”?")) { records = records.filter(x => x.id !== id); save(); if (editId === id) resetForm(); render(); }
  }
  if (b.dataset.a === "edit") {
    editId = id;
    $("item").value = r.item; $("person").value = r.person; $("dir").value = r.dir;
    $("dBorrow").value = r.borrowed; $("dReturn").value = r.due;
    $("notes").value = r.notes || "";
    $("f").elements.returnStatus.value = r.returned ? "ret" : "not";
    $("formTitle").textContent = "Edit record";
    $("saveBtn").textContent = "Save changes";
    showRecordForm();
  }
});

// Re-render immediately when search, filters, or sort order change; then initialize the app.
["q","fStatus","fDir","sortOrder"].forEach(id => $(id).addEventListener("input", render));

load(); resetForm(); render();
