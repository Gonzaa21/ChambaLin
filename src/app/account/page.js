
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
  const [myTasks, setMyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [taskActionLoading, setTaskActionLoading] = useState(false);
  const [taskActionMessage, setTaskActionMessage] = useState("");

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

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setMyTasks([]);
      setTasksLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMyTasks() {
      setTasksLoading(true);
      setTasksError("");

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          description,
          category_id,
          location,
          price,
          task_type,
          status,
          created_at,
          category:categories(name)
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setTasksError("Unable to load your tasks. Please try again.");
        setMyTasks([]);
      } else {
        setMyTasks(data || []);
      }

      setTasksLoading(false);
    }

    loadMyTasks();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (!error) {
        setCategories(data || []);
      }
    }

    loadCategories();
  }, []);

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

  function startEditing(task) {
    setTaskActionMessage("");
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      category_id: task.category_id ? String(task.category_id) : "",
      location: task.location || "",
      task_type: task.task_type || "paid",
      price: task.price == null ? "" : String(task.price),
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSaveTask(event, taskId) {
    event.preventDefault();
    setTaskActionMessage("");

    if (!user) return;

    const cleanTitle = editForm.title.trim();
    const cleanDescription = editForm.description.trim();
    const numericPrice = Number(editForm.price);

    if (cleanTitle.length < 5 || cleanDescription.length < 10) {
      setTaskActionMessage(
        "The title must have at least 5 characters and the description at least 10."
      );
      return;
    }

    if (
      editForm.task_type === "paid" &&
      (!editForm.price || !Number.isFinite(numericPrice) ||
        numericPrice <= 0 || numericPrice > 99999999)
    ) {
      setTaskActionMessage("Enter a valid budget greater than zero.");
      return;
    }

    setTaskActionLoading(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: cleanTitle,
          description: cleanDescription,
          category_id: editForm.category_id
            ? Number(editForm.category_id)
            : null,
          location: editForm.location.trim() || null,
          task_type: editForm.task_type,
          price: editForm.task_type === "paid" ? numericPrice : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .eq("owner_id", user.id)
        .eq("status", "open")
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "This task could not be updated. It may no longer be open, or you may not have permission."
        );
      }

      setMyTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                title: cleanTitle,
                description: cleanDescription,
                category_id: editForm.category_id
                  ? Number(editForm.category_id)
                  : null,
                category:
                  categories.find(
                    (category) =>
                      String(category.id) === editForm.category_id
                  ) || null,
                location: editForm.location.trim() || null,
                task_type: editForm.task_type,
                price: editForm.task_type === "paid" ? numericPrice : null,
                updated_at: new Date().toISOString(),
              }
            : task
        )
      );

      setEditingTaskId(null);
      setTaskActionMessage("Task updated successfully.");
    } catch (err) {
      setTaskActionMessage(err.message || "Unable to update this task.");
    } finally {
      setTaskActionLoading(false);
    }
  }

  async function handleCancelTask(taskId) {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this task? It will no longer be open for applications."
    );

    if (!confirmed) return;

    setTaskActionMessage("");
    setTaskActionLoading(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .eq("owner_id", user.id)
        .eq("status", "open")
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "This task could not be cancelled. It may no longer be open, or you may not have permission."
        );
      }

      setMyTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status: "cancelled" } : task
        )
      );

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }

      setTaskActionMessage("Task cancelled successfully.");
    } catch (err) {
      setTaskActionMessage(err.message || "Unable to cancel this task.");
    } finally {
      setTaskActionLoading(false);
    }
  }

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

        <section className="account-tasks">
          <div className="account-tasks-heading">
            <div>
              <p className="auth-eyebrow">YOUR ACTIVITY</p>
              <h2>My tasks</h2>
            </div>
                
            <Link href="/post-task" className="account-new-task">
              + Post a task
            </Link>
          </div>
                
          {tasksLoading ? (
            <p className="account-tasks-empty">Loading your tasks...</p>
          ) : tasksError ? (
            <p className="auth-error" role="alert">{tasksError}</p>
          ) : myTasks.length === 0 ? (
            <div className="account-tasks-empty">
              <p>You haven't posted any tasks yet.</p>
              <Link href="/post-task" className="button button-dark">
                Create your first task
              </Link>
            </div>
          ) : (
            <div className="account-task-list">
              {myTasks.map((task) => (
                <article className="account-task-item" key={task.id}>
                  <div className="account-task-top">
                    <span className="account-task-category">
                      {task.category?.name || "General"}
                    </span>

                    <span className={`account-task-status task-status-${task.status}`}>
                      {task.status}
                    </span>
                  </div>

                  {editingTaskId === task.id ? (
                    <form
                      className="account-task-edit-form"
                      onSubmit={(event) => handleSaveTask(event, task.id)}
                    >
                      <label>
                        Task title
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          required
                          minLength={5}
                          maxLength={120}
                        />
                      </label>
                  
                      <label>
                        Description
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          required
                          minLength={10}
                          maxLength={3000}
                          rows={5}
                        />
                      </label>
                  
                      <label>
                        Category
                        <select
                          name="category_id"
                          value={editForm.category_id}
                          onChange={handleEditChange}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                        
                      <label>
                        Location
                        <input
                          name="location"
                          value={editForm.location}
                          onChange={handleEditChange}
                          maxLength={150}
                        />
                      </label>
                        
                      <label>
                        Task type
                        <select
                          name="task_type"
                          value={editForm.task_type}
                          onChange={handleEditChange}
                        >
                          <option value="paid">Paid task</option>
                          <option value="volunteer">Volunteer opportunity</option>
                        </select>
                      </label>
                        
                      {editForm.task_type === "paid" && (
                        <label>
                          Budget (ARS)
                          <input
                            name="price"
                            type="number"
                            value={editForm.price}
                            onChange={handleEditChange}
                            min="0.01"
                            max="99999999"
                            step="0.01"
                            required
                          />
                        </label>
                      )}

                      <div className="account-task-actions">
                        <button
                          className="button button-dark"
                          type="submit"
                          disabled={taskActionLoading}
                        >
                          {taskActionLoading ? "Saving..." : "Save changes"}
                        </button>
                    
                        <button
                          className="button button-outline"
                          type="button"
                          disabled={taskActionLoading}
                          onClick={() => setEditingTaskId(null)}
                        >
                          Discard
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3>{task.title}</h3>
                  
                      <p className="account-task-description">{task.description}</p>
                  
                      <div className="account-task-meta">
                        <span>{task.location || "Location not specified"}</span>
                        <strong>
                          {task.task_type === "volunteer"
                            ? "Volunteer"
                            : `$${Number(task.price || 0).toLocaleString("en-US")}`}
                        </strong>
                      </div>
                          
                      <p className="account-task-date">
                        Posted {new Date(task.created_at).toLocaleDateString("en-GB")}
                      </p>
                          
                      {task.status === "open" && (
                        <div className="account-task-actions">
                          <button
                            className="button button-outline"
                            type="button"
                            disabled={taskActionLoading}
                            onClick={() => startEditing(task)}
                          >
                            Edit task
                          </button>
                      
                          <button
                            className="button button-cancel-task"
                            type="button"
                            disabled={taskActionLoading}
                            onClick={() => handleCancelTask(task.id)}
                          >
                            Cancel task
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
          {taskActionMessage && (
            <p className="account-task-feedback" role="status">
              {taskActionMessage}
            </p>
          )}
        </section>

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
