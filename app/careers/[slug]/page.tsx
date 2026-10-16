import Link from "next/link";
import { notFound } from "next/navigation";
import { careers, type CareerPath } from "@/lib/medpath-data";
import { healthcarePathways } from "@/lib/healthcare-pathways";

const fallback: CareerPath[] = [
  { title: "Surgical Technologist", icon: "ST", salary: "$65k median", education: "Accredited surgical technology program", certification: "CST or TS-C", outlook: "Stable OR demand", responsibilities: "Prepare sterile fields, pass instruments, and support surgical teams.", skills: "Sterile technique, focus, teamwork", advancement: "First assistant, OR educator, surgical services leadership", workSetting: "Hospital operating rooms, outpatient surgery centers, specialty surgical centers" },
  { title: "Medical Assistant", icon: "MA", salary: "$46k median", education: "Certificate or diploma", certification: "CMA, RMA, CCMA, or NCMA", outlook: "Strong outpatient growth", responsibilities: "Support patient intake, vitals, EHR updates, injections, and clinic flow.", skills: "Communication, accuracy, patient care", advancement: "Lead MA, clinic manager, nursing pathway", workSetting: "Primary care practices, specialty clinics, urgent care centers, community health centers" },
  { title: "Sterile Processing Technician", icon: "SP", salary: "$48k median", education: "Certificate or employer training", certification: "CRCST or CSPDT", outlook: "High demand in hospitals", responsibilities: "Decontaminate, inspect, assemble, sterilize, and track instruments.", skills: "Detail orientation, infection control", advancement: "Lead tech, educator, surgical technology", workSetting: "Hospitals, outpatient surgery centers, instrument reprocessing facilities" },
  { title: "Phlebotomist", icon: "PH", salary: "$45k median", education: "Short certificate program", certification: "CPT or equivalent", outlook: "Consistent lab demand", responsibilities: "Collect blood specimens, label samples, and reassure patients.", skills: "Manual dexterity, patient comfort", advancement: "Lab assistant, MA, nursing pathway", workSetting: "Hospitals, diagnostic labs, blood donation centers, outpatient clinics" }
];
const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const allCareers = [...careers, ...fallback.filter(item => !careers.some(c => c.title === item.title))];
const careerBySlug = new Map(allCareers.map(c => [slugify(c.title), c]));
const pathwayBySlug = new Map<string, (typeof healthcarePathways)[number]>(healthcarePathways.map(p => [p.id, p]));

export function generateStaticParams() {
  return [...new Set([...careerBySlug.keys(), ...pathwayBySlug.keys()])].map(slug => ({ slug }));
}

export default async function CareerDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pathway = pathwayBySlug.get(slug);
  const career = careerBySlug.get(slug) ?? (pathway ? allCareers.find(c => c.title === pathway.label || c.title === pathway.flashcardCategory) : undefined);
  if (!career && !pathway) notFound();
  const title = career?.title ?? pathway!.label;
  const sections = career ? [
    ["What you'll do", career.responsibilities],
    ["Education and training", career.education + (career.trainingLength ? ` · Typical duration: ${career.trainingLength}` : "")],
    ["Certification and credentials", career.certification],
    ["Where you can work", career.workSetting ?? "Workplaces vary by specialty and employer."],
    ["Useful skills", career.skills],
    ["Salary snapshot", career.salary],
    ["Career outlook", career.outlook],
    ["Growth and advancement", career.advancement],
    ["Who may enjoy this career", career.bestFor ?? "Students interested in this area of healthcare."]
  ] : [
    ["Explore the pathway", `Learn about the ${title} career and compare programs before choosing a training route.`],
    ["Training and credentials", "Requirements vary by state, employer, and specialty. Check accredited programs and relevant licensing or certification boards."],
    ["Where you can work", "Workplaces vary by career, specialty, and credentials. Research local employers and clinical settings."]
  ];
  return (
    <main style={{ maxWidth: 940, margin: "0 auto", padding: "48px 20px", fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
      <Link href="/?view=career" style={{ color: "#1d4ed8" }}>← Back to Careers</Link>
      <p style={{ marginTop: 32, color: "#315b8c", fontWeight: 700 }}>MEDPATH · CAREER PATHWAY GUIDE</p>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 8 }}>{title}</h1>
      <p>Explore the responsibilities, preparation, and opportunities associated with this healthcare pathway.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 28 }}>
        {sections.map(([heading, description]) => (
          <section key={heading} style={{ padding: 22, border: "1px solid #cbd5e1", borderRadius: 14, background: "#fff", color: "#172554" }}>
            <h2 style={{ fontSize: "1.12rem", marginTop: 0 }}>{heading}</h2>
            <p style={{ marginBottom: 0 }}>{description}</p>
          </section>
        ))}
      </div>
      <p style={{ marginTop: 28, color: "#475569" }}>Career details are introductory and illustrative. Salary, credential requirements, and job settings vary by state and employer. Verify details with the relevant licensing board, training program, and <a href="https://www.bls.gov/ooh/healthcare/">U.S. Bureau of Labor Statistics</a>.</p>
      <Link href="/?view=career" style={{ color: "#1d4ed8" }}>← Explore more careers</Link>
    </main>
  );
}
