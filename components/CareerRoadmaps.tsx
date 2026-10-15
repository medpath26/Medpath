"use client";

import { useState } from "react";
import { careerRoadmaps } from "@/lib/career-roadmaps";
import { healthcarePathways } from "@/lib/healthcare-pathways";

const allRoadmaps = [...careerRoadmaps].sort((a, b) => a.title.localeCompare(b.title));

export function CareerRoadmaps() {
  const [roadmapTitle, setRoadmapTitle] = useState(allRoadmaps[0]?.title ?? "");
  const roadmap = allRoadmaps.find((item) => item.title === roadmapTitle);
  const missing = healthcarePathways.filter((path) => !careerRoadmaps.some((item) => item.title === path.label));

  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Explorer</p>
        <h2>Career Roadmaps</h2>
        <p>Explore the steps from training to certification, licensure, and career growth across all {healthcarePathways.length} MedPath pathways.</p>
      </div>
      <section className="panel" aria-label="Career roadmaps">
        <label htmlFor="career-roadmap-choice">Choose your healthcare career</label>
        <select id="career-roadmap-choice" value={roadmapTitle} onChange={(event) => setRoadmapTitle(event.target.value)}
          style={{ display: "block", width: "100%", maxWidth: "36rem", margin: "0.75rem 0 1.5rem" }}>
          {allRoadmaps.map((item) => <option key={item.title} value={item.title}>{item.title}</option>)}
        </select>
        {roadmap && (
          <div>
            <h3>{roadmap.title}</h3>
            <ol style={{ display: "grid", gap: "1.25rem", paddingLeft: "1.5rem", marginTop: "1.25rem" }}>
              {roadmap.steps.map((step, index) => (
                <li key={index}><strong>{step.heading}</strong><p>{step.detail}</p></li>
              ))}
            </ol>
            <h3 style={{ marginTop: "1.75rem" }}>Specialties and career directions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
              {roadmap.specialties.map((specialty) => <span className="plan-pill" key={specialty}>{specialty}</span>)}
            </div>
          </div>
        )}
        {missing.length > 0 && <p role="status">Additional roadmaps in preparation: {missing.map((path) => path.label).join(", ")}</p>}
        <p className="career-data-note" style={{ marginTop: "1.5rem" }}>
          Roadmaps are educational guides. Admissions, examinations, certification, and licensure requirements vary by program and state. Advancement may require a separate degree or credential.
        </p>
      </section>
    </div>
  );
}
