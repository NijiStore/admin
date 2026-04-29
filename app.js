const API = 'https://niji-backend.onrender.com';

(async () => {
  const res = await fetch(API + '/auth/me', {
    credentials: 'include'
  });

  if (!res.ok) {
    window.location.href = '/login.html';
    return;
  }

  loadUsers();
})();

async function loadUsers() {
  const res = await fetch(API + '/admin/users', {
    credentials: 'include'
  });

  const users = await res.json();

  const container = document.getElementById('userList');
  container.innerHTML = '';

  users.forEach(u => {
    const div = document.createElement('div');
    div.innerHTML = `
      <span>${u.username}</span>
      <button onclick="deleteUser('${u.id}')">X</button>
      <button onclick="viewPerms('${u.id}')">Perms</button>
    `;
    container.appendChild(div);
  });
}

async function createUser() {
  const username = document.getElementById('newUser').value;
  const password = document.getElementById('newPass').value;

  await fetch(API + '/admin/users', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  loadUsers();
}

async function deleteUser(id) {
  await fetch(API + '/admin/users/' + id, {
    method: 'DELETE',
    credentials: 'include'
  });

  loadUsers();
}

async function viewPerms(id) {
  const res = await fetch(API + '/admin/permissions/' + id, {
    credentials: 'include'
  });

  const perms = await res.json();
  alert(JSON.stringify(perms, null, 2));
}