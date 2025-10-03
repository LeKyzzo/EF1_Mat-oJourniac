// utils.js - fonctions utilitaires générales
'use strict';

/**
 * Sélecteur raccourci
 * @param {string} sel
 * @param {ParentNode} [scope=document]
 * @returns {Element|null}
 */
function $(sel, scope = document) { return scope.querySelector(sel); }
function $all(sel, scope = document) { return Array.from(scope.querySelectorAll(sel)); }

/** Debounce simple pour limiter la fréquence d'exécution d'une fonction */
function debounce(fn, delay = 250) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), delay); };
}

/** Gère l'affichage du loader global */
const Loader = (() => {
  const el = $('#loader');
  return {
    show() { el?.classList.add('active'); el?.setAttribute('aria-hidden', 'false'); },
    hide() { el?.classList.remove('active'); el?.setAttribute('aria-hidden', 'true'); }
  };
})();

/** Animation d'apparition au scroll (optionnelle) */
function initReveal() {
  const els = $all('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) return;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

/** Récupère un paramètre d'URL */
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/** Crée un élément avec classes et attributs */
function createEl(tag, { classes = [], attrs = {}, html = '' } = {}) {
  const el = document.createElement(tag);
  if (classes.length) el.className = classes.join(' ');
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  if (html) el.innerHTML = html;
  return el;
}

/** Met à jour année footer */
function updateYear() {
  const y = new Date().getFullYear();
  const el = $('#year'); if (el) el.textContent = String(y);
}

/** Affiche un message de formulaire */
function setFormMessage(el, msg, type='') {
  if (!el) return; el.textContent = msg; el.className = 'form__msg'; if (type) el.classList.add(type);
}

/** Gestion du menu hamburger */
function initNavMenu() {
  const btn = $('#navToggle');
  const nav = $('#mainNav');
  let overlay = document.getElementById('navOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'navOverlay';
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.classList.toggle('active');
    if (nav.hasAttribute('hidden')) nav.removeAttribute('hidden');
    nav.classList.toggle('open');
    document.body.classList.toggle('nav-open');
    overlay.classList.toggle('active');
    overlay.hidden = !overlay.classList.contains('active');
  });
  nav.addEventListener('click', e => {
    if (e.target instanceof HTMLAnchorElement) {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('active');
      nav.classList.remove('open');
      setTimeout(()=>{ if(!nav.classList.contains('open')) nav.setAttribute('hidden',''); }, 250);
      document.body.classList.remove('nav-open');
      overlay.classList.remove('active');
      overlay.hidden = true;
    }
  });
  overlay.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('active');
    nav.classList.remove('open');
    setTimeout(()=>{ if(!nav.classList.contains('open')) nav.setAttribute('hidden',''); }, 250);
    document.body.classList.remove('nav-open');
    overlay.classList.remove('active');
    overlay.hidden = true;
  });
}

/** Amélioration accessibilité : focus visible sur skip nav potentiel */
function enableGlobalA11y() {
  document.body.addEventListener('keydown', e => {
    if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  updateYear();
  initNavMenu();
  enableGlobalA11y();
});

// Exposition minimale globale si besoin ailleurs
window.$ = $; window.$all = $all; window.debounce = debounce; window.Loader = Loader; window.initReveal = initReveal;
window.getUrlParam = getUrlParam; window.createEl = createEl; window.setFormMessage = setFormMessage;
