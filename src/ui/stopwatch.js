// src/ui/stopwatch.js
import { showToast } from './components';

let stopwatchInterval = null;
let startTime = null;

export function startStopwatch() {
    startTime = Date.now();
    const display = document.getElementById('stopwatchDisplay');
    const startBtn = document.getElementById('stopwatchStartBtn');
    const stopBtn = document.getElementById('stopwatchStopBtn');

    startBtn.classList.add('d-none');
    stopBtn.classList.remove('d-none');
    display.classList.add('stopwatch-active');

    // Fill start time of the last row
    const rows = document.querySelectorAll('.time-entry-row');
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        const startInput = lastRow.querySelector('.startTime');
        if (!startInput.value) {
            const now = new Date();
            startInput.value = now.toTimeString().slice(0, 5);
        }
    }

    stopwatchInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        display.textContent = formatTime(elapsed);
    }, 1000);

    showToast('Stopwatch started! ⏱️');
}

export function stopStopwatch() {
    clearInterval(stopwatchInterval);
    const display = document.getElementById('stopwatchDisplay');
    const startBtn = document.getElementById('stopwatchStartBtn');
    const stopBtn = document.getElementById('stopwatchStopBtn');

    startBtn.classList.remove('d-none');
    stopBtn.classList.add('d-none');
    display.classList.remove('stopwatch-active');
    display.textContent = '00:00:00';

    // Fill end time of the last row
    const rows = document.querySelectorAll('.time-entry-row');
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        const endInput = lastRow.querySelector('.endTime');
        const now = new Date();
        endInput.value = now.toTimeString().slice(0, 5);
        
        // Trigger duration calculation
        endInput.dispatchEvent(new Event('change'));
    }

    showToast('Stopwatch stopped! ✅');
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
