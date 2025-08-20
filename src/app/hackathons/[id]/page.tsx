import { notFound } from "next/navigation";
import HackathonDetailClientPage from "./hackathon-detail-client";
// Server-side fetch is preferred here to avoid client-only dependencies

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

export const dynamic = 'force-dynamic';

export default async function HackathonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const url = new URL(`/hackathons/get/${encodeURIComponent(id)}`, base).toString();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      notFound();
    }
    const hackathon = await res.json();
    if (!hackathon || !hackathon.id) notFound();
    return <HackathonDetailClientPage hackathon={hackathon} />;
  } catch {
    notFound();
  }
}
