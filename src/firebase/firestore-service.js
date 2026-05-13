// src/firebase/firestore-service.js
import { db } from './config';
import { currentUser } from '../auth/auth-service';
import { showToast, toggleLoader } from '../ui/components';
import { stripHtml } from '../utils/helpers';

/**
 * Loads all projects the current user has access to.
 */
export async function loadProjects() {
    try {
        const userId = currentUser.uid || currentUser.id;
        const username = currentUser && (currentUser.username || currentUser.email || '');
        const seen = new Set();
        const allProjects = [];

        const q1 = await db.collection('Projects').where('userId', '==', userId).get();
        q1.forEach(doc => {
            seen.add(doc.id);
            allProjects.push({ id: doc.id, ...doc.data() });
        });

        if (username) {
            const q2 = await db.collection('Projects').where('createdBy', '==', username).get();
            q2.forEach(doc => {
                if (seen.has(doc.id)) return;
                seen.add(doc.id);
                allProjects.push({ id: doc.id, ...doc.data() });
            });
        }

        allProjects.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
        return allProjects;
    } catch (err) {
        console.error('Error loading projects:', err);
        throw err;
    }
}

/**
 * Saves a new project.
 */
export async function saveNewProject(name) {
    const userId = currentUser.uid || currentUser.id;
    await db.collection('Projects').add({
        name: name,
        userId: userId,
        createdBy: currentUser.username,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * Saves a new task.
 */
export async function saveTaskData(taskData) {
    const userId = currentUser.uid || currentUser.id;
    
    return await db.collection('Tasks').add({
        ...taskData,
        userId: userId,
        createdBy: currentUser.username,
        createdByDisplayName: currentUser.display_name || currentUser.username.split('@')[0],
        userEmail: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * Deletes a task by ID.
 */
export async function deleteTask(taskId) {
    await db.collection('Tasks').doc(taskId).delete();
}

/**
 * Updates an existing task.
 */
export async function updateTaskData(taskId, updateData) {
    await db.collection('Tasks').doc(taskId).update({
        ...updateData,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
}
