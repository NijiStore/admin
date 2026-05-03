const API = 'https://niji-backend.onrender.com';

import { auth } from 'https://nijistore.github.io/niji-shared/auth.js';

await auth.requireAuth();
await auth.requirePerm('app:admin');

let currentUser = await auth.getUser();
let currentUserId = null;

const ALL_PERMISSIONS = [
  'admin:access',
  'app:admin',
  'app:protojournal',
  'protojournal:read',
  'protojournal:write'
];

loadUsers();

async function deleteUser(id) {
  await fetch(API + '/admin/users/' + id, {
    method: 'DELETE',
    credentials: 'include'
  });

  loadUsers();
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

async function changeRole(userId, roleId) {
  await fetch(API + '/admin/users/' + userId + '/role', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId })
  });

  loadUsers();
}

async function openRole(roleId) {
  currentUserId = roleId;

  const res = await fetch(API + '/admin/roles', {
    credentials: 'include'
  });

  const roles = await res.json();
  const role = roles.find(r => r.id === roleId);

  const container = document.getElementById('permList');
  container.innerHTML = '';

  (role.permissions || []).forEach(p => {
    const row = document.createElement('div');
    row.className = 'perm-row';

    row.innerHTML = `
      <span>${p}</span>
      <button class="logout-btn" onclick="removePerm('${p}')">Remove</button>
    `;

    container.appendChild(row);
  });

  document.getElementById('permModal').classList.add('open');
}

async function addPerm() {
  const input = document.getElementById('permInput');
  const permission = input.value.trim();

  if (!permission) return;

  const res = await fetch(API + '/admin/roles', {
    credentials: 'include'
  });

  const roles = await res.json();
  const role = roles.find(r => r.id === currentUserId);

  const updated = [...new Set([...(role.permissions || []), permission])];

  await fetch(API + '/admin/roles/' + currentUserId, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: role.name,
      permissions: updated
    })
  });

  input.value = '';
  openRole(currentUserId);
}

async function removePerm(permission) {
  const res = await fetch(API + '/admin/roles', {
    credentials: 'include'
  });

  const roles = await res.json();
  const role = roles.find(r => r.id === currentUserId);

  const updated = (role.permissions || []).filter(p => p !== permission);

  await fetch(API + '/admin/roles/' + currentUserId, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: role.name,
      permissions: updated
    })
  });

  openRole(currentUserId);
}

function closePerms() {
  document.getElementById('permModal').classList.remove('open');
}

async function loadUsers() {
  const [usersRes, rolesRes] = await Promise.all([
    fetch(API + '/admin/users', { credentials: 'include' }),
    fetch(API + '/admin/roles', { credentials: 'include' })
  ]);

  const users = await usersRes.json();
  const roles = await rolesRes.json();

  const container = document.getElementById('userList');
  container.innerHTML = '';

  users.forEach(u => {
    const isMe = currentUser.id === u.id;

    const roleOptions = roles.map(r =>
      `<option value="${r.id}" ${u.role_id === r.id ? 'selected' : ''}>${r.name}</option>`
    ).join('');

    const div = document.createElement('div');
    div.className = 'user-row';

    div.innerHTML = `
      <span>${u.username}</span>
      <select onchange="changeRole('${u.id}', this.value)">
        ${roleOptions}
      </select>
      <div class="user-actions">
        <button class="logout-btn" onclick="openRole('${u.role_id}')">Role</button>
        ${!isMe ? `<button class="logout-btn" onclick="deleteUser('${u.id}')">Del</button>` : ''}
      </div>
    `;

    container.appendChild(div);
  });
}

const input = document.getElementById('permInput');
const suggestionBox = document.getElementById('permSuggestions');

input.addEventListener('input', () => {
  const value = input.value.toLowerCase();

  const matches = ALL_PERMISSIONS.filter(p =>
    p.toLowerCase().startsWith(value)
  );

  suggestionBox.innerHTML = '';

  matches.forEach(p => {
    const div = document.createElement('div');
    div.className = 'perm-suggestion';
    div.textContent = p;

    div.onclick = () => {
      input.value = p;
      suggestionBox.innerHTML = '';
    };

    suggestionBox.appendChild(div);
  });
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    const first = suggestionBox.firstChild;
    if (first) {
      e.preventDefault();
      input.value = first.textContent;
      suggestionBox.innerHTML = '';
    }
  }
});