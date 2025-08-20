import { notFound } from "next/navigation";
import SubmissionClientPage from "./submission-client-page";
import { apiService } from "@/lib/api";

export const dynamic = 'force-dynamic';

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const url = new URL(`/hackathons/get/${encodeURIComponent(id)}`, base).toString();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) notFound();
    const hackathon = await res.json();
    if (!hackathon || !hackathon.id) notFound();
    return <SubmissionClientPage hackathon={hackathon} />;
  } catch {
    notFound();
  }
}
