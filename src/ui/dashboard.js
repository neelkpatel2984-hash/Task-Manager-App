// src/ui/dashboard.js
import { renderProjectChart, renderStatusChart, renderUserFrequencyChart } from './charts';
import { formatDuration } from '../utils/helpers';

export function updateDashboardStats(tasks) {
    const totalTasks = tasks.length;
    let totalMinutes = 0;
    const projectCounts = {};
    const statusCounts = { 'Unassigned': 0, 'In Progress': 0, 'Completed': 0 };

    tasks.forEach(t => {
        // Duration
        if (t.totalDuration) {
            const [h, m] = t.totalDuration.split(':').map(Number);
            totalMinutes += (h * 60) + (m || 0);
        }
        // Project
        const p = t.project || 'No Project';
        projectCounts[p] = (projectCounts[p] || 0) + 1;
        // Status
        if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
    });

    document.getElementById('statTotalTasks').textContent = totalTasks;
    document.getElementById('statTotalHours').textContent = formatDuration(totalMinutes);
    document.getElementById('statProjects').textContent = Object.keys(projectCounts).length;
    
    const completed = totalTasks > 0 ? Math.round((statusCounts['Completed'] / totalTasks) * 100) : 0;
    document.getElementById('statCompleted').textContent = completed + '%';

    // Update Charts
    renderProjectChart({
        labels: Object.keys(projectCounts),
        values: Object.values(projectCounts)
    });
    renderStatusChart({
        labels: Object.keys(statusCounts),
        values: Object.values(statusCounts)
    });
}

export function renderRecentTasks(tasks) {
    const container = document.getElementById('recentTasks');
    if (!container) return;
    
    const recent = tasks.slice(0, 4);
    if (recent.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-4">No tasks found yet.</div>';
        return;
    }

    container.innerHTML = recent.map(t => `
        <div class="col-12 col-md-6 col-lg-3">
            <div class="card h-100 glass-card border-0 p-3 shadow-sm task-card-hover" onclick="openPreviewModal('${t.id}')">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span>
                    <small class="text-muted">${t.totalDuration || '00:00'}</small>
                </div>
                <h6 class="fw-bold mb-1 text-truncate">${t.taskName}</h6>
                <small class="text-info d-block mb-2"><i class="fa-solid fa-folder me-1"></i>${t.project || 'General'}</small>
                <div class="mt-auto pt-2 border-top border-light d-flex justify-content-between align-items-center">
                    <small class="text-muted" style="font-size: 10px;">${t.createdByDisplayName || 'User'}</small>
                    <i class="fa-solid fa-arrow-right-long text-muted small"></i>
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
