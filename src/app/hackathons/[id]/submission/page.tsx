import { hackathons } from "@/lib/data";
import { notFound } from "next/navigation";
import SubmissionClientPage from "./submission-client-page";

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id === params.id);

  if (!hackathon) {
    notFound();
  }

  return <SubmissionClientPage hackathon={hackathon} />;
}
