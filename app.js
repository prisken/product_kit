const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strengthClass = (v) => ['core','secondary','minor'].includes(v) ? v : 'minor';
const evidenceClass = (v) => ['strong','medium','weak'].includes(v) ? v : 'weak';
const chips = (arr, cls = '') => (arr || []).map((x) => `<span class="chip ${cls}">${esc(x)}</span>`).join('');
const CAT_LABEL = { health: 'Health', life: 'Life', save: 'Save', invest: 'Invest' };
const CAT_LABEL_ZH = { health: '健康', life: '人壽', save: '儲蓄', invest: '投資' };
const CAT_ORDER = ['health', 'life', 'save', 'invest'];

const T = (s) => (window.I18N ? window.I18N.t(s) : s);
const IS_ZH = () => !!(window.I18N && window.I18N.isZh());
const catLabel = (c) => (IS_ZH() ? (CAT_LABEL_ZH[c] || c) : (CAT_LABEL[c] || c));

let INDEX = [];
let DATA = null;
let CURRENT = null;

function renderSummary(d) {
  const s = d.productLevelSummary || {};
  const c = window.I18N ? window.I18N.cProduct(d) : { summary: s.bestForOneLiner, notSuited: s.notSuitedWhen || [], gaps: s.gapsInSourceMaterial || [] };
  const primary = (d.trends || []).find((t) => t.trendId === s.primaryTrend);
  const pz = primary && window.I18N ? window.I18N.cTrend(d, primary) : null;
  return `
    <section class="summary">
      <div class="card">
        <h2>${esc(T('Best for'))}</h2>
        <div class="best">${esc(c.summary)}</div>
        ${primary ? `<div class="primary-pill">${esc(T('Primary trend'))}: ${esc((pz && pz.name) || primary.trendName)}</div>` : ''}
      </div>
      <div class="card">
        <h2>${esc(T('Do not push when'))}</h2>
        <ul class="list">${(c.notSuited || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="card" style="grid-column:1/-1">
        <h2>${esc(T('Gaps in source material'))}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${chips(c.gaps, '')}</div>
      </div>
    </section>`;
}

function renderTrend(d, t, i) {
  const c = window.I18N ? window.I18N.cTrend(d, t) : { name: t.trendName, offers: t.whatProductOffers, figures: t.keyFigures || [], exclusions: t.exclusionsOrConditions || [], prompts: t.verificationPrompts || [] };
  const zsig = window.I18N && window.I18N.zhSignals ? window.I18N.zhSignals(d.productId, t.trendId) : null;
  const posPhrases = (zsig && zsig.pos) || t.clientSignalPhrases || [];
  const negPhrases = (zsig && zsig.neg) || t.negativeSignalPhrases || [];
  return `
    <article class="trend">
      <div class="trend-head">
        <div class="num">${i + 1}</div>
        <div class="th-main">
          <div class="trend-name">${esc(c.name)}</div>
          <div class="trend-cat">${esc(t.trendCategory)}${t.isNewCategory ? ' · ' + esc(T('new category')) : ''}</div>
          <div class="plan-ref">${esc(T('Plan'))}: <b>${esc(d.productName)}</b></div>
          <div class="badges">
            <span class="badge ${strengthClass(t.trendStrength)}">${esc(T(t.trendStrength))}</span>
            <span class="badge ${evidenceClass(t.evidenceStrength)}">${esc(T('evidence'))}: ${esc(T(t.evidenceStrength))}</span>
            <span class="badge minor">${esc(t.trendId)}</span>
          </div>
        </div>
      </div>
      <div class="trend-body">
        <p class="offers">${esc(c.offers)}</p>

        <div class="grid2">
          <div>
            <div class="sub">${esc(T('Key figures'))}</div>
            <table class="figs">
              ${(c.figures || []).map((f) => `<tr><td>${esc(f.label)}</td><td><b>${esc(f.value)}</b>${f.condition ? `<div class="cond">${esc(f.condition)}</div>` : ''}</td></tr>`).join('')}
            </table>
          </div>
          <div>
            <div class="sub">${esc(T('Conditions / exclusions'))}</div>
            <ul class="checks">${(c.exclusions || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="grid2" style="margin-top:18px">
          <div>
            <div class="sub">${esc(T('Client would say'))}</div>
            <div class="chips">${chips(posPhrases, 'pos')}</div>
          </div>
          <div>
            <div class="sub">${esc(T('Do not push when'))}</div>
            <div class="chips">${chips(negPhrases, 'neg')}</div>
          </div>
        </div>

        <div class="grid2" style="margin-top:18px">
          <div>
            <div class="sub">${esc(T('Profile fit'))}</div>
            <div class="chips">${chips(t.clientProfileFit, 'blue')}</div>
            <div class="sub" style="margin-top:14px">${esc(T('Priority alignment'))}</div>
            <div class="chips">${chips(t.priorityAlignment, '')}</div>
            <div class="sub" style="margin-top:14px">${esc(T('Comparison dimensions'))}</div>
            <div class="chips">${chips((t.comparisonRows || []).map((r) => (window.I18N ? window.I18N.rowLabel(r) : r)), '')}</div>
          </div>
          <div>
            <div class="sub">${esc(T('Verify before claiming'))}</div>
            <ul class="checks">${(c.prompts || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="quote">
          <span class="lab">${esc(T('Talking point'))}</span>
          ${esc(t.talkingPointTemplate)}
        </div>

        <div class="sub" style="margin-top:18px">${esc(T('Source evidence'))}</div>
        <ul class="src">${(t.sourceEvidence || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

        ${t.notesForReviewer ? `<div class="note"><b>${esc(T('Reviewer note'))}:</b> ${esc(t.notesForReviewer)}</div>` : ''}
      </div>
    </article>`;
}

function render(d) {
  DATA = d;
  const zhName = window.I18N ? window.I18N.zhProductName(d.productId) : '';
  document.title = (zhName || d.productName) + ' — ' + T('Trends Review');
  document.getElementById('pname').textContent = zhName || d.productName;
  const line = document.getElementById('planline');
  if (line) line.innerHTML = `<span class="k">${esc(T('Plan'))}</span><span>${esc(zhName || d.productName)}</span>${zhName ? `<span class="cond" style="margin-left:10px">· ${esc(d.productName)}</span>` : ''}`;
  document.getElementById('pmeta').innerHTML =
    `<b>${esc(T(d.productType))}</b> · ${esc(d.market)} · <span style="font-family:ui-monospace,Menlo,monospace">${esc(d.productId)}</span>`;
  document.getElementById('app').innerHTML = `
    ${renderSummary(d)}
    <div class="sec-title" style="margin:4px 0 10px">${esc(T('Trends'))} (${(d.trends || []).length})</div>
    <section class="trends">${(d.trends || []).map((t, i) => renderTrend(d, t, i)).join('')}</section>
    <div class="raw">
      <details>
        <summary>${esc(T('Raw JSON'))}</summary>
        <pre>${esc(JSON.stringify(d, null, 2))}</pre>
      </details>
    </div>`;
}

function renderList(filter = '') {
  const q = filter.trim().toLowerCase();
  const box = document.getElementById('plist');
  const groups = {};
  INDEX.forEach((p) => {
    if (q && !p.productName.toLowerCase().includes(q)) return;
    (groups[p.category] = groups[p.category] || []).push(p);
  });
  box.innerHTML = CAT_ORDER.filter((c) => groups[c]).map((c) => `
    <div class="pgroup">${esc(catLabel(c))} · ${groups[c].length}</div>
    ${groups[c].map((p) => `
      <button class="pitem${CURRENT && CURRENT.productId === p.productId ? ' on' : ''}" data-pid="${esc(p.productId)}" type="button">
        ${esc(window.I18N ? window.I18N.productName(p.productId, p.productName) : p.productName)}
        <span class="n">${p.trendCount} ${esc(T('trends'))} · ${esc(T(p.productType || ''))}</span>
      </button>`).join('')}
  `).join('');
  box.querySelectorAll('.pitem').forEach((b) => b.addEventListener('click', () => loadProduct(b.dataset.pid)));
}

async function loadProduct(pid) {
  const meta = INDEX.find((p) => p.productId === pid) || INDEX[0];
  if (!meta) return;
  CURRENT = meta;
  location.hash = meta.productId;
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">${esc(T('Loading product…'))}</div>`;
  try {
    const d = await fetch('data/' + meta.file, { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    render(d);
    const dl = document.getElementById('dl');
    if (dl) dl.href = 'data/' + meta.file;
    renderList(document.getElementById('q').value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    app.innerHTML = `<div class="card"><b>${esc(T('Could not load'))} ${esc(meta.productName)}</b><div class="cond">${esc(e.message)}</div></div>`;
  }
}

async function boot() {
  if (window.I18N) await window.I18N.loadZh();
  const copy = document.getElementById('copy');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(DATA, null, 2));
      copy.textContent = T('Copied');
      setTimeout(() => (copy.textContent = T('Copy JSON')), 1500);
    } catch {
      copy.textContent = T('Copy failed');
    }
  });
  document.getElementById('q').addEventListener('input', (e) => renderList(e.target.value));
  try {
    const cat = await fetch('data/catalog.json', { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    INDEX = (cat.products || []).map((p) => ({
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      productType: p.productType,
      file: p.file,
      trendCount: p.trendCount,
    }));
  } catch (e) {
    document.getElementById('app').innerHTML = `<div class="card"><b>${esc(T('Could not load data/catalog.json'))}</b><div class="cond">${esc(e.message)}</div></div>`;
    return;
  }
  document.getElementById('pcount').textContent = INDEX.length + ' ' + T('products');
  renderList();
  const hash = decodeURIComponent(location.hash.replace(/^#/, ''));
  const start = INDEX.find((p) => p.productId === hash) || INDEX[0];
  await loadProduct(start.productId);
}

window.addEventListener('langchange', () => {
  if (DATA) render(DATA);
  renderList(document.getElementById('q') ? document.getElementById('q').value : '');
});

boot();
