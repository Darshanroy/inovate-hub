import { hackathons } from "@/lib/data";
import { notFound } from "next/navigation";
import HackathonDetailClientPage from "./hackathon-detail-client";

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default function HackathonDetailPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id === params.id);

  if (!hackathon) {
    notFound();
  }

  return <HackathonDetailClientPage hackathon={hackathon} />;
}
