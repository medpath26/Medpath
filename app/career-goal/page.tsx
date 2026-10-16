import Link from "next/link";
import { careers } from "@/lib/medpath-data";
import { healthcarePathways } from "@/lib/healthcare-pathways";

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default async function CareerGoalPage({ searchParams }: { searchParams: Promise<{ goal?: string }> }) {
  const { goal = "" } = await searchParams;
  const pathway = healthcarePathways.find(p => p.label.toLowerCase() === goal.trim().toLowerCase() || p.id === goal.trim().toLowerCase());
  const title = pathway?.label || careers.find(c => c.title.toLowerCase() === goal.trim().toLowerCase())?.title;
  const career = careers.find(c => c.title === title);
  const steps = title ? [
    ["Understand your career", `Research the daily responsibilities, work settings, and scope of practice for ${title}.`],
    ["Confirm entry requirements", "Review the education, age, background-check, and prerequisite requirements of accredited or approved programs in your state."],
    ["Choose an approved education pathway", career?.education || "Identify an accredited or state-approved education or training program for this profession."],
    ["Plan finances and admissions", "Compare tuition, financial aid, application deadlines, entrance requirements, and any clinical placement costs."],
    ["Complete classroom and practical training", "Build foundational knowledge, complete required coursework, and demonstrate practical competencies under qualified supervision."],
    ["Complete required clinical experience", "Fulfill any clinical, externship, fieldwork, or supervised practice requirements applicable to your program and credential."],
    ["Verify credential eligibility", career?.certification ? `Review requirements for ${career.certification}, including any state-specific licensing or registration rules.` : "Check current licensing, registration, and certification rules with the relevant official board."],
    ["Prepare for examinations", "Study the official examination content outline and practice the competencies required by your chosen credential."],
    ["Apply for credentials", "Submit official applications, required transcripts, verification, fees, and exam registration when eligible."],
    ["Prepare for employment", "Update your résumé, gather references, practice interviews, and search for suitable entry-level positions."],
    ["Maintain professional standing", "Follow renewal, continuing education, and employer competency requirements after entering the profession."]
  ] : [];
  return <main style={{maxWidth:900,margin:"0 auto",padding:"42px 22px",fontFamily:"Arial,sans-serif",lineHeight:1.65,color:"#102d52"}}>
    <Link href="/?view=career">← Back to Careers</Link>
    <p style={{marginTop:28,fontWeight:700,color:"#159fa7"}}>MEDPATH · CAREER GOAL PATHWAY</p>
    <h1 style={{fontSize:"clamp(2rem,5vw,3rem)",marginBottom:8}}>{title || "Choose a career goal"}</h1>
    {title ? <>
      <p>Your informational roadmap from exploring this profession to preparing for employment.</p>
      <h2>Steps toward your career goal</h2>
      <ol style={{paddingLeft:26}}>
        {steps.map(([heading,body]) => <li key={heading} style={{padding:"12px 10px",marginBottom:12,background:"#f3f8fb",borderRadius:10}}>
          <strong>{heading}</strong><p style={{margin:"5px 0"}}>{body}</p>
        </li>)}
      </ol>
      <p>These are informational steps, not an interactive completion checklist. Requirements and sequences vary by state, employer, and credential. Confirm them with official licensing boards and training programs.</p>
      <Link href={`/careers/${pathway?.id || slug(title)}`}>Explore detailed career information →</Link>
    </> : <p>Open Careers from your MedPath account to view the pathway associated with your selected career goal.</p>}
  </main>;
}
