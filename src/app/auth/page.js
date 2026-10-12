"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setMessage("Your account has been created successfully.");
        } else {
          setMessage(
            "Account created. Check your email to confirm your account."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("You are now signed in.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="auth-brand" href="/">
          chambalín<span>.</span>
        </a>

        <p className="auth-eyebrow">
          {mode === "signup" ? "JOIN THE COMMUNITY" : "WELCOME BACK"}
        </p>

        <h1>
          {mode === "signup"
            ? "Create your account"
            : "Good to see you again."}
        </h1>

        <p className="auth-description">
          {mode === "signup"
            ? "Connect with people and discover opportunities around you."
            : "Sign in to continue with Chambalín."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="auth-label">
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                maxLength={100}
              />
            </label>
          )}

          <label className="auth-label">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              minLength={8}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signup"
            ? "Already have an account?"
            : "New to Chambalín?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setMessage("");
              setError("");
            }}
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>

        <a className="auth-back" href="/">
          ← Back to home
        </a>
      </section>
    </main>
  );
}
