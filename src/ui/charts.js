// src/ui/charts.js

let projectChartInstance = null;
let statusChartInstance = null;
let userFrequencyChartInstance = null;
let adminPieChartInstance = null;

function getTaskDate(task) {
    if (task.timeEntries && task.timeEntries.length > 0) {
        return task.timeEntries[0].date || '';
    }
    return '';
}

export function renderProjectChart(data) {
    const ctx = document.getElementById('projectChart');
    if (!ctx) return;
    if (projectChartInstance) projectChartInstance.destroy();
    projectChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: ['#00e5ff', '#4fc3f7', '#0288d1', '#01579b', '#b3e5fc'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '70%'
        }
    });
}

export function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: ['#ffc107', '#00e5ff', '#4caf50'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

export function renderUserFrequencyChart(tasks, range) {
    const ctx = document.getElementById('userFrequencyChart');
    if (!ctx) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let days = 1;
    switch (range) {
        case 'day':     days = 1;  break;
        case 'week':    days = 7;  break;
        case '15days':  days = 15; break;
        case 'month':   days = 30; break;
        case '3months': days = 90; break;
        default:        days = 0;  break; 
    }

    let labels = [];
    let counts = [];

    if (range === 'all') {
        const monthMap = {};
        tasks.forEach(t => {
            const d = getTaskDate(t);
            if (!d) return;
            const key = d.slice(0, 7);
            monthMap[key] = (monthMap[key] || 0) + 1;
        });
        const sorted = Object.keys(monthMap).sort();
        labels = sorted.map(k => {
            const [y, m] = k.split('-');
            return new Date(+y, +m - 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        });
        counts = sorted.map(k => monthMap[k]);
    } else {
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            labels.push(days <= 7 ? d.toLocaleDateString(undefined, { weekday: 'short' }) : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
            const cnt = tasks.filter(t => getTaskDate(t) === key).length;
            counts.push(cnt);
        }
    }

    if (userFrequencyChartInstance) userFrequencyChartInstance.destroy();
    userFrequencyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Tasks',
                data: counts,
                backgroundColor: 'rgba(0, 229, 255, 0.5)',
                borderColor: 'rgba(0, 229, 255, 0.9)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 9 } } },
                y: { ticks: { color: '#94a3b8', font: { size: 9 }, stepSize: 1 }, beginAtZero: true }
            }
        }
    });
}

export function renderAdminPieChart(data) {
    const ctx = document.getElementById('adminPieChart');
    if (!ctx) return;
    if (adminPieChartInstance) adminPieChartInstance.destroy();
    adminPieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: ['#00e5ff', '#ffc107', '#4caf50', '#f44336', '#9c27b0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

export function updateChartsTheme() {
    if (projectChartInstance) projectChartInstance.update();
    if (statusChartInstance) statusChartInstance.update();
    if (userFrequencyChartInstance) userFrequencyChartInstance.update();
    if (adminPieChartInstance) adminPieChartInstance.update();
}
