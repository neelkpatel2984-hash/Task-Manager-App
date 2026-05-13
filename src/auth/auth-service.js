// src/auth/auth-service.js
import { auth, db } from '../firebase/config';
import { toggleLoader, showToast } from '../ui/components';

export let currentUser = null;

export async function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    if (!username || !password) {
        showLoginError('Please enter username and password.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
    toggleLoader(true);

    try {
        // Method 1: Try Firebase Auth (Email/Password)
        try {
            const userCredential = await auth.signInWithEmailAndPassword(username, password);
            const user = userCredential.user;
            
            // Check if user exists in Users collection
            const userSnap = await db.collection('Users').doc(user.uid).get();
            
            let userData;
            if (userSnap.exists) {
                userData = userSnap.data();
            } else {
                // Create new user document
                userData = {
                    email: username,
                    display_name: user.displayName || username.split('@')[0],
                    is_admin: false,
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('Users').doc(user.uid).set(userData);
            }

            currentUser = {
                uid: user.uid,
                username: username,
                display_name: userData.display_name || username.split('@')[0],
                is_admin: userData.is_admin === true,
                email: username
            };

            localStorage.setItem('taskflow_user', JSON.stringify(currentUser));
            location.reload(); // Refresh to init app with new user

        } catch (authError) {
            // Method 2: Fallback to Custom Auth
            console.log('Firebase auth failed, trying custom auth...', authError.message);
            
            const snap = await db.collection('Users')
                .where('email', '==', username)
                .limit(1)
                .get();

            if (snap.empty) {
                // Auto-register new user
                const newUserRef = await db.collection('Users').add({
                    email: username,
                    password: password,
                    display_name: username.split('@')[0],
                    is_admin: false,
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });

                currentUser = {
                    id: newUserRef.id,
                    username: username,
                    display_name: username.split('@')[0],
                    is_admin: false,
                    email: username
                };
            } else {
                const userDoc = snap.docs[0].data();
                
                if (userDoc.password !== password) {
                    showLoginError('Invalid username or password.');
                    resetLoginBtn();
                    toggleLoader(false);
                    return;
                }

                currentUser = {
                    id: snap.docs[0].id,
                    username: userDoc.email || username,
                    display_name: userDoc.display_name || username.split('@')[0],
                    is_admin: userDoc.is_admin === true,
                    email: username
                };
            }

            localStorage.setItem('taskflow_user', JSON.stringify(currentUser));
            location.reload();
        }

    } catch (err) {
        console.error('Login error:', err);
        showLoginError('Connection error. Please try again.');
        resetLoginBtn();
        toggleLoader(false);
    }
}

export function showLoginError(msg) {
    const errDiv = document.getElementById('loginError');
    if (!errDiv) return;
    errDiv.textContent = msg;
    errDiv.classList.remove('d-none');
    setTimeout(() => errDiv.classList.add('d-none'), 4000);
}

export function resetLoginBtn() {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i>Login to Workspace';
}

export function logoutUser() {
    localStorage.removeItem('taskflow_user');
    currentUser = null;
    auth.signOut().catch(() => {});
    location.reload();
}

export function checkAuth() {
    const stored = localStorage.getItem('taskflow_user');
    if (stored) {
        try {
            currentUser = JSON.parse(stored);
            return currentUser;
        } catch (e) {
            localStorage.removeItem('taskflow_user');
        }
    }
    return null;
}

export function isAdminUser() {
    return !!(currentUser && currentUser.is_admin);
}
