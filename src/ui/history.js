// src/ui/history.js
import { deleteTask, updateTaskData } from '../firebase/firestore-service';
import { showToast, toggleLoader } from './components';

export function renderTasksList(tasks, isAdmin = false) {
    const container = document.getElementById('tasksListContainer');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 text-muted">No tasks found matching your filters.</div>';
        return;
    }

    container.innerHTML = tasks.map(t => `
        <div class="col-12">
            <div class="card glass-card border-0 p-3 mb-2 shadow-sm task-row-animate">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <h6 class="fw-bold mb-0 text-white">${t.taskName}</h6>
                        <small class="text-info"><i class="fa-solid fa-folder me-1"></i>${t.project || 'General'}</small>
                    </div>
                    <div class="col-md-2 text-center">
                        <span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span>
                    </div>
                    <div class="col-md-2 text-center">
                        <small class="text-muted"><i class="fa-solid fa-clock me-1"></i>${t.totalDuration || '00:00'}</small>
                    </div>
                    <div class="col-md-2 text-center">
                        <small class="text-muted">${t.createdByDisplayName || 'User'}</small>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-outline-info me-1" onclick="openPreviewModal('${t.id}')"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn btn-sm btn-outline-warning" onclick="openEditModal('${t.id}')"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Completed': return 'bg-success-subtle text-success';
        case 'In Progress': return 'bg-info-subtle text-info';
        default: return 'bg-secondary-subtle text-secondary';
    }
}
