const API = 'https://niji-backend.onrender.com';

let currentUser = null;
let currentUserId = null;

(async () => {
  const res = await fetch(API + '/auth/me', {
    credentials: 'include'
  });

  if (!res.ok) {
    window.location.href = '/login.html';
    return;
  }

  currentUser = await res.json();

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
    const isMe = currentUser.id === u.id;

    const div = document.createElement('div');
    div.className = 'user-row';

    div.innerHTML = `
      <span>${u.username}</span>
      <div class="user-actions">
        <button class="logout-btn" onclick="openPerms('${u.id}')">Perms</button>
        ${!isMe ? `<button class="logout-btn" onclick="deleteUser('${u.id}')">Del</button>` : ''}
      </div>
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

async function openPerms(userId) {
  currentUserId = userId;

  const res = await fetch(API + '/admin/permissions/' + userId, {
    credentials: 'include'
  });

  const perms = await res.json();

  const container = document.getElementById('permList');
  container.innerHTML = '';

  perms.forEach(p => {
    const row = document.createElement('div');
    row.className = 'perm-row';

    row.innerHTML = `
      <span>${p.permission}</span>
      <button class="logout-btn" onclick="removePerm('${p.permission}')">Remove</button>
    `;

    container.appendChild(row);
  });

  document.getElementById('permModal').classList.add('open');
}

async function addPerm() {
  const input = document.getElementById('permInput');
  const permission = input.value.trim();

  if (!permission) return;

  await fetch(API + '/admin/permissions', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUserId,
      permission
    })
  });

  input.value = '';
  openPerms(currentUserId);
}

async function removePerm(permission) {
  await fetch(API + '/admin/permissions', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUserId,
      permission
    })
  });

  openPerms(currentUserId);
}

function closePerms() {
  document.getElementById('permModal').classList.remove('open');
}