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

// State
let allTasks = [];
let quillRemark = null;

// Expose to window for HTML onclick handlers
window.handleLogin = handleLogin;
window.logoutUser = logoutUser;
window.showDashboard = showDashboard;
window.showForm = showForm;
window.showHistory = showHistory;
window.addTimeEntryRow = addTimeEntryRow;
window.saveTask = () => handleSaveTask(quillRemark);
window.applyFilters = () => {
    const filtered = applyFilters(allTasks);
    renderTasksList(filtered, isAdminUser());
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
async function loadDashboardData() {
    toggleLoader(true);
    try {
        const userId = currentUser.uid || currentUser.id;
        const snap = await db.collection('Tasks').where('userId', '==', userId).get();
        allTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateDashboardStats(allTasks);
        renderRecentTasks(allTasks);
    } catch (e) {
        console.error('Error loading dashboard:', e);
    } finally {
        toggleLoader(false);
    }
}

async function loadAllTasks() {
    toggleLoader(true);
    try {
        const userId = currentUser.uid || currentUser.id;
        const snap = await db.collection('Tasks').where('userId', '==', userId).get();
        allTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTasksList(allTasks, isAdminUser());
    } catch (e) {
        console.error('Error loading history:', e);
    } finally {
        toggleLoader(false);
    }
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
