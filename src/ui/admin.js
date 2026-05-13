// src/ui/admin.js
import { db } from '../firebase/config';
import { renderAdminPieChart } from './charts';

export async function loadAdminDashboardData() {
    // Admin specific logic...
}

export function renderAdminAnalytics(tasks) {
    const userCounts = {};
    tasks.forEach(t => {
        const user = t.createdByDisplayName || 'Unknown';
        userCounts[user] = (userCounts[user] || 0) + 1;
    });

    renderAdminPieChart({
        labels: Object.keys(userCounts),
        values: Object.values(userCounts)
    });
}
