
import { hackathons, results, team } from "@/lib/data";
import { notFound } from "next/navigation";
import ResultsClientPage from "./results-client-page";

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id === params.id);

  if (!hackathon) {
    notFound();
  }

  // Assuming the user's team is `team` from mock data
  const userResult = results.find(r => r.team.name === team.name);

  return <ResultsClientPage hackathon={hackathon} results={results} userResult={userResult} />;
}
