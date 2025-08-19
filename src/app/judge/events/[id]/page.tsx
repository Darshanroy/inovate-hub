
import { hackathons, results, team } from "@/lib/data";
import { notFound } from "next/navigation";
import JudgeEventClientPage from "./_components/judge-event-client-page";
import type { Submission } from "@/lib/data";


// Mock submissions for the event
const submissions: Submission[] = [
    { ...mySubmission, title: "EcoSort AI", status: 'submitted', team: results[0].team },
    { ...mySubmission, title: "FinPredict", status: 'submitted', team: results[1].team },
    { ...mySubmission, title: "HealthTrack", status: 'submitted', team: results[2].team },
    { ...mySubmission, title: "Intelligent Code Assistant", status: 'submitted', team: results[3].team },
    { ...mySubmission, title: "AgriGrow", status: 'submitted', team: results[4].team },
]

const criteria = [
    { id: 1, name: "Innovation & Creativity", weight: 2, maxScore: 10 },
    { id: 2, name: "Technical Feasibility", weight: 2, maxScore: 10 },
    { id: 3, name: "Impact & Potential", weight: 3, maxScore: 10 },
    { id: 4, name: "Presentation & Demo", weight: 1, maxScore: 5 },
]

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default function JudgeEventPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id === params.id);

  if (!hackathon) {
    notFound();
  }

  return <JudgeEventClientPage hackathon={hackathon} submissions={submissions} criteria={criteria} />;
}
