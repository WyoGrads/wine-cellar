// ── Config — replace these two values ──────────────────────────────────────
const SUPABASE_URL     = 'https://REPLACE_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'REPLACE_SUPABASE_ANON_KEY';
// ───────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 100;

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── State ──────────────────────────────────────────────────────────────────
let allWines   = [];
let filtered   = [];
let sortCol    = 'score_personal';
let sortDir    = 'desc';
let activePage = 1;
let activeType = '';
let searchTerm = '';

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  const { data, error } = await db
    .from('wines')
    .select('*')
    .order('score_personal', { ascending: false, nullsFirst: false });

  if (error) {
    document.getElementById('wine-tbody').innerHTML =
      `<tr><td colspan="20" class="empty">Error loading cellar: ${error.message}</td></tr>`;
    return;
  }

  allWines = data || [];
  buildTypeFilters();
  applyFilters();
  renderStats();
  document.getElementById('last-sync').textContent =
    `${allWines.length} wines · synced ${new Date().toLocaleDateString()}`;
}

// ── Filters / sort ─────────────────────────────────────────────────────────
function applyFilters() {
  const yr = new Date().getFullYear();
  filtered = allWines.filter(w => {
    if (activeType && w.wine_type !== activeType) return false;
    if (searchTerm) {
      const hay = [w.wine_name, w.producer, w.region, w.sub_region, w.variety]
        .join(' ').toLowerCase();
      if (!hay.includes(searchTerm)) return false;
    }
    return true;
  });
  sortWines();
  activePage = 1;
  renderTable();
  renderPagination();
}

function sortWines() {
  filtered.sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

// ── Render stats ───────────────────────────────────────────────────────────
function renderStats() {
  const yr = new Date().getFullYear();
  const bottles = allWines.reduce((s, w) => s + (w.quantity || 0), 0);
  const scores  = allWines.map(w => w.score_personal).filter(s => s != null);
  const avg     = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : '—';
  const value   = allWines.reduce((s,w)=>s+((w.price_paid||0)*(w.quantity||0)),0);
  const drinking = allWines.filter(w =>
    (w.drink_window_start == null || w.drink_window_start <= yr) &&
    (w.drink_window_end   == null || w.drink_window_end   >= yr) &&
    (w.quantity || 0) > 0
  ).length;

  setText('stat-bottles',     bottles.toLocaleString());
  setText('stat-wines',       allWines.length.toLocaleString());
  setText('stat-avg-score',   avg);
  setText('stat-value',       value > 0 ? '$' + Math.round(value).toLocaleString() : '—');
  setText('stat-drinking-now', drinking.toLocaleString());
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Render type filter buttons ─────────────────────────────────────────────
function buildTypeFilters() {
  const types = [...new Set(allWines.map(w => w.wine_type).filter(Boolean))].sort();
  const wrap  = document.getElementById('type-filters');
  types.forEach(t => {
    const btn = document.createElement('button');
    btn.className    = 'filter-btn';
    btn.dataset.type = t;
    btn.textContent  = t;
    btn.addEventListener('click', () => {
      activeType = activeType === t ? '' : t;
      wrap.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.type === activeType)
      );
      applyFilters();
    });
    wrap.appendChild(btn);
  });
}

// ── Render table ───────────────────────────────────────────────────────────
function renderTable() {
  const yr   = new Date().getFullYear();
  const start = (activePage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);
  const tbody = document.getElementById('wine-tbody');

  if (!page.length) {
    tbody.innerHTML = '<tr><td colspan="20" class="empty">No wines match your search.</td></tr>';
    return;
  }

  tbody.innerHTML = page.map(w => `
    <tr>
      <td class="wine-name" title="${esc(w.wine_name)}">${esc(w.wine_name)}</td>
      <td>${w.vintage ?? ''}</td>
      <td>${esc(w.producer ?? '')}</td>
      <td>${esc(w.wine_type ?? '')}</td>
      <td>${esc(w.variety ?? '')}</td>
      <td>${esc(w.region ?? '')}</td>
      <td>${esc(w.sub_region ?? '')}</td>
      <td class="num">${scoreEl(w.score_personal)}</td>
      <td class="num">${scoreEl(w.score_community)}</td>
      <td class="num">${scoreEl(w.score_drinkability)}</td>
      <td class="num ${drinkClass(w.drink_window_start, w.drink_window_end, yr)}">${w.drink_window_start ?? ''}</td>
      <td class="num ${drinkClass(w.drink_window_start, w.drink_window_end, yr)}">${w.drink_window_end ?? ''}</td>
      <td class="num qty">${w.quantity ?? ''}</td>
      <td>${esc(w.bottle_size ?? '')}</td>
      <td>${esc(w.location ?? '')}</td>
      <td>${esc(w.bin ?? '')}</td>
      <td class="num">${w.price_paid != null ? '$' + Number(w.price_paid).toFixed(0) : ''}</td>
      <td class="num">${scoreEl(w.value_score)}</td>
      <td>${esc(w.store ?? '')}</td>
      <td>${w.purchase_date ? w.purchase_date.slice(0,10) : ''}</td>
    </tr>`).join('');

  // Update header sort indicators
  document.querySelectorAll('#wine-table th[data-col]').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.col === sortCol)
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
  });
}

function scoreEl(v) {
  if (v == null) return '';
  const cls = v >= 90 ? 'score-high' : v >= 80 ? 'score-mid' : 'score-low';
  return `<span class="score ${cls}">${v}</span>`;
}

function drinkClass(start, end, yr) {
  if (end != null && yr > end)   return 'drink-over';
  if (start != null && yr < start) return 'drink-hold';
  return 'drink-now';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Pagination ─────────────────────────────────────────────────────────────
function renderPagination() {
  const total = Math.ceil(filtered.length / PAGE_SIZE);
  const wrap  = document.getElementById('pagination');
  if (total <= 1) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = Array.from({length: total}, (_,i) => {
    const p = i + 1;
    return `<button class="page-btn${p===activePage?' active':''}" data-page="${p}">${p}</button>`;
  }).join('');
  wrap.querySelectorAll('.page-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      activePage = +btn.dataset.page;
      renderTable();
      renderPagination();
      window.scrollTo({top:0,behavior:'smooth'});
    })
  );
}

// ── Event listeners ────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', e => {
  searchTerm = e.target.value.trim().toLowerCase();
  applyFilters();
});

document.getElementById('sort-select').addEventListener('change', e => {
  const [col, dir] = e.target.value.split('|');
  sortCol = col;
  sortDir = dir;
  applyFilters();
});

document.querySelectorAll('#wine-table th[data-col]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (sortCol === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = col;
      sortDir = ['score_personal','score_community','score_drinkability',
                 'quantity','price_paid','value_score','vintage'].includes(col) ? 'desc' : 'asc';
    }
    applyFilters();
  });
});

// ── Boot ───────────────────────────────────────────────────────────────────
init();
