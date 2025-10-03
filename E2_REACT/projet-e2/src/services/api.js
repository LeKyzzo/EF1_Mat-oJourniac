const BASE_URL = "https://jsonplaceholder.typicode.com";

async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new Error("Erreur réseau : impossible de contacter le serveur");
  }

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Réponse JSON invalide");
  }
}

export function getUsers() {
  return apiFetch("/users");
}

export function getUser(id) {
  return apiFetch(`/users/${id}`);
}

export function getUserTodos(userId) {
  return apiFetch(`/todos?userId=${userId}`);
}

export function createTodo(data) {
  return apiFetch("/todos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
