// src/ui/form.js
import { saveTaskData, loadProjects, saveNewProject } from '../firebase/firestore-service';
import { showToast, toggleLoader, animateElement } from './components';
import { calculateTimeDiff, formatDuration } from '../utils/helpers';

export function initForm() {
    // Add initial row
    addTimeEntryRow();
}

export function addTimeEntryRow() {
    const container = document.getElementById('timeEntriesContainer');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const index = Date.now();

    const rowHTML = `
        <div class="time-entry-row animate__animated animate__fadeInUp" id="row-${index}">
            <div class="form-group time-box" style="flex:1;">
                <input type="date" class="form-control logDate" value="${today}">
            </div>
            <div class="form-group time-box" style="flex:1;">
                <input type="time" class="form-control startTime">
            </div>
            <div class="form-group time-box" style="flex:1;">
                <input type="time" class="form-control endTime">
            </div>
            <div class="form-group time-box" style="flex:0.8;">
                <input type="text" class="form-control duration-display" readonly placeholder="00:00">
            </div>
            <button type="button" class="remove-entry-btn" onclick="removeTimeEntryRow('${index}')">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', rowHTML);
    const row = document.getElementById(`row-${index}`);
    
    // Listeners
    row.querySelectorAll('input[type="time"]').forEach(input => {
        input.addEventListener('change', () => {
            calculateRowDuration(row);
            updateTotalDuration();
        });
    });
}

function calculateRowDuration(row) {
    const start = row.querySelector('.startTime').value;
    const end = row.querySelector('.endTime').value;
    const display = row.querySelector('.duration-display');
    if (start && end) {
        display.value = calculateTimeDiff(start, end);
    }
}

export function updateTotalDuration() {
    const rows = document.querySelectorAll('.time-entry-row');
    let totalMins = 0;
    rows.forEach(row => {
        const d = row.querySelector('.duration-display').value;
        if (d) {
            const [h, m] = d.split(':').map(Number);
            totalMins += (h * 60) + m;
        }
    });
    document.getElementById('totalDurationDisplay').textContent = formatDuration(totalMins);
}

export async function handleSaveTask(quillInstance) {
    const name = document.getElementById('taskName').value.trim();
    const project = document.getElementById('projectSelect').value;
    const remark = quillInstance.root.innerHTML;

    if (!name) {
        showToast('Task name is required!', true);
        return;
    }

    const timeEntries = [];
    document.querySelectorAll('.time-entry-row').forEach(row => {
        const date = row.querySelector('.logDate').value;
        const start = row.querySelector('.startTime').value;
        const end = row.querySelector('.endTime').value;
        const duration = row.querySelector('.duration-display').value;
        if (date && start) timeEntries.push({ date, start, end, duration });
    });

    if (timeEntries.length === 0) {
        showToast('At least one time entry is required!', true);
        return;
    }

    toggleLoader(true);
    try {
        await saveTaskData({
            taskName: name,
            project,
            remark,
            timeEntries,
            totalDuration: document.getElementById('totalDurationDisplay').textContent,
            status: 'Unassigned'
        });
        showToast('Task saved! 🚀');
        resetForm(quillInstance);
        // Navigate to dashboard (done in main.js)
    } catch (e) {
        showToast('Failed to save task.', true);
    } finally {
        toggleLoader(false);
    }
}

export function resetForm(quill) {
    document.getElementById('taskName').value = '';
    document.getElementById('projectSelect').selectedIndex = 0;
    if (quill) quill.setContents([]);
    document.getElementById('timeEntriesContainer').innerHTML = '';
    addTimeEntryRow();
    updateTotalDuration();
}
