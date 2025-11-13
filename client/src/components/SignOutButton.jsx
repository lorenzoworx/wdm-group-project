// src/components/SignOutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase';

export default function SignOutButton({ className = '' }) {
    const navigate = useNavigate();

    async function handleSignOut() {
        try {
            await signOutUser();
            // clear any app-specific session you kept
            localStorage.removeItem('userToken');
            // (optional) keep userType/userData if your UI needs them after logout:
            localStorage.removeItem('userType');
            localStorage.removeItem('userData');

            navigate('/login'); // or wherever your login route is
        } catch (e) {
            console.error('Sign out failed:', e);
            alert('Sign out failed. Please try again.');
        }
    }

    return (
        <button
            onClick={handleSignOut}
            className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 ${className}`}
        >
            Sign out
        </button>
    );
}
