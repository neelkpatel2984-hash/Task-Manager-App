// src/ui/components.js

/**
 * Toggles the global loading spinner.
 */
export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (!loader) return;
    if (show) {
        loader.classList.remove('d-none');
        loader.classList.add('d-flex');
    } else {
        loader.classList.add('d-none');
        loader.classList.remove('d-flex');
    }
}

/**
 * Shows a custom toast notification.
 */
export function showToast(msg, isError = false) {
    // Remove existing toast
    const existing = document.querySelector('.toast-custom');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-custom${isError ? ' error' : ''}`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

/**
 * Re-triggers a CSS animation on an element.
 */
export function animateElement(el, animClass) {
    if (!el) return;
    el.classList.remove('animate__animated', animClass);
    void el.offsetWidth; // Trigger reflow
    el.classList.add('animate__animated', animClass);
}
