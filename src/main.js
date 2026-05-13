// src/main.js
import './styles/main.css';
import { db, auth } from './firebase/config';
import { currentUser, handleLogin, logoutUser, checkAuth, isAdminUser } from './auth/auth-service';
import { toggleLoader, showToast } from './ui/components';
import { loadProjects } from './firebase/firestore-service';
import { updateDashboardStats, renderRecentTasks } from './ui/dashboard';
import { initForm, handleSaveTask, addTimeEntryRow, updateTotalDuration } from './ui/form';
import { renderTasksList } from './ui/history';
import { applyFilters } from './ui/filters';
import { startStopwatch, stopStopwatch } from './ui/stopwatch';
import DOMPurify from 'dompurify';

// State
let allTasks = [];
let quillRemark = null;
let dashboardUnsubscribe = null;
let historyUnsubscribe = null;

// Expose to window for HTML onclick handlers
window.handleLogin = handleLogin;
window.logoutUser = logoutUser;
window.showDashboard = showDashboard;
window.showForm = showForm;
window.showHistory = showHistory;
window.addTimeEntryRow = addTimeEntryRow;
window.startStopwatch = startStopwatch;
window.stopStopwatch = stopStopwatch;
window.saveTask = () => handleSaveTask(quillRemark);
window.applyFilters = () => {
    const filtered = applyFilters(allTasks);
    renderTasksList(filtered, isAdminUser());
};

window.openPreviewModal = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    const content = document.getElementById('previewContent');
    
    const sanitizedRemark = DOMPurify.sanitize(task.remark || '');
    
    content.innerHTML = `
        <h4 class="fw-bold text-white mb-3">${task.taskName}</h4>
        <div class="mb-3">
            <span class="badge bg-info text-dark me-2">${task.status}</span>
            <span class="text-muted small"><i class="fa-solid fa-folder me-1"></i>${task.project || 'General'}</span>
        </div>
        <div class="remark-content text-light p-3 rounded" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
            ${sanitizedRemark || '<i class="text-muted">No remarks.</i>'}
        </div>
        <div class="mt-4">
            <h6 class="fw-bold text-muted small mb-2 text-uppercase">Time Entries</h6>
            <div class="table-responsive">
                <table class="table table-sm table-dark table-borderless small mb-0">
                    <thead>
                        <tr>
                            <th class="text-muted">Date</th>
                            <th class="text-muted">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${task.timeEntries?.map(e => `
                            <tr>
                                <td>${e.date}</td>
                                <td>${e.duration}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="2">No entries</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    modal.show();
};

// Navigation Functions
function showView(viewId) {
    const views = ['dashboardView', 'formView', 'historyView'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });
    
    document.getElementById('loginView').classList.add('d-none');
    document.getElementById('mainApp').classList.remove('d-none');
    
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('d-none');
}

function showDashboard() {
    showView('dashboardView');
    loadDashboardData();
}

function showForm() {
    showView('formView');
}

function showHistory() {
    showView('historyView');
    loadAllTasks();
}

// Data Loaders
function loadDashboardData() {
    if (dashboardUnsubscribe) dashboardUnsubscribe();
    
    toggleLoader(true);
    const userId = currentUser.uid || currentUser.id;
    
    dashboardUnsubscribe = db.collection('Tasks')
        .where('userId', '==', userId)
        .onSnapshot(snap => {
            allTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateDashboardStats(allTasks);
            renderRecentTasks(allTasks);
            toggleLoader(false);
        }, err => {
            console.error('Dashboard listener error:', err);
            toggleLoader(false);
        });
}

function loadAllTasks() {
    if (historyUnsubscribe) historyUnsubscribe();
    
    toggleLoader(true);
    const userId = currentUser.uid || currentUser.id;
    
    historyUnsubscribe = db.collection('Tasks')
        .where('userId', '==', userId)
        .onSnapshot(snap => {
            allTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTasksList(allTasks, isAdminUser());
            toggleLoader(false);
        }, err => {
            console.error('History listener error:', err);
            toggleLoader(false);
        });
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (user) {
        showView('dashboardView');
        await initApp();
    } else {
        document.getElementById('loginView').classList.remove('d-none');
        document.getElementById('mainApp').classList.add('d-none');
    }
});

async function initApp() {
    toggleLoader(true);
    
    // Init Quill
    const editor = document.getElementById('editorRemark');
    if (editor && !quillRemark) {
        quillRemark = new Quill('#editorRemark', {
            theme: 'snow',
            placeholder: 'Add remarks...',
            modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered' }, { 'list': 'bullet' }], ['clean']] }
        });
    }

    initForm();
    await loadProjects();
    await loadDashboardData();
    
    toggleLoader(false);
}
