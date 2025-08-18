import { hackathons, team, teamMessages } from "@/lib/data";
import { notFound } from "next/navigation";
import TeamClientPage from "./team-client-page";

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default function TeamPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id === params.id);

  if (!hackathon) {
    notFound();
  }

  return <TeamClientPage hackathon={hackathon} team={team} messages={teamMessages}/>;
}
