"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function PublicProfilePage() {
  const params = useParams();
  const id = params.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, location, bio, avatar_url, created_at")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError("We couldn't load this profile. Please try again.");
      } else if (!data) {
        setError("This profile doesn't exist.");
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    if (id) loadProfile();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <main className="public-profile-page">Loading profile...</main>;
  }

  if (error || !profile) {
    return (
      <main className="public-profile-page">
        <section className="public-profile-card">
          <h1>Profile unavailable</h1>
          <p>{error || "This profile doesn't exist."}</p>
          <Link className="button button-dark" href="/">
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  const name = profile.full_name?.trim() || "Chambalín member";

  return (
    <main className="public-profile-page">
      <section className="public-profile-card">
        <Link className="auth-brand" href="/">
          chambalín<span>.</span>
        </Link>

        <p className="auth-eyebrow">COMMUNITY PROFILE</p>

        <div className="public-profile-avatar">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={`${name}'s profile`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <h1>{name}</h1>

        {profile.location && (
          <p className="public-profile-location">
            <span aria-hidden="true">⌖ </span>
            {profile.location}
          </p>
        )}

        <div className="public-profile-bio">
          <h2>About</h2>
          <p>{profile.bio || "This member hasn't added a bio yet."}</p>
        </div>

        <Link className="button button-dark" href="/">
          Explore tasks
        </Link>
      </section>
    </main>
  );
}
