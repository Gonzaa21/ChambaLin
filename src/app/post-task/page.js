"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/use-auth";

export default function PostTaskPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [taskType, setTaskType] = useState("paid");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        setError("Unable to load categories. Please refresh the page.");
        return;
      }

      setCategories(data ?? []);
    }

    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please sign in before publishing a task.");
      return;
    }

    if (taskType === "paid" && (!price || Number(price) < 0)) {
      setError("Enter a valid price for this task.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId ? Number(categoryId) : null,
          location: location.trim() || null,
          task_type: taskType,
          price: taskType === "paid" ? Number(price) : null,
          status: "open",
        })
        .select("id")
        .single();

      if (error) throw error;

      setSuccess("Your task has been published successfully.");

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to publish your task.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <main className="auth-page">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Sign in to publish a task</h1>
          <p className="auth-description">
            You need an account to publish opportunities on Chambalín.
          </p>
          <Link className="auth-submit" href="/auth">
            Sign in
          </Link>
          <Link className="auth-back" href="/">
            Back to home
          </Link>
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

        <p className="auth-eyebrow">SHARE AN OPPORTUNITY</p>
        <h1>Post a task</h1>
        <p className="auth-description">
          Tell your community what you need help with.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">
            Task title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Help assemble a bookshelf"
              required
              minLength={5}
              maxLength={120}
            />
          </label>

          <label className="auth-label">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the task and what you need..."
              required
              minLength={10}
              maxLength={3000}
              rows={5}
            />
          </label>

          <label className="auth-label">
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="auth-label">
            Location
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Palermo, Buenos Aires"
              maxLength={150}
              required
            />
          </label>

          <label className="auth-label">
            Task type
            <select
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              required
            >
              <option value="paid">Paid task</option>
              <option value="volunteer">Volunteer opportunity</option>
            </select>
          </label>

          {taskType === "paid" && (
            <label className="auth-label">
              Budget (ARS)
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. 10000"
                min="0.01"
                max="99999999"
                step="0.01"
                required
              />
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-message" role="status">
              {success}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading || categories.length === 0}
          >
            {loading ? "Publishing..." : "Publish task"}
          </button>
        </form>

        <Link className="auth-back" href="/">
          Cancel and return home
        </Link>
      </section>
    </main>
  );
}
