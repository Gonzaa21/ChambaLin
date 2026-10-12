"use client";

import { useMemo, useState } from "react";

const categories = [
  { name: "All", icon: "✳" },
  { name: "Home", icon: "⌂" },
  { name: "Repairs", icon: "⌁" },
  { name: "Lessons", icon: "▤" },
  { name: "Pets", icon: "♡" },
  { name: "Errands", icon: "↗" },
  { name: "Tech", icon: "⌘" },
];

const jobs = [
  { id: 1, title: "Assemble a desk", category: "Home", price: "$18,000", unit: "per job", location: "Villa Urquiza", distance: "1.2 km", time: "Today · Flexible", initials: "LM", person: "Lucía M.", rating: "4.9", reviews: 18, color: "peach", description: "I bought a desk and need a hand assembling it. I already have all the parts and basic tools.", tags: ["Furniture", "1–2 hours"] },
  { id: 2, title: "Walk my dog", category: "Pets", price: "$6,000", unit: "per walk", location: "Belgrano", distance: "2.1 km", time: "Tomorrow · 10:00 AM", initials: "FR", person: "Facundo R.", rating: "5.0", reviews: 12, color: "mint", description: "Looking for a responsible person to walk Milo, a medium-sized and very calm dog, for 45 minutes.", tags: ["Dogs", "45 min"] },
  { id: 3, title: "Fix a faucet", category: "Repairs", price: "To be agreed", unit: "depending on task", location: "Colegiales", distance: "2.8 km", time: "This week", initials: "CP", person: "Carla P.", rating: "4.8", reviews: 26, color: "blue", description: "The kitchen faucet is leaking water. I would like to arrange a visit to check and fix the issue.", tags: ["Plumbing", "Home"] },
  { id: 4, title: "Math tutoring", category: "Lessons", price: "$8,500", unit: "per hour", location: "Núñez", distance: "3.4 km", time: "To be scheduled", initials: "TG", person: "Tomás G.", rating: "5.0", reviews: 9, color: "lilac", description: "Need tutoring to prepare for a high school math exam. Ideally one or two sessions this week.", tags: ["High School", "Online or in-person"] },
  { id: 5, title: "Install a printer", category: "Tech", price: "$10,000", unit: "estimated", location: "Saavedra", distance: "3.9 km", time: "Today · Afternoon", initials: "MS", person: "Martín S.", rating: "4.7", reviews: 14, color: "yellow", description: "Need to connect a Wi-Fi printer to a laptop and set it up ready to print.", tags: ["Computing", "1 hour"] },
  { id: 6, title: "Run a few errands", category: "Errands", price: "$5,000", unit: "per task", location: "Villa Devoto", distance: "4.2 km", time: "Tomorrow", initials: "AV", person: "Ana V.", rating: "4.9", reviews: 21, color: "pink", description: "Looking for help picking up a package and buying a couple of things nearby.", tags: ["Shopping", "Nearby"] },
];

function Icon({ children, className = "" }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPublish, setShowPublish] = useState(false);
  const [saved, setSaved] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesCategory = category === "All" || job.category === category;
      const text = `${job.title} ${job.category} ${job.location} ${job.description}`.toLowerCase();
      return matchesCategory && text.includes(query.toLowerCase().trim());
    });
    if (sort === "price") result = [...result].sort((a, b) => parseInt(a.price.replace(/\D/g, "") || "999999") - parseInt(b.price.replace(/\D/g, "") || "999999"));
    if (sort === "rating") result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
    return result;
  }, [query, category, sort]);

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
          <button className="text-button saved-link" onClick={() => { setCategory("All"); setQuery(""); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>
            <Icon>♡</Icon> Saved {saved.length > 0 && <span className="saved-count">{saved.length}</span>}
          </button>
          <button className="button button-dark button-small" onClick={() => setShowPublish(true)}><span>＋</span> Post a task</button>
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
            <input value={query} onChange={(e) => { setQuery(e.target.value); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} placeholder="e.g. fix a faucet, walk the dog..." aria-label="Search tasks" />
            <button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Search <span>↗</span></button>
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

      <section className="category-section" id="explore">
        <div className="section-heading category-heading">
          <div><span className="section-kicker">FIND YOUR GIG</span><h2>What do you need done?</h2></div>
          <span className="subtle-note">Select a category to get started</span>
        </div>
        <div className="category-list">
          {categories.map((item) => <button key={item.name} onClick={() => setCategory(item.name)} className={`category-pill ${category === item.name ? "category-selected" : ""}`}><span className="category-icon">{item.icon}</span>{item.name}</button>)}
        </div>
      </section>

      <section className="jobs-section">
        <div className="section-heading jobs-heading">
          <div><span className="section-kicker">OPPORTUNITIES NEAR YOU</span><h2>{query ? "Search results" : category === "All" ? "Tasks to solve" : `${category} tasks`} <span className="result-count">{filteredJobs.length}</span></h2></div>
          <label className="sort-control">Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="rating">Top rated</option><option value="price">Estimated price</option></select><span>⌄</span></label>
        </div>
        {filteredJobs.length ? <div className="jobs-grid">
          {filteredJobs.map((job) => <article className="job-card" key={job.id}>
            <div className={`job-visual ${job.color}`}>
              <span className="job-category">{job.category}</span>
              <button className={`save-button ${saved.includes(job.id) ? "is-saved" : ""}`} aria-label={saved.includes(job.id) ? "Remove from saved" : "Save task"} onClick={() => toggleSaved(job.id)}>{saved.includes(job.id) ? "♥" : "♡"}</button>
              <div className="visual-symbol">{job.category === "Home" ? "⌂" : job.category === "Pets" ? "♡" : job.category === "Repairs" ? "⌁" : job.category === "Lessons" ? "▤" : job.category === "Tech" ? "⌘" : "↗"}</div>
              <span className="visual-caption">CHAMBALÍN <span>·</span> NEAR YOU</span>
            </div>
            <div className="job-content">
              <div className="job-meta"><span><Icon>⌖</Icon> {job.location}</span><span className="meta-dot">·</span><span>{job.distance}</span></div>
              <h3>{job.title}</h3>
              <div className="job-time"><Icon>◷</Icon> {job.time}</div>
              <div className="job-card-bottom"><div className="price"><strong>{job.price}</strong><span>{job.unit}</span></div><div className="rating"><span>★</span> {job.rating} <small>({job.reviews})</small></div></div>
              <div className="card-divider"></div>
              <div className="job-poster"><span className={`poster-avatar ${job.color}`}>{job.initials}</span><span className="poster-name">{job.person}<small>Posted a task</small></span><button className="arrow-button" onClick={() => setSelectedJob(job)} aria-label={`View ${job.title}`}>↗</button></div>
              <button className="card-open" onClick={() => setSelectedJob(job)}>View task <span>→</span></button>
            </div>
          </article>)}
        </div> : <div className="empty-state"><span>⌕</span><h3>No tasks found around here</h3><p>Try a different search query or select another category.</p><button className="button button-dark" onClick={() => { setQuery(""); setCategory("All"); }}>View all tasks</button></div>}
        <div className="load-more-wrap"><button className="button button-outline" onClick={() => { setQuery(""); setCategory("All"); setSort("recommended"); }}>Explore all tasks <span>↗</span></button></div>
      </section>

      <section className="trust-strip" id="how-it-works">
        <div className="trust-intro"><span className="section-kicker">SIMPLER. CLOSER.</span><h2>A helping hand nearby<br />can change your day.</h2><p>Chambalín connects what you need with people who can help.</p></div>
        <div className="trust-step"><span className="step-number">01</span><div className="step-icon">⌕</div><h3>Find</h3><p>Search by task, category, or area.</p></div>
        <div className="trust-step"><span className="step-number">02</span><div className="step-icon">↔</div><h3>Connect</h3><p>Chat and agree on price and schedule.</p></div>
        <div className="trust-step"><span className="step-number">03</span><div className="step-icon">✳</div><h3>Share your experience</h3><p>Leave a review after completing the task.</p></div>
      </section>

      <footer className="footer" id="community"><a className="brand footer-brand" href="#"><span className="brand-mark"><span></span><span></span><span></span></span><span>chambalín<span className="brand-dot">.</span></span></a><span>Small tasks, real solutions.</span><span className="footer-right">© Copyright 2026 <span>|</span> ChambaLín</span></footer>

      {selectedJob && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedJob(null); }}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="modal-close" onClick={() => setSelectedJob(null)} aria-label="Close">×</button>
        <div className={`detail-visual ${selectedJob.color}`}><span className="job-category">{selectedJob.category}</span><div className="visual-symbol">{selectedJob.category === "Pets" ? "♡" : selectedJob.category === "Repairs" ? "⌁" : "✳"}</div></div>
        <div className="detail-body"><div className="job-meta"><Icon>⌖</Icon> {selectedJob.location} · {selectedJob.distance}</div><h2 id="detail-title">{selectedJob.title}</h2><div className="detail-price">{selectedJob.price} <small>{selectedJob.unit}</small></div><p>{selectedJob.description}</p><div className="detail-tags">{selectedJob.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="detail-person"><span className={`poster-avatar ${selectedJob.color}`}>{selectedJob.initials}</span><span><b>{selectedJob.person}</b><small>★ {selectedJob.rating} · {selectedJob.reviews} reviews</small></span><span className="profile-note">Sample profile</span></div><div className="notice"><span>ⓘ</span><p>Before agreeing on a task, confirm details, price, and terms. Ratings offer guidance but do not guarantee safety.</p></div><button className="button button-dark button-wide" onClick={() => alert("This is a demo preview. Direct contact will be implemented in a future release.")}>I'm interested in this task <span>↗</span></button></div>
      </section></div>}

      {showPublish && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowPublish(false); }}><section className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title"><button className="modal-close" onClick={() => setShowPublish(false)} aria-label="Close">×</button><span className="section-kicker">YOUR TASK, UNDERWAY</span><h2 id="publish-title">What do you need to solve?</h2><p>This initial version is a visual demonstration. Task posting will be enabled in an upcoming release.</p><label>Task name<input placeholder="e.g. Need to paint a room" /></label><label>Category<select defaultValue=""><option value="" disabled>Select a category</option>{categories.slice(1).map(c => <option key={c.name}>{c.name}</option>)}</select></label><label>Approximate location<input placeholder="e.g. Brooklyn, NY" /></label><button className="button button-dark button-wide" onClick={() => setShowPublish(false)}>Got it <span>✓</span></button></section></div>}
    </main>
  );
}