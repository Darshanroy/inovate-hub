
import { hackathons } from "@/lib/data";
import { notFound } from "next/navigation";
import EditHackathonClientPage from "./edit-hackathon-client-page";

export function generateStaticParams() {
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default function EditHackathonPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id === params.id);

  if (!hackathon) {
    notFound();
  }

  return <EditHackathonClientPage hackathon={hackathon} />;
}
