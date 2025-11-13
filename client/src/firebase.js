import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,              // <-- add this
} from 'firebase/auth';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC2lKBZ_nKV4WF8yQeWj9k2Jla8iB5YrfQ",
    authDomain: "wdmpro-fabb5.firebaseapp.com",
    projectId: "wdmpro-fabb5",
    storageBucket: "wdmpro-fabb5.firebasestorage.app",
    messagingSenderId: "54318641855",
    appId: "1:54318641855:web:411ce5356db0cdb4c0cc0a",
    measurementId: "G-85Q1Q7G07G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export function signUpEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}
export function signInEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
export function signOutUser() {
    return signOut(auth);
}
export function onUserChanged(cb) {
    return onAuthStateChanged(auth, cb);
}
export function setDisplayName(name) {    // <-- add this
    if (!auth.currentUser) return Promise.resolve();
    return updateProfile(auth.currentUser, { displayName: name });
}
export { auth };