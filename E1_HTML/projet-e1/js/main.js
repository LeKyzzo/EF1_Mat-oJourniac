'use strict';
// Utilisation des fonctions globales définies dans utils.js et api.js

// Etat global minimal
const state = {
  users: [],
  todosByUser: new Map(), // userId -> todos[]
  filteredUsers: [],
  activeFilter: 'all'
};

// Initialisation selon la page
window.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'user') initUserDetail();
  // Filet de sécurité loader (6s max)
  setTimeout(()=>{ try { Loader.hide(); } catch(e){} }, 6000);
});

/* -------------------------- Page Accueil --------------------------- */
async function initHome() {
  Loader.show();
  try {
    state.users = await getUsers();
    await loadTodosForUsers(state.users.slice(0, 5)); // précharge quelques todos
    renderUsers(state.users);
    setupSearch();
    initReveal();
  } catch (err) {
    showUsersError(err.message);
  } finally {
    Loader.hide();
  }
}

async function loadTodosForUsers(users) {
  // Charge les todos en parallèle
  const promises = users.map(u => getUserTodos(u.id).then(t => state.todosByUser.set(u.id, t)).catch(()=>state.todosByUser.set(u.id, [])));
  await Promise.all(promises);
}

function showUsersError(msg) {
  const grid = $('#usersGrid');
  grid.innerHTML = `<div class="empty-state" role="alert">${msg}</div>`;
}

function renderUsers(list) {
  const grid = $('#usersGrid');
  if (!grid) return;
  if (!list.length) { grid.innerHTML = '<p class="empty-state">Aucun utilisateur.</p>'; return; }
  grid.innerHTML = '';
  list.forEach(user => {
    const todos = state.todosByUser.get(user.id) || [];
    const completed = todos.filter(t => t.completed).length;
    const firstTodos = todos.slice(0, 3);
    const card = createEl('article', { classes:['user-card','reveal'] });
    const projectsList = firstTodos.map(t => `<li title="${escapeHtml(t.title)}"><span aria-hidden="true">•</span> ${truncate(t.title, 34)}</li>`).join('');
    card.innerHTML = `
      <div class="user-card__header">
        <div>
          <h3 class="user-card__title">${escapeHtml(user.name)}</h3>
          <div class="user-card__company">${escapeHtml(user.company?.name || 'Entreprise')}</div>
        </div>
        <span class="badge" aria-label="${completed} tâches terminées">${completed}</span>
      </div>
      <ul class="user-card__projects" aria-label="Exemples de tâches">${projectsList || '<li>Aucune tâche chargée</li>'}</ul>
      `;
    // Lien couvrant toute la carte
    const fullLink = createEl('a', { classes:['user-card__full'], attrs:{ href:`user.html?id=${user.id}`, 'aria-label':`Voir le détail de ${escapeHtml(user.name)}` } });
    card.appendChild(fullLink);
    grid.appendChild(card);
  });
  if (typeof initReveal === 'function') {
    requestAnimationFrame(() => {
      initReveal();
      if (!('IntersectionObserver' in window)) {
        $all('.reveal', grid).forEach(el => el.classList.add('visible'));
      }
    });
  }
}

function setupSearch() {
  const input = $('#searchInput');
  const clearBtn = $('#clearSearch');
  if (!input) return;
  const handle = () => {
    const raw = input.value;
    const q = raw.trim().toLowerCase();
    if (!q) {
      clearBtn.style.display = 'none';
      renderUsers(state.users);
      return;
    }
    clearBtn.style.display = 'inline-block';
    const filtered = state.users.filter(u => u.name.toLowerCase().includes(q));
    renderUsers(filtered.length ? filtered : state.users);
  };
  input.addEventListener('input', handle);
  input.addEventListener('search', handle);
  const form = input.closest('form'); if (form) form.addEventListener('submit', e => e.preventDefault());
  clearBtn.addEventListener('click', () => { input.value=''; clearBtn.style.display='none'; renderUsers(state.users); input.focus();});
}

/* ----------------------- Page Détail Utilisateur ------------------- */
async function initUserDetail() {
  const userId = getUrlParam('id');
  if (!userId) { showUserDetailError('Identifiant utilisateur manquant'); return; }
  Loader.show();
  try {
    const [user, todos] = await Promise.all([
      getUser(userId),
      getUserTodos(userId)
    ]);
    state.users = [user];
    state.todosByUser.set(user.id, todos);
    renderUserInfo(user);
    renderTodos(todos);
    setupTodoForm(user.id);
    setupTodoFilters(user.id);
  } catch (err) {
    showUserDetailError(err.message);
  } finally { Loader.hide(); }
}

function renderUserInfo(user) {
  $('#userTitle').textContent = user.name;
  $('#breadcrumbUser').textContent = user.name;
  const info = $('#userInfo');
  if (!info) return;
  info.innerHTML = `
    <div>
      <h2 style="margin:0 0 .5rem;font-size:1.2rem;">${escapeHtml(user.name)}</h2>
      <p style="margin:0 0 .75rem;font-size:.85rem;color:var(--color-text-muted);">${escapeHtml(user.email)}</p>
      <div class="user-meta">
        <div><span>Entreprise</span>${escapeHtml(user.company?.name || 'N/A')}</div>
        <div><span>Ville</span>${escapeHtml(user.address?.city || '—')}</div>
        <div><span>Site Web</span><a href="http://${escapeHtml(user.website)}" target="_blank" rel="noopener">${escapeHtml(user.website)}</a></div>
        <div><span>Téléphone</span>${escapeHtml(user.phone || '—')}</div>
      </div>
    </div>`;
}

function renderTodos(todos) {
  const list = $('#todosList');
  const count = $('#todoCount');
  if (!list) return;
  if (!todos.length) { list.innerHTML = '<li class="empty-state">Aucune tâche.</li>'; count.textContent='0'; return; }
  list.innerHTML = '';
  todos.forEach(t => {
    const li = createEl('li', { classes:['todo-item', t.completed?'done':''], attrs:{ 'data-id': t.id }});
    li.innerHTML = `
      <label class="todo-check">
        <input type="checkbox" ${t.completed?'checked':''} aria-label="Marquer comme ${t.completed?'en cours':'terminée'}" />
        <span>✓</span>
      </label>
      <div class="todo-body">
        <p class="todo-title">${escapeHtml(t.title)}</p>
        <div class="todo-meta">
          <span class="status"><span class="status-dot" aria-hidden="true"></span>${t.completed?'Terminée':'En cours'}</span>
          <span>ID ${t.id}</span>
        </div>
      </div>`;
    const checkbox = $('input', li);
    checkbox.addEventListener('change', () => toggleTodoStatus(t.id, checkbox.checked));
    list.appendChild(li);
  });
  count.textContent = String(todos.length);
}

function setupTodoForm(userId) {
  const form = $('#todoForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const title = $('#todoTitle').value.trim();
    const completed = $('#todoCompleted').checked;
    const msgEl = $('#formMsg');
    if (title.length < 3) { setFormMessage(msgEl, 'Titre trop court', 'error'); return; }
    if (title.length > 120) { setFormMessage(msgEl, 'Titre trop long', 'error'); return; }
    setFormMessage(msgEl, 'Ajout en cours...');
    try {
      const newTodo = await createTodo({ userId: Number(userId), title, completed });
      // L'API renvoie un id factice. On push localement.
      const todos = state.todosByUser.get(Number(userId)) || [];
      newTodo.id = todos.length ? Math.max(...todos.map(t=>t.id)) + 1 : 1; // simulation
      todos.unshift(newTodo);
      state.todosByUser.set(Number(userId), todos);
      // Réappliquer filtre actif
      applyActiveFilter(Number(userId));
      form.reset();
      setFormMessage(msgEl, 'Tâche ajoutée ✅', 'success');
    } catch (err) {
      setFormMessage(msgEl, err.message || 'Erreur lors de l\'ajout', 'error');
    }
  });
}

function toggleTodoStatus(id, completed) {
  // Mise à jour locale uniquement (API JSONPlaceholder ne persiste pas)
  for (const [uid, todos] of state.todosByUser.entries()) {
    const t = todos.find(td => td.id === id);
    if (t) { t.completed = completed; applyActiveFilter(uid); break; }
  }
}

function setupTodoFilters(userId) {
  const buttons = $all('.filter-btn');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
    state.activeFilter = btn.getAttribute('data-filter');
    applyActiveFilter(Number(userId));
  }));
}

function applyActiveFilter(userId) {
  const todos = state.todosByUser.get(userId) || [];
  let filtered = todos;
  if (state.activeFilter === 'open') filtered = todos.filter(t => !t.completed);
  if (state.activeFilter === 'done') filtered = todos.filter(t => t.completed);
  renderTodos(filtered);
}

function showUserDetailError(msg) {
  const main = $('#main');
  main.innerHTML = `<div class="empty-state" role="alert">${msg}</div>`;
}

/* ------------------------- Helpers divers -------------------------- */
function truncate(str, max) { return str.length > max ? str.slice(0, max - 1) + '…' : str; }
function escapeHtml(str='') { return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

// Expose state pour debug si besoin
window.__APP_STATE__ = state;
