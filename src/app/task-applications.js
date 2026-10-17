"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/use-auth";

export default function TaskApplications({ task, onClose }) {
  const { user, loading: authLoading } = useAuth();

  const [message, setMessage] = useState("");
  const [application, setApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);

  const isOwner = Boolean(user && user.id === task.ownerId);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setError("");

      if (!user) {
        setApplication(null);
        setApplications([]);
        setLoading(false);
        return;
      }

      if (isOwner) {
        const { data, error: queryError } = await supabase
          .from("applications")
          .select(`
            id,
            message,
            status,
            created_at,
            applicant:profiles!applications_applicant_id_fkey (
              id,
              full_name,
              avatar_url,
              location
            )
          `)
          .eq("task_id", task.id)
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (queryError) {
          setError("Unable to load applications. Please try again.");
        } else {
          setApplications(data || []);
        }
      } else {
        const { data, error: queryError } = await supabase
          .from("applications")
          .select("id, message, status, created_at")
          .eq("task_id", task.id)
          .eq("applicant_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (queryError) {
          setError("Unable to check your application. Please try again.");
        } else {
          setApplication(data);
        }
      }

      if (!cancelled) setLoading(false);
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [task.id, user, authLoading, isOwner]);

  async function handleApply(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!user) {
      setError("Please sign in before applying.");
      return;
    }

    if (user.id === task.ownerId) {
      setError("You cannot apply to your own task.");
      return;
    }

    if (!message.trim()) {
      setError("Please write a short message.");
      return;
    }

    setSubmitting(true);

    const { data, error: insertError } = await supabase
      .from("applications")
      .insert({
        task_id: task.id,
        applicant_id: user.id,
        message: message.trim(),
        status: "pending",
      })
      .select("id, message, status, created_at")
      .single();

    setSubmitting(false);

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You have already applied to this task.");
      } else {
        setError(insertError.message || "Unable to submit your application.");
      }
      return;
    }

    setApplication(data);
    setMessage("");
    setNotice("Your application has been submitted.");
  }

  async function handleDecision(applicationId, status) {
    if (decisionLoading) return;
    if (status !== "accepted" && status !== "rejected") return;

    setDecisionLoading(true);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase.rpc(
        "decide_application",
        {
          p_application_id: applicationId,
          p_decision: status,
        }
      );

      if (updateError) {
        setError(
          updateError.message ||
            "Unable to update this application. Please try again."
        );
        return;
      }

      setApplications((current) =>
        current.map((item) => {
          if (item.id === applicationId) {
            return { ...item, status };
          }

          if (status === "accepted" && item.status === "pending") {
            return { ...item, status: "rejected" };
          }

          return item;
        })
      );

      setNotice(
        status === "accepted"
          ? "Application accepted. The task has been assigned."
          : "Application rejected."
      );
    } finally {
      setDecisionLoading(false);
    }
  }

  return (
    <section className="task-applications">
      {authLoading || loading ? (
        <p>Loading applications...</p>
      ) : !user ? (
        <div>
          <h3>Interested in this task?</h3>
          <p>Sign in to send an application to the task owner.</p>
          <Link className="button button-dark button-wide" href="/auth">
            Sign in to apply
          </Link>
        </div>
      ) : isOwner ? (
        <div>
          <h3>Applications ({applications.length})</h3>

          {applications.length === 0 ? (
            <p>No applications yet. Check back later.</p>
          ) : (
            <div className="application-list">
              {applications.map((item) => (
                <article className="application-item" key={item.id}>
                <div className="application-heading">
                  <Link
                    href={
                      item.applicant?.id
                        ? `/profile/${item.applicant.id}`
                        : "#"
                    }
                    className="application-applicant-profile"
                    onClick={(event) => {
                      if (!item.applicant?.id) event.preventDefault();
                    }}
                    aria-label={`View ${
                      item.applicant?.full_name || "Chambalín User"
                    }'s profile`}
                  >
                    {item.applicant?.avatar_url ? (
                      <img
                        src={item.applicant.avatar_url}
                        alt=""
                        className="application-applicant-avatar"
                      />
                    ) : (
                      <span className="application-applicant-avatar application-applicant-initial">
                        {(item.applicant?.full_name || "C")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                
                    <strong>
                      {item.applicant?.full_name || "Chambalín User"}
                    </strong>
                  </Link>
                  
                  <span
                    className={`application-status status-${item.status}`}
                  >
                    {item.status}
                  </span>
                </div>

                  <p>{item.message}</p>

                  {item.status === "pending" && (
                    <div className="application-actions">
                      <button
                        type="button"
                        className="button button-dark"
                        disabled={decisionLoading}
                        onClick={() => handleDecision(item.id, "accepted")}
                      >
                        {decisionLoading ? "Processing..." : "Accept"}
                      </button>
                      <button
                        type="button"
                        className="button button-outline"
                        disabled={decisionLoading}
                        onClick={() => handleDecision(item.id, "rejected")}
                      >
                        {decisionLoading ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      ) : application ? (
        <div>
          <h3>You've applied to this task</h3>
          <p>{application.message}</p>
          <span className={`application-status status-${application.status}`}>
            {application.status}
          </span>
        </div>
      ) : (
        <form onSubmit={handleApply}>
          <h3>Interested in this task?</h3>
          <p>Tell the task owner briefly how you can help.</p>

          <label className="application-label" htmlFor="application-message">
            Your message
          </label>
          <textarea
            id="application-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Hi! I can help with this task because..."
            rows={4}
            maxLength={1000}
            required
          />

          <button
            type="submit"
            className="button button-dark button-wide"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Submit application"}
            {!submitting && <span>↗</span>}
          </button>
        </form>
      )}

      {error && <p className="application-error" role="alert">{error}</p>}
      {notice && <p className="application-notice" role="status">{notice}</p>}

      <button type="button" className="application-close" onClick={onClose}>
        Close
      </button>
    </section>
  );
}
