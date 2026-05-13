// src/ui/filters.js

export function applyFilters(tasks) {
    const search = document.getElementById('filterSearch').value.toLowerCase();
    const project = document.getElementById('filterProject').value;
    const status = document.getElementById('filterStatus').value;

    return tasks.filter(t => {
        const matchesSearch = !search || (t.taskName || '').toLowerCase().includes(search) || (t.remarkText || '').toLowerCase().includes(search);
        const matchesProject = !project || t.project === project;
        const matchesStatus = !status || t.status === status;
        return matchesSearch && matchesProject && matchesStatus;
    });
}

export function clearFilters() {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterProject').selectedIndex = 0;
    document.getElementById('filterStatus').selectedIndex = 0;
}
