// Primary State (Preloaded with matching history patterns)
let logs = [
];

window.onload = function() {
  // default date input to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('logDate').value = today;
  renderDashboard();
};

function handleFormSubmit(event) {
  event.preventDefault();

  const date = document.getElementById('logDate').value;
  const timeOfDay = document.getElementById('timeOfDay').value;
  
  const joint = document.querySelector('input[name="jointSelect"]:checked').value;
  
  const painLevel = parseInt(document.getElementById('painLevel').value);
  const duration = document.getElementById('duration').value;
  const tookPainkiller = document.getElementById('tookPainkiller').checked;
  const notes = document.getElementById('notes').value.trim();

  const newEntry = {
    id: Date.now().toString(),
    date,
    timeOfDay,
    joint,
    painLevel,
    duration,
    tookPainkiller,
    notes
  };

  logs.unshift(newEntry);
  
  document.getElementById('notes').value = '';
  document.getElementById('tookPainkiller').checked = false;
  
  renderDashboard();
  updateStatus("New log entry committed to local journal.");
}

function deleteLog(id) {
  logs = logs.filter(log => log.id !== id);
  renderDashboard();
  updateStatus("Selected log entry removed.");
}

function openClearModal() {
  document.getElementById('customConfirmModal').style.display = 'flex';
}

function closeClearModal() {
  document.getElementById('customConfirmModal').style.display = 'none';
}

function confirmClearLogs() {
  logs = [];
  closeClearModal();
  renderDashboard();
  updateStatus("LOG HISTORY WIPED.");
}

// render
function renderDashboard() {
  const rowsContainer = document.getElementById('logRows');
  const noLogsState = document.getElementById('noLogsState');
  const tableElement = document.getElementById('logsTable');

  const statTotal = document.getElementById('statTotal');
  const statAvg = document.getElementById('statAvg');
  const statMeds = document.getElementById('statMeds');

  if (logs.length === 0) {
    noLogsState.style.display = "block";
    tableElement.style.display = "none";
    
    statTotal.innerText = "0";
    statAvg.innerText = "0";
    statMeds.innerText = "0%";
    return;
  }

  noLogsState.style.display = "none";
  tableElement.style.display = "table";

  // recalculate stats
  const totalCount = logs.length;
  const totalPain = logs.reduce((sum, item) => sum + item.painLevel, 0);
  const medsCount = logs.filter(item => item.tookPainkiller).length;

  statTotal.innerText = totalCount;
  statAvg.innerText = (totalPain / totalCount).toFixed(1);
  statMeds.innerText = ((medsCount / totalCount) * 100).toFixed(0) + "%";

  rowsContainer.innerHTML = '';
  logs.forEach(log => {
    const row = document.createElement('tr');
    
    const medsMarkup = log.tookPainkiller 
      ? `YES` 
      : `NO`;

    row.innerHTML = `
      <td>
        <strong>${log.date}</strong><br>
        <small>${log.timeOfDay}</small>
      </td>
      <td>${log.joint}</td>
      <td>
        ${log.painLevel}/10 (${log.duration} hrs)
      </td>
      <td>${medsMarkup}</td>
      <td>${log.notes || '-'}</td>
      <td>
        <button onclick="deleteLog('${log.id}')">[X]</button>
      </td>
    `;
    rowsContainer.appendChild(row);
  });
}

// clipboard export. if there's no data i should say no data available
function exportToClipboard() {
  if (logs.length === 0) {
    updateStatus("No data available to copy.");
    return;
  }

  let textOutput = "========================================\n";
  textOutput += "      JOINT PAIN JOURNAL EXPORT        \n";
  textOutput += "========================================\n\n";

  logs.forEach(log => {
    textOutput += `Date: ${log.date} (${log.timeOfDay})\n`;
    textOutput += `Location: ${log.joint}\n`;
    textOutput += `Intensity: ${log.painLevel}/10\n`;
    textOutput += `Duration: ${log.duration} hours\n`;
    textOutput += `Medication: ${log.tookPainkiller ? "Yes (Ibuprofen/Painkiller)" : "None"}\n`;
    if (log.notes) textOutput += `Notes: ${log.notes}\n`;
    textOutput += "----------------------------------------\n";
  });

  const el = document.createElement('textarea');
  el.value = textOutput;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);

  updateStatus("All logs copied formatted as plain text!");
}

// alert box
function updateStatus(message) {
  const bar = document.getElementById('statusBar');
  bar.style.display = 'block';
  bar.innerText = `STATUS: ${message.toUpperCase()}`;
  
  // reset after 4 secs
  setTimeout(() => {
    bar.innerText = "STATUS: READY.";
  }, 4000);
}