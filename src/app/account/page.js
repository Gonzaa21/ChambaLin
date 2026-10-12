"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/use-auth";

export default function AccountPage() {
    const { user, loading, signOut } = useAuth();
    const [error, setError] = useState("");

    async function handleSignOut() {
        try {
            setError("");
            await signOut();
            window.location.href = "/";
        } catch {
            setError("Unable to sign out. Please try again.");
        }
    }

    if (loading) {
        return <main className="auth-page">Loading your account...</main>;
    }

    if (!user) {
        return (
            <main className="auth-page">
                <section className="auth-card">
                    <h1>You're not signed in</h1>
                    <p className="auth-description">
                        Sign in to access your Chambalín account.
                    </p>
                    <Link className="auth-submit" href="/auth">
                        Sign in
                    </Link>
                    <p className="auth-back">
                        <Link href="/">Back to home</Link>
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link className="auth-brand" href="/">
                    chambalín<span>.</span>
                </Link>

                <p className="auth-eyebrow">YOUR ACCOUNT</p>
                <h1>Welcome back.</h1>
                <p className="auth-description">
                    You're signed in to Chambalín.
                </p>

                <div className="account-details">
                    <p><strong>Email address</strong></p>
                    <p>{user.email}</p>
                    <p><strong>User ID</strong></p>
                    <p>{user.id}</p>
                </div>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button
                    className="auth-submit"
                    type="button"
                    onClick={handleSignOut}
                >
                    Sign out
                </button>

                <Link className="auth-back" href="/">
                    Back to home
                </Link>
            </section>
        </main>
    );
}
