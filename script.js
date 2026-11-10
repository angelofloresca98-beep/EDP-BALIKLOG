const KEY = "baliklog.records";
let records = [];
let editId = null;
const $ = id => document.getElementById(id);

function today(){ const d = new Date(); d.setHours(0,0,0,0); return d; }
function iso(d){ const z = n => String(n).padStart(2,"0"); return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); }
function shift(days){ const d = today(); d.setDate(d.getDate()+days); return iso(d); }

function load(){
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { records = JSON.parse(raw); return; }
  } catch (e) { /* storage unavailable */ }
  records = [
    {id:1,item:"Scientific calculator",person:"Marco",dir:"lent",borrowed:shift(-10),due:shift(-3),returned:false},
    {id:2,item:"Umbrella",person:"Ana",dir:"lent",borrowed:shift(-2),due:shift(3),returned:false},
    {id:3,item:"Extension cord",person:"Kuya Ben",dir:"lent",borrowed:shift(-14),due:shift(-7),returned:true},
    {id:4,item:"Engineering textbook",person:"Liza",dir:"borrowed",borrowed:shift(-5),due:shift(2),returned:false}
  ];
  save();
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(records)); } catch (e) { /* ignore */ } }

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

function render(){
  const counts = {ret:0,late:0,not:0};
  records.forEach(r => counts[status(r)]++);
  $("sTotal").textContent = records.length;
  $("sRet").textContent = counts.ret;
  $("sLate").textContent = counts.late;
<<<<<<< HEAD
  $("sNot").textContent = counts.not;
=======
  $("sNot").textContent = counts.not + counts.late;
>>>>>>> origin/main

  const q = $("q").value.trim().toLowerCase();
  const fs = $("fStatus").value, fd = $("fDir").value;
  const list = records.filter(r => {
    const st = status(r);
<<<<<<< HEAD
    const okStatus = fs === "all" || st === fs;
    const okDir = fd === "all" || r.dir === fd;
    const okQ = !q || r.item.toLowerCase().includes(q) || r.person.toLowerCase().includes(q);
    return okStatus && okDir && okQ;
  }).sort((a,b) => $("sortOrder").value === "latest" ? b.due.localeCompare(a.due) : a.due.localeCompare(b.due));

  if (!list.length) {
    $("rows").innerHTML = '<tr><td colspan="7" class="empty">' + (records.length ? "No records match your search or filter." : "No records yet. Add your first lent or borrowed item above.") + "</td></tr>";
=======
    const okStatus = fs === "all" || (fs === "not" ? st !== "ret" : st === fs);
    const okDir = fd === "all" || r.dir === fd;
    const okQ = !q || r.item.toLowerCase().includes(q) || r.person.toLowerCase().includes(q);
    return okStatus && okDir && okQ;
  }).sort((a,b) => a.due.localeCompare(b.due));

  if (!list.length) {
    $("rows").innerHTML = '<tr><td colspan="6" class="empty">' + (records.length ? "No records match your search or filter." : "No records yet. Add your first lent or borrowed item above.") + "</td></tr>";
>>>>>>> origin/main
    return;
  }
  $("rows").innerHTML = list.map(r => {
    const st = status(r);
    const badge = st === "ret" ? '<span class="badge b-ok">Returned</span>' : st === "late" ? '<span class="badge b-late">Overdue</span>' : '<span class="badge b-wait">Not yet returned</span>';
    return '<tr class="' + (st === "late" ? "row-late" : "") + '">' +
<<<<<<< HEAD
      '<td data-label="Item"><div class="item">' + esc(r.item) + '</div>' + (r.notes ? '<div class="dir">' + esc(r.notes) + '</div>' : '') + '</td>' +
      '<td data-label="Person">' + esc(r.person) + '</td><td data-label="Type">' + (r.dir === "lent" ? "Lent" : "Borrowed") + '</td>' +
      '<td data-label="Borrowed">' + fmt(r.borrowed) + '</td><td data-label="Expected return">' + fmt(r.due) + '</td><td data-label="Status">' + badge + '</td>' +
=======
      '<td><div class="item">' + esc(r.item) + '</div><div class="dir">' + (r.dir === "lent" ? "You lent this" : "You borrowed this") + '</div></td>' +
      '<td>' + esc(r.person) + '</td><td>' + fmt(r.borrowed) + '</td><td>' + fmt(r.due) + '</td><td>' + badge + '</td>' +
>>>>>>> origin/main
      '<td><div class="acts">' +
      '<button data-a="toggle" data-id="' + r.id + '">' + (r.returned ? "Mark not returned" : "Mark returned") + '</button>' +
      '<button data-a="edit" data-id="' + r.id + '">Edit</button>' +
      '<button class="danger" data-a="del" data-id="' + r.id + '">Delete</button>' +
      '</div></td></tr>';
  }).join("");
}

function resetForm(){
  editId = null;
  $("f").reset();
  $("dBorrow").value = iso(today());
<<<<<<< HEAD
  $("formTitle").textContent = "Add new record";
  $("saveBtn").textContent = "Save record";
  $("f").elements.returnStatus.value = "not";
=======
  $("formTitle").textContent = "Add a record";
  $("saveBtn").textContent = "Add record";
  $("cancelBtn").hidden = true;
>>>>>>> origin/main
  $("err").textContent = "";
}

$("f").addEventListener("submit", e => {
  e.preventDefault();
  const item = $("item").value.trim(), person = $("person").value.trim();
  const borrowed = $("dBorrow").value, due = $("dReturn").value;
<<<<<<< HEAD
  const returned = $("f").elements.returnStatus.value === "ret";
  const notes = $("notes").value.trim();
=======
>>>>>>> origin/main
  if (!item || !person || !borrowed || !due) { $("err").textContent = "Fill in the item, the person’s name, and both dates."; return; }
  if (due < borrowed) { $("err").textContent = "The expected return date can’t be before the borrowed date."; return; }
  if (editId) {
    const r = records.find(x => x.id === editId);
<<<<<<< HEAD
    Object.assign(r, {item, person, dir:$("dir").value, borrowed, due, returned, notes});
  } else {
    records.push({id:Date.now(), item, person, dir:$("dir").value, borrowed, due, returned, notes});
  }
  save(); resetForm(); render(); showDashboard();
});
$("clearBtn").addEventListener("click", resetForm);
$("cancelBtn").addEventListener("click", () => { resetForm(); showDashboard(); });
$("closeFormBtn").addEventListener("click", () => { resetForm(); showDashboard(); });

function showDashboard(){
  $("recordScreen").hidden = true;
  $("dashboardScreen").hidden = false;
  window.scrollTo({top:0, behavior:"smooth"});
}
function showRecordForm(){
  $("dashboardScreen").hidden = true;
  $("recordScreen").hidden = false;
  window.scrollTo({top:0, behavior:"smooth"});
  $("item").focus();
}
$("addBtn").addEventListener("click", () => { resetForm(); showRecordForm(); });
$("headerAddBtn").addEventListener("click", () => { resetForm(); showRecordForm(); });
$("viewRecordsBtn").addEventListener("click", () => $("recordsPanel").scrollIntoView({behavior:"smooth"}));
=======
    Object.assign(r, {item, person, dir:$("dir").value, borrowed, due});
  } else {
    records.push({id:Date.now(), item, person, dir:$("dir").value, borrowed, due, returned:false});
  }
  save(); resetForm(); render();
});
$("cancelBtn").addEventListener("click", resetForm);
>>>>>>> origin/main

$("rows").addEventListener("click", e => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const id = Number(b.dataset.id), r = records.find(x => x.id === id);
  if (b.dataset.a === "toggle") { r.returned = !r.returned; save(); render(); }
  if (b.dataset.a === "del") {
    if (confirm("Delete the record for “" + r.item + "”?")) { records = records.filter(x => x.id !== id); save(); if (editId === id) resetForm(); render(); }
  }
  if (b.dataset.a === "edit") {
    editId = id;
    $("item").value = r.item; $("person").value = r.person; $("dir").value = r.dir;
    $("dBorrow").value = r.borrowed; $("dReturn").value = r.due;
<<<<<<< HEAD
    $("notes").value = r.notes || "";
    $("f").elements.returnStatus.value = r.returned ? "ret" : "not";
    $("formTitle").textContent = "Edit record";
    $("saveBtn").textContent = "Save changes";
    showRecordForm();
  }
});

["q","fStatus","fDir","sortOrder"].forEach(id => $(id).addEventListener("input", render));
=======
    $("formTitle").textContent = "Edit record";
    $("saveBtn").textContent = "Save changes";
    $("cancelBtn").hidden = false;
    $("item").focus();
    window.scrollTo({top:0, behavior:"smooth"});
  }
});

["q","fStatus","fDir"].forEach(id => $(id).addEventListener("input", render));
>>>>>>> origin/main

load(); resetForm(); render();
