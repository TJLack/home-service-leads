const landing = document.getElementById('landing');
const scanState = document.getElementById('scan-state');
const lockedPreview = document.getElementById('locked-preview');
const fullReport = document.getElementById('full-report');
const scanForm = document.getElementById('scan-form');

let currentReportId = null;

scanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url').value.trim();
  if (!url) return;

  lockedPreview.classList.add('hidden');
  fullReport.classList.add('hidden');
  scanState.classList.remove('hidden');
  scanState.innerHTML = `<h2>Scanning your site...</h2><div id='loading-list'></div>`;

  const steps = [
    'Capturing website visuals...',
    'Crawling key pages...',
    'Analyzing design quality...',
    'Checking SEO structure...',
    'Detecting conversion issues...',
    'Evaluating AI search readiness...',
    'Estimating missed revenue...'
  ];

  const list = document.getElementById('loading-list');
  steps.forEach((step, idx) => {
    const row = document.createElement('div');
    row.className = 'loading-item';
    row.textContent = step;
    list.appendChild(row);
    setTimeout(() => row.classList.add('active'), idx * 350);
  });

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Scan failed');

    currentReportId = data.reportId;
    renderLockedPreview(data.lockedPreview);
  } catch (err) {
    scanState.innerHTML = `<p>${err.message}</p>`;
  }
});

function renderLockedPreview(preview) {
  scanState.classList.add('hidden');
  lockedPreview.classList.remove('hidden');
  lockedPreview.innerHTML = `
    <h2>We found ${preview.issuesFound} issues affecting your site</h2>
    <p>Your website score is below where it should be. Your site may be missing meaningful revenue every month.</p>
    <div class='grid preview-blur'>
      <div class='metric'><strong>Overall Score</strong><div>${preview.overall}/100</div></div>
      <div class='metric'><strong>AI Readiness</strong><div>${preview.aiReadiness}/100</div></div>
      <div class='metric'><strong>Estimated Missed Monthly Revenue</strong><div>$${preview.monthlyLow.toLocaleString()}–$${preview.monthlyHigh.toLocaleString()}</div></div>
    </div>
    <h3>Unlock your full report</h3>
    <form id='lead-form' class='scan-form'>
      <input required name='name' placeholder='Name' />
      <input required name='email' placeholder='Email' type='email' />
      <input required name='phone' placeholder='Phone' />
      <input required name='businessName' placeholder='Business Name' />
      <input required name='city' placeholder='City' />
      <input name='monthlyMarketingBudget' placeholder='Monthly Marketing Budget (Optional)' />
      <button type='submit'>Unlock My Full Report</button>
    </form>
  `;

  document.getElementById('lead-form').addEventListener('submit', submitLeadForm);
}

async function submitLeadForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const lead = Object.fromEntries(formData.entries());

  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId: currentReportId, lead })
  });
  const data = await response.json();
  if (!response.ok) {
    alert(data.error || 'Unable to unlock report.');
    return;
  }
  await loadFullReport();
}

async function loadFullReport() {
  const response = await fetch(`/api/report/${currentReportId}`);
  const report = await response.json();
  lockedPreview.classList.add('hidden');
  fullReport.classList.remove('hidden');

  fullReport.innerHTML = `
    <h2>Overall Score: ${report.scores.overall}/100</h2>
    <p><strong>You may be missing $${report.revenueOpportunity.lowMonthly.toLocaleString()}–$${report.revenueOpportunity.highMonthly.toLocaleString()} per month.</strong></p>
    <p>That could equal $${report.revenueOpportunity.lowAnnual.toLocaleString()}–$${report.revenueOpportunity.highAnnual.toLocaleString()} per year.</p>
    <small>Confidence: ${report.revenueOpportunity.confidence}. ${report.revenueOpportunity.narrative}</small>

    <h3>Top Issues</h3>
    ${report.topIssues.map(issue => `<div class='issue'><strong>${issue.title}</strong><p>${issue.explanation}</p><small>${issue.impact}</small></div>`).join('')}

    <div class='grid'>
      <div class='metric'><strong>Design Score</strong><div>${report.scores.design}</div></div>
      <div class='metric'><strong>SEO Score</strong><div>${report.scores.seo}</div></div>
      <div class='metric'><strong>Conversion Score</strong><div>${report.scores.conversion}</div></div>
      <div class='metric'><strong>AI Search Readiness Score</strong><div>${report.scores.aiReadiness}</div></div>
    </div>

    <h3>AI Search Readiness Breakdown</h3>
    <div class='grid'>
      <div class='metric'>Content Clarity: ${report.subScores.aiReadiness.contentClarity}/25</div>
      <div class='metric'>Service + Location Structure: ${report.subScores.aiReadiness.serviceLocationStructure}/25</div>
      <div class='metric'>Trust + Authority: ${report.subScores.aiReadiness.trustAuthority}/20</div>
      <div class='metric'>AI-Friendly Answers: ${report.subScores.aiReadiness.aiFriendlyAnswers}/20</div>
      <div class='metric'>Technical Structure: ${report.subScores.aiReadiness.technicalStructure}/10</div>
    </div>

    <h3>Estimated Average Job Value</h3>
    <div class='scan-form'>
      ${[250,500,1000,2500,5000,10000].map(v => `<button class='job-btn' data-value='${v}' type='button'>$${v.toLocaleString()}</button>`).join('')}
      <input id='custom-job-value' type='number' min='100' step='50' placeholder='Custom' />
    </div>

    ${(report.screenshots.mobileHomepage || report.screenshots.homepage) ? `<img class='report-shot' src='${report.screenshots.mobileHomepage || report.screenshots.homepage}' alt='Website preview' />` : ''}

    <h3>Recommended Fixes</h3>
    <ul>${report.recommendations.map(rec => `<li><strong>${rec.title}:</strong> ${rec.description}</li>`).join('')}</ul>

    <p><strong>Automation Opportunity:</strong> ${report.automationOpportunity}</p>

    <div class='cta'>
      <h3>Let Us Fix This For You</h3>
      <p>We build AI-powered, SEO-optimized websites for Texas home service businesses that want more leads, more trust, and more booked jobs.</p>
      <a href='https://api.leadconnectorhq.com/widget/bookings/digital-marketing-consultation-apykl' target='_blank' rel='noreferrer'><button>Book My Free Strategy Call</button></a>
      <p>No pressure. Just clear next steps.</p>
    </div>
  `;

  const updateDisplay = (value) => {
    const monthlyLow = Math.round(report.revenueOpportunity.estimatedTrafficLow * (report.revenueOpportunity.projectedConversionLow - report.revenueOpportunity.currentConversionHigh) * value);
    const monthlyHigh = Math.round(report.revenueOpportunity.estimatedTrafficHigh * (report.revenueOpportunity.projectedConversionHigh - report.revenueOpportunity.currentConversionLow) * value);
    fullReport.querySelector('p strong').textContent = `You may be missing $${monthlyLow.toLocaleString()}–$${monthlyHigh.toLocaleString()} per month.`;
    fullReport.querySelectorAll('p')[1].textContent = `That could equal $${(monthlyLow*12).toLocaleString()}–$${(monthlyHigh*12).toLocaleString()} per year.`;
  };

  fullReport.querySelectorAll('.job-btn').forEach((btn) => {
    btn.addEventListener('click', () => updateDisplay(Number(btn.dataset.value)));
  });
  fullReport.querySelector('#custom-job-value').addEventListener('input', (e) => {
    const val = Number(e.target.value);
    if (val >= 100) updateDisplay(val);
  });
}
