
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/use-auth";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState({
    full_name: "",
    location: "",
    bio: "",
    avatar_url: "",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setPageLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setPageLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, location, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError("Unable to load your profile. Please try again.");
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          location: data.location || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      }

      setPageLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const updates = {
        id: user.id,
        full_name: profile.full_name.trim(),
        location: profile.location.trim(),
        bio: profile.bio.trim(),
        avatar_url: profile.avatar_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;

      setMessage("Your profile has been saved.");
    } catch (err) {
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setError("");

    try {
      await signOut();
      window.location.href = "/";
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }

  if (loading || pageLoading) {
    return <main className="auth-page">Loading your profile...</main>;
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

  const avatarUrl = profile.avatar_url.trim();

  return (
    <main className="auth-page">
      <section className="auth-card account-card">
        <Link className="auth-brand" href="/">
          chambalín<span>.</span>
        </Link>

        <p className="auth-eyebrow">YOUR ACCOUNT</p>
        <h1>Your profile.</h1>
        <p className="auth-description">
          Tell the community a little about yourself.
        </p>

        <div className="account-avatar">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Your profile"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>
              {profile.full_name.trim().charAt(0).toUpperCase() || "C"}
            </span>
          )}
        </div>

        <form className="account-form" onSubmit={handleSave}>
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={profile.full_name}
            onChange={handleChange}
            maxLength={80}
            placeholder="Your full name"
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={profile.location}
            onChange={handleChange}
            maxLength={120}
            placeholder="e.g. Buenos Aires"
          />

          <label htmlFor="bio">About you</label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            placeholder="Tell others a little about yourself..."
          />

          <label htmlFor="avatar_url">Profile photo URL</label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            value={profile.avatar_url}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
          />

          <p className="account-email">
            <strong>Email address</strong>
            <span>{user.email}</span>
          </p>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="account-success" role="status">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>

        <button
          className="account-signout"
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
