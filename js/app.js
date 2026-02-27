const API_BASE = 'http://taskmanagerapp26.runasp.net/api/tasks';

let allTasks = [];
let currentFilter = 'all';

// --------------- Initialization ---------------
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderTasks();
    });
  });
});

// -------------- Fetch Tasks ---------------
async function fetchTasks() {
  showTableState('Loading tasks...');
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error();
    allTasks = await res.json();
    renderTasks();
    updateStats();
  } catch {
    showTableState('Could not load tasks. Is the API running?');
  }
}

// ------------- Render Tasks ---------------
function renderTasks() {
  const filtered = currentFilter === 'all'
    ? allTasks
    : allTasks.filter(t => t.status === currentFilter);

  if (filtered.length === 0) {
    showTableState(currentFilter === 'all'
      ? 'No tasks yet. Click "+ New Task" to get started.'
      : 'No tasks match this filter.');
    return;
  }

  document.getElementById('task-tbody').innerHTML = filtered.map(task => `
    <tr>
      <td>
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      </td>
      <td><span class="badge ${task.status}">${formatStatus(task.status)}</span></td>
      <td>${task.dueDate ? formatDate(task.dueDate) : '—'}</td>
      <td>
        <button class="btn-edit" data-id="${task.id}">Edit</button>
        <button class="btn-delete" data-id="${task.id}">Delete</button>
      </td>
    </tr>`).join('');
}

// ------------- Update Stats ---------------
function updateStats() {
  document.getElementById('stat-pending').textContent   = allTasks.filter(t => t.status === 'pending').length + ' Pending';
  document.getElementById('stat-progress').textContent  = allTasks.filter(t => t.status === 'in_progress').length + ' In Progress';
  document.getElementById('stat-completed').textContent = allTasks.filter(t => t.status === 'completed').length + ' Completed';
}

// ------------- Modal: Open (Create) ---------------
function openModal() {
  document.getElementById('modal-title').textContent = 'New Task';
  document.getElementById('submit-text').textContent = 'Create Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-id').value = '';
  clearErrors();
  document.getElementById('modal-overlay').classList.add('open');
}

// ------------ Modal: Open (Edit) ---------------
async function openEditModal(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error();
    const task = await res.json();

    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('submit-text').textContent = 'Save Changes';
    document.getElementById('task-id').value     = task.id;
    document.getElementById('title').value       = task.title;
    document.getElementById('description').value = task.description || '';
    document.getElementById('status').value      = task.status;
    document.getElementById('due-date').value = task.dueDate ? task.dueDate.slice(0, 10) : '';    clearErrors();
    clearErrors();
    document.getElementById('modal-overlay').classList.add('open');
  } catch {
    showToast('Could not load task.', 'error');
  }
}

// ------------ Modal: Close ---------------
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ------------ Handle Form Submit (Create/Edit) ---------------
async function handleSubmit(e) {
  e.preventDefault();
  const id          = document.getElementById('task-id').value;
  const title       = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const status      = document.getElementById('status').value;
  const dueDateRaw  = document.getElementById('due-date').value;

  clearErrors();
  if (!title) {
    document.getElementById('title-error').classList.add('visible');
    document.getElementById('title').focus();
    return;
  }

  const payload = {
    title,
    description: description || null,
    status,
    dueDate: dueDateRaw ? new Date(dueDateRaw + 'T23:59:59').toISOString() : null
  };

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  document.getElementById('submit-text').textContent = id ? 'Saving...' : 'Creating...';

  try {
    const res = await fetch(id ? `${API_BASE}/${id}` : API_BASE, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    closeModal();
    await fetchTasks();
    showToast(id ? 'Task updated.' : 'Task created.', 'success');
  } catch {
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('submit-text').textContent = id ? 'Save Changes' : 'Create Task';
  }
}

// ------------ Confirm Delete ---------------
function confirmDelete(id) {
  document.getElementById('confirm-overlay').classList.add('open');
  document.getElementById('confirm-delete-btn').onclick = () => deleteTask(id);
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('open');
}

async function deleteTask(id) {
  closeConfirm();
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await fetchTasks();
    showToast('Task deleted.', 'success');
  } catch {
    showToast('Could not delete task.', 'error');
  }
}

// ------------ Helper ---------------
function showTableState(msg) {
  document.getElementById('task-tbody').innerHTML =
    `<tr class="state-row"><td colspan="4">${msg}</td></tr>`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
}

function formatStatus(s) {
  return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[s] || s;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ------------ Event Listeners ---------------
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('confirm-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeConfirm();
});

// ------------ Task Table Buttons (Edit/Delete) ---------------
document.getElementById('task-tbody').addEventListener('click', e => {
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');
  const descDiv   = e.target.closest('.task-desc');

  if (editBtn)   openEditModal(editBtn.getAttribute('data-id'));
  if (deleteBtn) confirmDelete(deleteBtn.getAttribute('data-id'));
  if (descDiv)   descDiv.classList.toggle('expanded');
});