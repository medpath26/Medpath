import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/PublicInfoPage";

export const metadata: Metadata = {
  title: "About | MedPath",
  description: "Learn why MedPath was created for future healthcare professionals."
};

export default function AboutPage() {
  return (
    <PublicInfoPage
      eyebrow="About MedPath"
      title="A clearer path from learning to healthcare practice."
      intro="MedPath brings career discovery, study support, clinical preparation, and career-readiness tools into one encouraging workspace."
    >
      <section>
        <h2>Our mission</h2>
        <p>
          We help future healthcare professionals turn a demanding education journey into practical,
          manageable next steps. MedPath is designed to make preparation feel structured, supportive,
          and connected to the career a student is working toward.
        </p>
      </section>
      <section>
        <h2>What MedPath provides</h2>
        <p>
          Students can explore healthcare careers, organize study plans, practice core concepts,
          prepare for clinical environments, and build confidence for resumes and interviews. Atlas,
          our learning companion, explains concepts and helps students choose a useful next step.
        </p>
      </section>
      <section>
        <h2>Learning support—not medical advice</h2>
        <p>
          MedPath is an educational tool. It does not replace an instructor, accredited program,
          clinical policy, certification authority, or licensed healthcare professional. Students
          should verify clinical and certification guidance with their school and official sources.
        </p>
      </section>
    </PublicInfoPage>
  );
}

