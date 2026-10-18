"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import TaskApplications from "./task-applications";
import Link from "next/link";
import { useAuth } from "../lib/use-auth";

const categories = [
  { name: "All", icon: "✳" },
  { name: "Home & Repairs", icon: "⌂" },
  { name: "Lessons", icon: "▤" },
  { name: "Pets", icon: "♡" },
  { name: "Errands", icon: "↗" },
  { name: "Tech", icon: "⌘" },
  { name: "Other", icon: "＋" },
];

const categoryLabels = {
  "home-repairs": "Home & Repairs",
  "private-lessons": "Lessons",
  pets: "Pets",
  errands: "Errands",
  technology: "Tech",
  "other-services": "Other",
};

const categoryColors = {
  "Home & Repairs": "peach",
  Lessons: "lilac",
  Pets: "mint",
  Errands: "pink",
  Tech: "yellow",
  Other: "blue",
};

function formatPrice(task) {
  if (task.task_type === "volunteer") return "Volunteer";
  if (task.price === null || task.price === undefined) return "TBD";
  return `$${Number(task.price).toLocaleString("en-US")}`;
}

function formatPublishedDate(value) {
  if (!value) return "Recently posted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

function toJob(task) {
  const category = categoryLabels[task.category?.slug] || task.category?.name || "Other";
  const person = task.owner?.full_name?.trim() || "Chambalín User";
  const initials = person
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "CH";

  return {
    id: task.id,
    title: task.title,
    ownerId: task.owner_id,
    avatarUrl: task.owner?.avatar_url || "",
    category,
    price: formatPrice(task),
    unit: task.task_type === "volunteer" ? "unpaid" : task.price == null ? "price TBD" : "per task",
    location: task.location || task.owner?.location || "Location not specified",
    time: formatPublishedDate(task.created_at),
    initials,
    person,
    color: categoryColors[category] || "mint",
    description: task.description,
    tags: [task.task_type === "volunteer" ? "Volunteer" : "Service", category],
    taskType: task.task_type,
    createdAt: task.created_at,
  };
}

function Icon({ children, className = "" }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>;
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPublish, setShowPublish] = useState(false);
  const [saved, setSaved] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { user } = useAuth();
  const [accountProfile, setAccountProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setLoadingJobs(true);
      setJobsError("");

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id, owner_id, title, description, location, price, task_type, status, created_at,
          category:categories(name, slug),
          owner:profiles(id, full_name, location, avatar_url)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error loading Chambalín tasks:", error.message);
        setJobsError("We couldn't load the tasks. Please try refreshing the page.");
        setJobs([]);
      } else {
        setJobs((data || []).map(toJob));
      }

      setLoadingJobs(false);
    }

    loadTasks();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAccountProfile() {
      if (!user) {
        setAccountProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setAccountProfile(error ? null : data);
      }
    }

    loadAccountProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesCategory = category === "All" || job.category === category;
      const text = `${job.title} ${job.category} ${job.location} ${job.description}`.toLowerCase();
      return matchesCategory && text.includes(query.toLowerCase().trim());
    });
    if (sort === "price") result = [...result].sort((a, b) => parseInt(a.price.replace(/\D/g, "") || "999999") - parseInt(b.price.replace(/\D/g, "") || "999999"));
    if (sort === "recent") result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [jobs, query, category, sort]);

  const toggleSaved = (id) => setSaved((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Chambalín, home">
          <span className="brand-mark"><span></span><span></span><span></span></span>
          <span>chambalín<span className="brand-dot">.</span></span>
        </a>
        <nav className={`nav-links ${mobileMenu ? "nav-open" : ""}`}>
          <a className="nav-active" href="#explore">Explore</a>
          <a href="#how-it-works">How it works</a>
          <a href="#community">Community</a>
        </nav>
        <div className="header-actions">
          <button className="text-button saved-link" onClick={() => { setCategory("All"); setQuery(""); document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth" }); }}>
            <Icon>♡</Icon> Saved {saved.length > 0 && <span className="saved-count">{saved.length}</span>}
          </button>
          <Link href="/post-task" className="button button-dark button-small"><span>＋</span> Post a task</Link>
          {user ? (<Link href="/account" className="header-profile" aria-label="Open your profile" title={accountProfile?.full_name || "Your profile"}>{accountProfile?.avatar_url ? ( <img src={accountProfile.avatar_url} alt=""/>) : (<span> {(accountProfile?.full_name || user.email || "U").trim().charAt(0).toUpperCase()}</span>)}</Link>) : (<Link className="button button-outline button-small" href="/auth">Sign in</Link>)}
        </div>
        <button className="menu-toggle" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? "×" : "☰"}</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"></span> GOOD THINGS HAPPEN NEARBY</div>
          <h1>What do you need<br />to solve <span>today?</span></h1>
          <p>Find someone reliable for those small things that make a big difference.</p>
          <div className="hero-search">
            <Icon>⌕</Icon>
            <input value={query} onChange={(e) => { setQuery(e.target.value); document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} placeholder="e.g. fix a faucet, walk the dog..." aria-label="Search tasks" />
            <button onClick={() => document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth" })}>Search <span>↗</span></button>
          </div>
          <div className="hero-footnote"><Icon>⌖</Icon> Services in your area <span className="footnote-separator">·</span> Real people, real tasks</div>
        </div>
        <div className="hero-art" aria-label="Decorative illustration of tools and community">
          <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="art-sun"></div>
          <div className="art-card art-card-top"><span className="mini-icon mint-bg">⌂</span><span><b>Small tasks</b><small>Big solutions</small></span><span className="art-check">✓</span></div>
          <div className="art-person person-back"><div className="person-head"></div><div className="person-body"></div></div>
          <div className="art-person person-front"><div className="person-head"></div><div className="person-body"></div></div>
          <div className="art-tool tool-one">⌁</div><div className="art-tool tool-two">✳</div>
          <div className="art-card art-card-bottom"><span className="avatar-stack"><i>J</i><i>M</i><i>+</i></span><span><b>Your community helps you</b><small>It all starts with connecting</small></span></div>
          <div className="art-sticker">DONE<br />NEARBY <span>↗</span></div>
        </div>
      </section>

      <section className="category-section" id="explorar">
        <div className="section-heading category-heading">
          <div><span className="section-kicker">FIND YOUR GIG</span><h2>What do you need done?</h2></div>
        </div>
        <div className="category-list">
          {categories.map((item) => <button key={item.name} onClick={() => setCategory(item.name)} className={`category-pill ${category === item.name ? "category-selected" : ""}`}><span className="category-icon">{item.icon}</span>{item.name}</button>)}
        </div>
      </section>

      <section className="jobs-section">
        <div className="section-heading jobs-heading">
          <div><span className="section-kicker">OPPORTUNITIES NEAR YOU</span><h2>{query ? "Search results" : category === "All" ? "Tasks to solve" : `${category} tasks`} <span className="result-count">{filteredJobs.length}</span></h2></div>
          <label className="sort-control">Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="recent">Most recent</option><option value="price">Estimated price</option></select><span>⌄</span></label>
        </div>
        {loadingJobs ? <div className="empty-state"><span>◷</span><h3>Loading tasks...</h3><p>We are searching for posts on Chambalín.</p></div> : jobsError ? <div className="empty-state"><span>!</span><h3>We couldn't load the tasks</h3><p>{jobsError}</p><button className="button button-dark" onClick={() => window.location.reload()}>Try again</button></div> : filteredJobs.length ? <div className="jobs-grid">
          {filteredJobs.map((job) => <article className="job-card" key={job.id}>
            <div className={`job-visual ${job.color}`}>
              <span className="job-category">{job.category}</span>
              <button className={`save-button ${saved.includes(job.id) ? "is-saved" : ""}`} aria-label={saved.includes(job.id) ? "Remove from saved" : "Save task"} onClick={() => toggleSaved(job.id)}>{saved.includes(job.id) ? "♥" : "♡"}</button>
              <div className="visual-symbol">{job.category === "Home & Repairs" ? "⌂" : job.category === "Pets" ? "♡" : job.category === "Repairs" ? "⌁" : job.category === "Lessons" ? "▤" : job.category === "Tech" ? "⌘" : "↗"}</div>
              <span className="visual-caption">CHAMBALÍN <span>·</span> NEAR YOU</span>
            </div>
            <div className="job-content">
              <div className="job-meta"><span><Icon>⌖</Icon> {job.location}</span></div>
              <h3>{job.title}</h3>
              <div className="job-time"><Icon>◷</Icon> {job.time}</div>
              <div className="job-card-bottom"><div className="price"><strong>{job.price}</strong><span>{job.unit}</span></div><div className="rating"><span>•</span> {job.taskType === "volunteer" ? "Volunteer" : "Available"}</div></div>
              <div className="card-divider"></div>
              <div className="job-poster"><Link href={`/profile/${job.ownerId}`} className="job-poster-profile" aria-label={`View ${job.person}'s profile`}>{job.avatarUrl ? (<img className="poster-avatar" src={job.avatarUrl} alt=""/> ) : ( <span className={`poster-avatar ${job.color}`}>{job.initials}</span>)}<span className="poster-name">{job.person}<small>Posted a task</small></span></Link><button className="arrow-button" onClick={() => setSelectedJob(job)} aria-label={`View ${job.title}`}>↗</button></div>
              <button className="card-open" onClick={() => setSelectedJob(job)}>View task <span>→</span></button>
            </div>
          </article>)}
        </div> : <div className="empty-state"><span>⌕</span><h3>No tasks found around here</h3><p>Try a different search query or select another category.</p><button className="button button-dark" onClick={() => { setQuery(""); setCategory("All"); }}>View all tasks</button></div>}
        <div className="load-more-wrap"><button className="button button-outline" onClick={() => { setQuery(""); setCategory("All"); setSort("recommended"); }}>Explore all tasks <span>↗</span></button></div>
      </section>

      <section className="trust-strip" id="como-funciona">
        <div className="trust-intro"><span className="section-kicker">SIMPLER. CLOSER.</span><h2>A helping hand nearby<br />can change your day.</h2><p>Chambalín connects what you need with people who can help.</p></div>
        <div className="trust-step"><span className="step-number">01</span><div className="step-icon">⌕</div><h3>Find</h3><p>Search by task, category, or area.</p></div>
        <div className="trust-step"><span className="step-number">02</span><div className="step-icon">↔</div><h3>Connect</h3><p>Chat and agree on price and schedule.</p></div>
        <div className="trust-step"><span className="step-number">03</span><div className="step-icon">✳</div><h3>Share your experience</h3><p>Leave a review after completing the task.</p></div>
      </section>

      <footer className="footer" id="comunidad"><a className="brand footer-brand" href="#"><span className="brand-mark"><span></span><span></span><span></span></span><span>chambalín<span className="brand-dot">.</span></span></a><span>Small tasks, real solutions.</span><span className="footer-right">Made to connect <span>♥</span> nearby.</span></footer>

      {selectedJob && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedJob(null); }}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="modal-close" onClick={() => setSelectedJob(null)} aria-label="Close">×</button>
        <div className={`detail-visual ${selectedJob.color}`}><span className="job-category">{selectedJob.category}</span><div className="visual-symbol">{selectedJob.category === "Pets" ? "♡" : selectedJob.category === "Repairs" ? "⌁" : "✳"}</div></div>
        <div className="detail-body"><div className="job-meta"><Icon>⌖</Icon> {selectedJob.location}</div><h2 id="detail-title">{selectedJob.title}</h2><div className="detail-price">{selectedJob.price} <small>{selectedJob.unit}</small></div><p>{selectedJob.description}</p><div className="detail-tags">{selectedJob.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="detail-person"><span className={`poster-avatar ${selectedJob.color}`}>{selectedJob.initials}</span><span><b>{selectedJob.person}</b><small>Posted this task on Chambalín</small></span><span className="profile-note">Profile</span></div><TaskApplications task={selectedJob}onClose={() => setSelectedJob(null)}/><div className="notice"><span>ⓘ</span><p>Before agreeing on a task, confirm details, price, and terms. Do not share unnecessary personal data and coordinate responsibly.</p></div></div>
      </section></div>}

      {showPublish && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowPublish(false); }}><section className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title"><button className="modal-close" onClick={() => setShowPublish(false)} aria-label="Close">×</button><span className="section-kicker">YOUR TASK, UNDERWAY</span><h2 id="publish-title">What do you need to solve?</h2><p>Task posting will be enabled once login and registration are implemented.</p><label>Task name<input placeholder="e.g. Need to paint a room" /></label><label>Category<select defaultValue=""><option value="" disabled>Select a category</option>{categories.slice(1).map(c => <option key={c.name}>{c.name}</option>)}</select></label><label>Approximate location<input placeholder="e.g. Brooklyn, NY" /></label><button className="button button-dark button-wide" onClick={() => setShowPublish(false)}>Got it <span>✓</span></button></section></div>}
    </main>
  );
}