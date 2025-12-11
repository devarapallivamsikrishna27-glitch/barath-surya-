const input = document.getElementById('input');
const askBtn = document.getElementById('ask');
const result = document.getElementById('result');

askBtn.addEventListener('click', askAI);
input.addEventListener('keydown', e => { if (e.key === 'Enter') askAI(); });

async function askAI() {
  const text = input.value.trim();
  if (!text) return alert('Describe the emergency briefly');
  renderLoading();

  try {
    const resp = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await resp.json();
    renderResult(data);
  } catch (err) {
    result.innerHTML = `<div class="card">Error contacting server. Try again.</div>`;
  }
}

function renderLoading() {
  result.innerHTML = `<div class="card">Thinking... please wait.</div>`;
}

function renderResult(data) {
  if (!data) return;
  const triageClass = (data.triage === 'emergency') ? 'emergency' : '';
  let html = `<div class="card ${triageClass}"><strong>Condition:</strong> ${escapeHtml(data.condition || 'unknown')}<br/><strong>Triage:</strong> ${escapeHtml(data.triage || 'unknown')}<br/><strong>Confidence:</strong> ${Math.round((data.confidence||0)*100)}%</div>`;

  if (Array.isArray(data.steps)) {
    data.steps.forEach((s, i) => {
      html += `<div class="card"><strong>Step ${i+1}:</strong> ${escapeHtml(s)}</div>`;
    });
  } else {
    html += `<div class="card">${escapeHtml(JSON.stringify(data))}</div>`;
  }

  if (data.triage === 'emergency') {
    html += `<div class="card"><a class="call-btn" href="tel:112">Call 112 Now</a></div>`;
  }

  result.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
