import { notFound } from "next/navigation";
import HackathonDetailClientPage from "./hackathon-detail-client";
import { apiService } from "@/lib/api";

export async function generateStaticParams() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${base}/hackathons/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data.hackathons) ? data.hackathons : [];
    return list.map((h: any) => ({ id: String(h.id) }));
  } catch {
    return [];
  }
}

export default async function HackathonDetailPage({ params }: { params: { id: string } }) {
  try {
    const hackathon = await apiService.getHackathon(params.id);
    if (!hackathon || !hackathon.id) notFound();
    return <HackathonDetailClientPage hackathon={hackathon} />;
  } catch {
    notFound();
  }
}
