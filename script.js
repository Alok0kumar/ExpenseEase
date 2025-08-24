let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let showOnlyUnpaid = false; // filter toggle

// Populate people options dynamically
const peopleSelect = document.getElementById("people");
for (let i = 2; i <= 8; i++) {
  let opt = document.createElement("option");
  opt.value = i;
  opt.textContent = i;
  peopleSelect.appendChild(opt);
}

// Event Listeners
document.getElementById("addNamesBtn").addEventListener("click", createNameInputs);
document.getElementById("splitBtn").addEventListener("click", splitExpense);
document.getElementById("downloadBtn").addEventListener("click", downloadJSON);
document.getElementById("importBtn").addEventListener("click", importJSON);
document.getElementById("filterBtn").addEventListener("click", toggleFilter);

renderExpenses();

function createNameInputs() {
  const people = parseInt(document.getElementById("people").value);
  const namesContainer = document.getElementById("namesContainer");
  namesContainer.innerHTML = "";

  if (isNaN(people)) {
    alert("Please select number of people first!");
    return;
  }

  for (let i = 1; i <= people; i++) {
    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter name for Person " + i;
    input.classList.add("person-name");
    namesContainer.appendChild(input);
  }
}

function splitExpense() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const people = parseInt(document.getElementById("people").value);
  const nameInputs = document.querySelectorAll(".person-name");

  if (!desc || isNaN(amount) || isNaN(people) || nameInputs.length !== people) {
    alert("Please fill all fields and enter names!");
    return;
  }

  const names = [];
  nameInputs.forEach(input => {
    if (input.value.trim() === "") {
      alert("All names must be filled!");
      return;
    }
    names.push(input.value.trim());
  });

  const split = (amount / people).toFixed(2);
  const eachPays = [];
  for (let i = 0; i < people; i++) {
    eachPays.push({ person: names[i], pay: split, settled: false });
  }

  expenses.push({ description: desc, total: amount, people: people, split: eachPays });

  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();

  // Reset fields
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("people").value = "";
  document.getElementById("namesContainer").innerHTML = "";
}

function renderExpenses() {
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  expenses.forEach((exp, expIndex) => {
    let expDiv = document.createElement("div");
    expDiv.classList.add("expense-item");
    expDiv.innerHTML = `<h3>${exp.description}</h3>
                        <p>Total: ₹${exp.total} | People: ${exp.people}</p>`;

    exp.split.forEach((p, personIndex) => {
      if (showOnlyUnpaid && p.settled) return; // skip settled if filter is ON

      let personDiv = document.createElement("div");
      let status = p.settled ? `<span class="paid">✅ Paid</span>` : `<span class="unpaid">❌ Unpaid</span>`;
      personDiv.innerHTML = `<p>${p.person} pays: ₹${p.pay} ${status}</p>`;

      // Checkbox to toggle settle status
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = p.settled;
      checkbox.onchange = () => toggleSettle(expIndex, personIndex, checkbox.checked);

      personDiv.appendChild(checkbox);
      expDiv.appendChild(personDiv);
    });

    // Delete expense button
    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "#c94f4f";
    delBtn.style.marginTop = "5px";
    delBtn.onclick = () => deleteExpense(expIndex);
    expDiv.appendChild(delBtn);

    resultDiv.appendChild(expDiv);
    resultDiv.appendChild(document.createElement("hr"));
  });
}

function toggleSettle(expIndex, personIndex, status) {
  expenses[expIndex].split[personIndex].settled = status;
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
}

function downloadJSON() {
  if (expenses.length === 0) {
    alert("No data to save!");
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expenses, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "expenses.json");
  dlAnchor.click();
}

function importJSON() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a JSON file first!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        expenses = expenses.concat(importedData);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderExpenses();
        alert("Expenses imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch (error) {
      alert("Error reading JSON file!");
    }
  };
  reader.readAsText(file);
}

function toggleFilter() {
  showOnlyUnpaid = !showOnlyUnpaid;
  document.getElementById("filterBtn").textContent = showOnlyUnpaid ? "Show All" : "Show Only Unpaid";
  renderExpenses();
}
