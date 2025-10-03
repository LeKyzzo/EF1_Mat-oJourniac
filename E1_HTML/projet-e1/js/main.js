"use strict";

// État global partagé entre la page d'accueil et la page détaillée.
// J'y conserve uniquement les infos nécessaires pour orchestrer le rendu côté client.
const state = {
  users: [],
  todosByUser: new Map(),
  activeFilter: "all",
};

window.addEventListener("DOMContentLoaded", () => {
  // Je détecte dynamiquement la page pour n'initialiser que le nécessaire.
  // De cette façon, je ne déclenche pas inutilement la logique des tâches détaillées sur l'accueil (et inversement).
  const page = document.body.getAttribute("data-page");
  if (page === "home") initHome();
  if (page === "user") initUserDetail();
  // Je prévois une sécurité pour masquer le loader même si une erreur m'empêche de l'atteindre dans les `finally`.
  setTimeout(() => {
    try {
      Loader.hide();
    } catch (e) {}
  }, 6000);
});

async function initHome() {
  Loader.show();
  try {
    // Je récupère les profils et les premières tâches pour enrichir les cartes.
    state.users = await getUsers();
    await loadTodosForUsers(state.users);
    // Je remplis directement la grille avec l'ensemble des profils disponibles.
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
  // Je fais les appels de manière parallèle pour éviter de ralentir le rendu.
  const promises = users.map((u) =>
    getUserTodos(u.id)
      .then((t) => state.todosByUser.set(u.id, t))
      .catch(() => state.todosByUser.set(u.id, []))
  );
  await Promise.all(promises);
}

function showUsersError(msg) {
  const grid = $("#usersGrid");
  grid.innerHTML = `<div class="empty-state" role="alert">${msg}</div>`;
}

// Je gère ici la fabrication des cartes utilisateur pour la grille d'accueil.
// Le booléen `isSearch` me permet uniquement d'ajuster le message vide.
function renderUsers(list, isSearch = false) {
  const grid = $("#usersGrid");
  if (!grid) return;
  const inSearchMode = Boolean(isSearch);
  if (!list.length) {
    const emptyMsg = inSearchMode
      ? "Aucun profil ne correspond à votre recherche."
      : "Aucun utilisateur.";
    grid.innerHTML = `<p class="empty-state">${emptyMsg}</p>`;
    return;
  }
  const toRender = list;
  grid.innerHTML = "";
  toRender.forEach((user) => {
    const todos = state.todosByUser.get(user.id) || [];
    const completed = todos.filter((t) => t.completed).length;
    const firstTodos = todos.slice(0, 3);
    const companyName =
      user && user.company && user.company.name
        ? user.company.name
        : "Entreprise";
    const username = user && user.username ? user.username : "";
    const cityName =
      user && user.address && user.address.city ? user.address.city : "";
    const emailRaw = user && user.email ? String(user.email) : "";
    const phoneRaw = user && user.phone ? String(user.phone) : "";
    const websiteRaw = user && user.website ? String(user.website) : "";
    const emailHref = emailRaw ? "mailto:" + encodeURIComponent(emailRaw) : "";
    const phoneHref = phoneRaw ? "tel:" + encodeURIComponent(phoneRaw) : "";
    const websiteHref = websiteRaw
      ? /^https?:\/\//i.test(websiteRaw)
        ? websiteRaw
        : "http://" + websiteRaw
      : "";
    const websiteDisplay = websiteRaw
      ? websiteRaw.replace(/^https?:\/\//i, "")
      : "";
    const emailMarkup = emailHref
      ? `<a href="${emailHref}">${escapeHtml(emailRaw)}</a>`
      : "—";
    const phoneMarkup = phoneHref
      ? `<a href="${phoneHref}">${escapeHtml(phoneRaw)}</a>`
      : "—";
    const websiteMarkup = websiteHref
      ? `<a href="${escapeHtml(
          websiteHref
        )}" target="_blank" rel="noopener">${escapeHtml(websiteDisplay)}</a>`
      : "—";
    const catchPhrase =
      user && user.company && user.company.catchPhrase
        ? user.company.catchPhrase
        : "";
    const business =
      user && user.company && user.company.bs ? user.company.bs : "";
    const card = createEl("article", { classes: ["user-card", "reveal"] });
    const metaHtml = `
      <ul class="user-card__meta">
        <li class="user-card__meta-item">
          <span class="user-card__meta-label">Pseudo</span>
          <span class="user-card__meta-value">${
            username ? escapeHtml(username) : "—"
          }</span>
        </li>
        <li class="user-card__meta-item">
          <span class="user-card__meta-label">Ville</span>
          <span class="user-card__meta-value">${
            cityName ? escapeHtml(cityName) : "—"
          }</span>
        </li>
        <li class="user-card__meta-item">
          <span class="user-card__meta-label">Email</span>
          <span class="user-card__meta-value">${emailMarkup}</span>
        </li>
        <li class="user-card__meta-item">
          <span class="user-card__meta-label">Téléphone</span>
          <span class="user-card__meta-value">${phoneMarkup}</span>
        </li>
        <li class="user-card__meta-item">
          <span class="user-card__meta-label">Site web</span>
          <span class="user-card__meta-value">${websiteMarkup}</span>
        </li>
      </ul>`;
    const catchText = catchPhrase
      ? `« ${catchPhrase} »`
      : "Slogan indisponible pour cette entreprise.";
    const tags = [];
    if (business)
      tags.push(`<li class="user-card__tag">${escapeHtml(business)}</li>`);
    firstTodos.forEach((todo) => {
      tags.push(
        `<li class="user-card__tag user-card__tag--todo">${escapeHtml(
          truncate(todo.title, 26)
        )}</li>`
      );
    });
    if (websiteHref) {
      tags.push(
        `<li class="user-card__tag user-card__tag--link">${escapeHtml(
          websiteDisplay
        )}</li>`
      );
    }
    const tagsMarkup = tags.length
      ? `<ul class="user-card__tags" aria-label="Points clés utilisateur">${tags.join(
          ""
        )}</ul>`
      : "";
    card.innerHTML = `
      <div class="user-card__header">
        <div>
          <h3 class="user-card__title">${escapeHtml(user.name)}</h3>
          <div class="user-card__company">${escapeHtml(companyName)}</div>
        </div>
        <span class="badge" aria-label="${completed} tâches terminées">${completed}</span>
      </div>
      ${metaHtml}
      <p class="user-card__catch">${escapeHtml(catchText)}</p>
      ${tagsMarkup}
      `;
    const fullLink = createEl("a", {
      classes: ["user-card__full"],
      attrs: {
        href: `user.html?id=${user.id}`,
        "aria-label": `Voir le détail de ${escapeHtml(user.name)}`,
      },
    });
    card.appendChild(fullLink);
    grid.appendChild(card);
  });
  if (typeof initReveal === "function") {
    requestAnimationFrame(() => {
      initReveal();
      if (!("IntersectionObserver" in window)) {
        $all(".reveal", grid).forEach((el) => el.classList.add("visible"));
      }
    });
  }
}

function setupSearch() {
  const input = $("#searchInput");
  const clearBtn = $("#clearSearch");
  if (!input) return;
  // Je traite le champ de recherche à la volée pour filtrer les utilisateurs et leurs tâches associées.
  const handle = async () => {
    const raw = input.value;
    const q = raw.trim().toLowerCase();
    if (!q) {
      clearBtn.style.display = "none";
      renderUsers(state.users);
      return;
    }
    clearBtn.style.display = "inline-block";
    // Je fouille aussi le pseudo, la société et la ville pour aider ma recherche.
    // Je scanne chaque profil côté client pour rester instantané : nom, pseudo, société, ville et titres de tâches.
    const filtered = state.users.filter((u) => {
      const name = (u && u.name ? u.name : "").toLowerCase();
      const username = (u && u.username ? u.username : "").toLowerCase();
      const company = (
        u && u.company && u.company.name ? u.company.name : ""
      ).toLowerCase();
      const city = (
        u && u.address && u.address.city ? u.address.city : ""
      ).toLowerCase();
      const todos = state.todosByUser.get(u.id) || [];
      const hasTodoMatch = todos.some((todo) =>
        (todo && todo.title ? todo.title : "").toLowerCase().includes(q)
      );
      return (
        name.includes(q) ||
        username.includes(q) ||
        company.includes(q) ||
        city.includes(q) ||
        hasTodoMatch
      );
    });
    if (!filtered.length) {
      renderUsers([], true);
      return;
    }
    // Je réaffiche uniquement les cartes correspondantes.
    renderUsers(filtered, true);
  };
  input.addEventListener("input", handle);
  input.addEventListener("search", handle);
  const form = input.closest("form");
  if (form) form.addEventListener("submit", (e) => e.preventDefault());
  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    renderUsers(state.users);
    input.focus();
  });
}

async function initUserDetail() {
  const userId = getUrlParam("id");
  if (!userId) {
    showUserDetailError("Identifiant utilisateur manquant");
    return;
  }
  Loader.show();
  try {
    // Je charge en parallèle la fiche utilisateur et ses tâches associées pour afficher une page riche dès la première peinture.
    const [user, todos] = await Promise.all([
      getUser(userId),
      getUserTodos(userId),
    ]);
    state.users = [user];
    state.todosByUser.set(user.id, todos);
    renderUserInfo(user);
    renderTodos(todos);
    setupTodoForm(user.id);
    setupTodoFilters(user.id);
  } catch (err) {
    showUserDetailError(err.message);
  } finally {
    Loader.hide();
  }
}

function renderUserInfo(user) {
  // Je reconstruis toute la fiche d'identité avec les infos consolidées côté API.
  $("#userTitle").textContent = user.name;
  $("#breadcrumbUser").textContent = user.name;
  const info = $("#userInfo");
  if (!info) return;
  const username = user && user.username ? user.username : "";
  const companyName =
    user && user.company && user.company.name ? user.company.name : "";
  const cityName =
    user && user.address && user.address.city ? user.address.city : "";
  const street =
    user && user.address && user.address.street ? user.address.street : "";
  const suite =
    user && user.address && user.address.suite ? user.address.suite : "";
  const zipcode =
    user && user.address && user.address.zipcode ? user.address.zipcode : "";
  const geoLat =
    user && user.address && user.address.geo && user.address.geo.lat
      ? user.address.geo.lat
      : "";
  const geoLng =
    user && user.address && user.address.geo && user.address.geo.lng
      ? user.address.geo.lng
      : "";
  const emailRaw = user && user.email ? String(user.email) : "";
  const phoneRaw = user && user.phone ? String(user.phone) : "";
  const websiteRaw = user && user.website ? String(user.website) : "";
  const catchPhrase =
    user && user.company && user.company.catchPhrase
      ? user.company.catchPhrase
      : "";
  const business =
    user && user.company && user.company.bs ? user.company.bs : "";
  const emailHref = emailRaw ? "mailto:" + encodeURIComponent(emailRaw) : "";
  const phoneHref = phoneRaw ? "tel:" + encodeURIComponent(phoneRaw) : "";
  const websiteHref = websiteRaw
    ? /^https?:\/\//i.test(websiteRaw)
      ? websiteRaw
      : "http://" + websiteRaw
    : "";
  const websiteDisplay = websiteRaw
    ? websiteRaw.replace(/^https?:\/\//i, "")
    : "";
  const emailMarkup = emailHref
    ? `<a href="${emailHref}">${escapeHtml(emailRaw)}</a>`
    : "—";
  const phoneMarkup = phoneHref
    ? `<a href="${phoneHref}">${escapeHtml(phoneRaw)}</a>`
    : "—";
  const websiteMarkup = websiteHref
    ? `<a href="${escapeHtml(
        websiteHref
      )}" target="_blank" rel="noopener">${escapeHtml(websiteDisplay)}</a>`
    : "—";
  const todos = state.todosByUser.get(user.id) || [];
  const todoCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const subtitleParts = [];
  if (username) subtitleParts.push(`Pseudo : ${escapeHtml(username)}`);
  if (companyName)
    subtitleParts.push(`Entreprise : ${escapeHtml(companyName)}`);
  if (cityName) subtitleParts.push(`Ville : ${escapeHtml(cityName)}`);
  const subtitle = subtitleParts.length
    ? `<p class="user-info__subtitle">${subtitleParts.join(" • ")}</p>`
    : "";
  const geoValue =
    geoLat && geoLng ? `${escapeHtml(geoLat)} / ${escapeHtml(geoLng)}` : "—";
  info.innerHTML = `
    <div class="user-info__header">
      <h2 class="user-info__title">${escapeHtml(user.name)}</h2>
      ${subtitle}
    </div>
    <div class="user-info__grid">
      <article class="user-info__section">
        <h3>Coordonnées</h3>
        <ul class="user-info__list">
          <li><span class="user-info__list-label">Email</span>${emailMarkup}</li>
          <li><span class="user-info__list-label">Téléphone</span>${phoneMarkup}</li>
          <li><span class="user-info__list-label">Site web</span>${websiteMarkup}</li>
          <li><span class="user-info__list-label">Total tâches chargées</span>${todoCount}</li>
          <li><span class="user-info__list-label">Tâches terminées</span>${completedCount}</li>
        </ul>
      </article>
      <article class="user-info__section">
        <h3>Adresse</h3>
        <ul class="user-info__list">
          <li><span class="user-info__list-label">Rue</span>${
            street ? escapeHtml(street) : "—"
          }</li>
          <li><span class="user-info__list-label">Complément</span>${
            suite ? escapeHtml(suite) : "—"
          }</li>
          <li><span class="user-info__list-label">Code postal</span>${
            zipcode ? escapeHtml(zipcode) : "—"
          }</li>
          <li><span class="user-info__list-label">Ville</span>${
            cityName ? escapeHtml(cityName) : "—"
          }</li>
          <li><span class="user-info__list-label">Coordonnées GPS</span>${geoValue}</li>
        </ul>
      </article>
      <article class="user-info__section">
        <h3>Entreprise & activité</h3>
        <ul class="user-info__list">
          <li><span class="user-info__list-label">Nom</span>${
            companyName ? escapeHtml(companyName) : "—"
          }</li>
          <li><span class="user-info__list-label">Slogan</span>${
            catchPhrase ? `« ${escapeHtml(catchPhrase)} »` : "—"
          }</li>
          <li><span class="user-info__list-label">Spécialités</span>${
            business ? escapeHtml(business) : "—"
          }</li>
          <li><span class="user-info__list-label">Identifiant interne</span>${escapeHtml(
            String(user.id)
          )}</li>
        </ul>
      </article>
    </div>`;
}

function renderTodos(todos) {
  // Je rafraîchis la liste des tâches et le compteur associé pour refléter chaque opération CRUD locale.
  const list = $("#todosList");
  const count = $("#todoCount");
  if (!list) return;
  if (!todos.length) {
    list.innerHTML = '<li class="empty-state">Aucune tâche.</li>';
    count.textContent = "0";
    return;
  }
  list.innerHTML = "";
  todos.forEach((t) => {
    const li = createEl("li", {
      classes: ["todo-item", t.completed ? "done" : ""],
      attrs: { "data-id": t.id },
    });
    li.innerHTML = `
      <label class="todo-check">
        <input type="checkbox" ${
          t.completed ? "checked" : ""
        } aria-label="Marquer comme ${t.completed ? "en cours" : "terminée"}" />
        <span>✓</span>
      </label>
      <div class="todo-body">
        <p class="todo-title">${escapeHtml(t.title)}</p>
        <div class="todo-meta">
          <span class="status"><span class="status-dot" aria-hidden="true"></span>${
            t.completed ? "Terminée" : "En cours"
          }</span>
          <span>ID ${t.id}</span>
        </div>
      </div>`;
    const checkbox = $("input", li);
    checkbox.addEventListener("change", () =>
      toggleTodoStatus(t.id, checkbox.checked)
    );
    list.appendChild(li);
  });
  count.textContent = String(todos.length);
}

function setupTodoForm(userId) {
  // Je gère la création de tâches côté client et je simule un identifiant pour conserver l'ordre.
  const form = $("#todoForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("#todoTitle").value.trim();
    const completed = $("#todoCompleted").checked;
    const msgEl = $("#formMsg");
    if (title.length < 3) {
      setFormMessage(msgEl, "Titre trop court", "error");
      return;
    }
    if (title.length > 120) {
      setFormMessage(msgEl, "Titre trop long", "error");
      return;
    }
    setFormMessage(msgEl, "Ajout en cours...");
    try {
      const newTodo = await createTodo({
        userId: Number(userId),
        title,
        completed,
      });
      const todos = state.todosByUser.get(Number(userId)) || [];
      newTodo.id = todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
      todos.unshift(newTodo);
      state.todosByUser.set(Number(userId), todos);
      applyActiveFilter(Number(userId));
      form.reset();
      setFormMessage(msgEl, "Tâche ajoutée ✅", "success");
    } catch (err) {
      setFormMessage(msgEl, err.message || "Erreur lors de l'ajout", "error");
    }
  });
}

function toggleTodoStatus(id, completed) {
  // Je mets à jour l'état local de la Map puis je réapplique le filtre actif pour rester cohérent avec l'UI.
  for (const [uid, todos] of state.todosByUser.entries()) {
    const t = todos.find((td) => td.id === id);
    if (t) {
      t.completed = completed;
      applyActiveFilter(uid);
      break;
    }
  }
}

function setupTodoFilters(userId) {
  // Je synchronise les boutons de filtre pour qu'ils se comportent comme un groupe de boutons radio.
  const buttons = $all(".filter-btn");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      state.activeFilter = btn.getAttribute("data-filter");
      applyActiveFilter(Number(userId));
    })
  );
}

function applyActiveFilter(userId) {
  // Je dérive la liste affichée en fonction du filtre courant.
  const todos = state.todosByUser.get(userId) || [];
  let filtered = todos;
  if (state.activeFilter === "open")
    filtered = todos.filter((t) => !t.completed);
  if (state.activeFilter === "done")
    filtered = todos.filter((t) => t.completed);
  renderTodos(filtered);
}

function showUserDetailError(msg) {
  const main = $("#main");
  main.innerHTML = `<div class="empty-state" role="alert">${msg}</div>`;
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function escapeHtml(str = "") {
  return str.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

window.__APP_STATE__ = state;
