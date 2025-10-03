// api.js - gestion centralisée des appels API
'use strict';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const cfg = {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    ...options
  };
  let res;
  try {
    res = await fetch(url, cfg);
  } catch (networkErr) {
    throw new Error('Erreur réseau : impossible de contacter le serveur');
  }
  if (!res.ok) {
    throw new Error(`Erreur API ${res.status}`);
  }
  try {
    return await res.json();
  } catch (parseErr) {
    throw new Error('Réponse JSON invalide');
  }
}

async function getUsers() { return apiFetch('/users'); }
async function getUser(id) { return apiFetch(`/users/${id}`); }
async function getUserTodos(id) { return apiFetch(`/todos?userId=${id}`); }
async function createTodo(data) {
  return apiFetch('/todos', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

window.getUsers = getUsers; window.getUser = getUser; window.getUserTodos = getUserTodos; window.createTodo = createTodo;
