import { NextRequest, NextResponse } from 'next/server';
import { parseISO, isPast, isFuture } from 'date-fns';

type Round = { name: string; date: string; description?: string };
type Hackathon = {
  id: string;
  name: string;
  theme?: string;
  date: string;
  rounds?: Round[];
  prize?: number;
  locationType?: 'online' | 'offline';
  description?: string;
};

function parseDate(input: string): Date {
  // Be resilient to various date formats
  const d1 = new Date(input);
  if (!isNaN(d1.getTime())) return d1;
  const d2 = parseISO(input);
  return isNaN(d2.getTime()) ? new Date() : d2;
}

function getEventStatus(h: Hackathon): 'Upcoming' | 'Ongoing' | 'Ended' {
  if (h.rounds && h.rounds.length > 0) {
    const sorted = [...h.rounds].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    const first = parseDate(sorted[0].date);
    const last = parseDate(sorted[sorted.length - 1].date);
    if (isPast(last)) return 'Ended';
    if (isFuture(first)) return 'Upcoming';
    return 'Ongoing';
  }
  const start = parseDate(h.date);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  if (isPast(end)) return 'Ended';
  if (isFuture(start)) return 'Upcoming';
  return 'Ongoing';
}

function formatList(items: string[], max = 5): string {
  const slice = items.slice(0, max);
  const more = items.length - slice.length;
  return more > 0 ? `${slice.join(', ')}, and ${more} more` : slice.join(', ');
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ') 
    .trim();
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalize(a).split(' '));
  const tb = new Set(normalize(b).split(' '));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const denom = Math.min(ta.size, tb.size);
  return inter / denom;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

    const fetchJSON = async (url: string, init?: RequestInit) => {
      const r = await fetch(url, init);
      if (!r.ok) return null;
      return r.json();
    };

    const listData = await fetchJSON(`${base}/hackathons/list`);
    const hacks: Hackathon[] = listData && Array.isArray(listData.hackathons) ? listData.hackathons : [];

    const q = String(message || '').toLowerCase();
    if (!q.trim()) {
      return NextResponse.json({ reply: 'Hi! Ask me about upcoming hackathons, themes, prizes, or how to find a team.' });
    }

    // Helper for keyword presence
    const hasAny = (s: string, words: string[]) => words.some(w => s.includes(w));

    // Generic overview about hackathons
    if (/(what\s+is\s+a?\s*hackathon|about\s+hackathon|explain\s+hackathon|how\s+do\s+hackathons?\s+work)/.test(q)) {
      const reply = `A hackathon is a time‑boxed event where individuals or teams rapidly ideate, build, and demo a working prototype. Typical flow: register, form a team, build during the event rounds, and submit before the deadline. Useful skill areas: 
• Ideation & product: problem framing, user research, storytelling
• Design: UX/UI, wireframing (Figma)
• Frontend: React/Next.js, HTML/CSS, Tailwind
• Backend: Node/Express or Python/FastAPI, databases (Postgres/Mongo)
• Data/AI (if relevant): Python, NumPy/Pandas, TensorFlow/PyTorch, prompt engineering
• DevOps: cloud deploy (Vercel/Render), CI, auth, storage
• Pitch: concise demo, slides, live walkthrough`;
      return NextResponse.json({ reply });
    }

    // Filters
    const statusFiltered = (status: 'Upcoming' | 'Ongoing' | 'Ended') =>
      hacks.filter(h => getEventStatus(h) === status);

    const byTheme = (theme: string) => hacks.filter(h => (h.theme || '').toLowerCase().includes(theme.toLowerCase()));
    const byName = (name: string) => hacks.filter(h => (h.name || '').toLowerCase().includes(name.toLowerCase()));

    let reply = '';

    // Find Team intent
    if (/(find|join).{0,12}team|looking for (a )?team|team code|how.*team/.test(q)) {
      // Try to resolve a specific hackathon from the query
      const scored = hacks.map(h => ({ h, score: tokenOverlap(h.name, q) }));
      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];
      if (best && best.score >= 0.34) {
        const h = best.h;
        reply = `To find or join a team for ${h.name}: 1) Make sure you are registered. 2) Open /hackathons/${h.id}/find-team to browse teams and solo participants. 3) Request to join a team or use a team code to join directly.`;
      } else {
        reply = `To find a team: 1) Register for the hackathon first. 2) Open the hackathon page and click "Find Team". 3) Browse teams, send a join request, or join using a team code. If you tell me the hackathon name, I’ll give you a direct link.`;
      }
      return NextResponse.json({ reply });
    }

    // Themed understanding like "understand about ai hackathons" or a specific hackathon name
    if ((hasAny(q, ['ai', 'artificial intelligence']) && /hac?k/.test(q)) || /ai.*hac?k|hac?k.*ai/.test(q)) {
      const themeHacks = byTheme('ai');
      const listPart = themeHacks.length
        ? `AI hackathons: ${formatList(themeHacks.map(h => `${h.name} on ${new Date(h.date).toLocaleDateString()}`))}. `
        : 'No specific AI events found right now. ';
      const skills = ['Python', 'NumPy/Pandas', 'TensorFlow or PyTorch', 'Prompt engineering', 'APIs & data pipelines', 'Deployment (Vercel/Render)'];
      reply = `${listPart}Overview: Teams build AI‑powered prototypes within a time limit and submit before the deadline. Suggested skills: ${skills.join(', ')}.`;
      return NextResponse.json({ reply });
    }

    // Skill suggestions based on theme or name
    if (q.includes('skill') || q.includes('skills') || q.includes('tech stack') || q.includes('what should i learn')) {
      const skillMap: Record<string, string[]> = {
        'ai': ['Python', 'NumPy/Pandas', 'TensorFlow or PyTorch', 'Prompt engineering', 'Data preprocessing', 'MLOps (Weights & Biases, Docker)'],
        'machine': ['Python', 'NumPy/Pandas', 'TensorFlow or PyTorch', 'Model evaluation', 'MLOps'],
        'data': ['Python/SQL', 'Pandas', 'Visualization (Plotly/Recharts)', 'ETL & APIs', 'Dashboards'],
        'web': ['React/Next.js', 'TypeScript', 'TailwindCSS', 'Node/Express', 'Auth & DB (Firebase/Mongo/Postgres)'],
        'mobile': ['React Native or Flutter', 'REST/GraphQL', 'Local storage', 'UI/UX patterns'],
        'fintech': ['APIs & OAuth', 'Security & compliance basics', 'Data visualization', 'Payments (Stripe/Razorpay)', 'Backend reliability'],
        'health': ['Data privacy', 'FHIR/HL7 basics', 'Data cleaning', 'ML for health (optional)'],
        'blockchain': ['Solidity', 'EVM & Remix', 'ethers.js/web3.js', 'Smart‑contract security', 'Wallets & tooling'],
        'sustain': ['IoT/sensors (optional)', 'Cloud functions', 'Data viz', 'Mapping/geo (Leaflet/Mapbox)'],
      };

      let theme = '';
      const named = byName(q)[0];
      if (named && named.theme) theme = named.theme.toLowerCase();
      if (!theme) {
        const themes = Object.keys(skillMap);
        theme = themes.find(t => q.includes(t)) || '';
      }

      const skills = theme ? (skillMap[Object.keys(skillMap).find(k => theme.includes(k)) || ''] || []) : [];
      if (skills.length) {
        reply = `Suggested skills for this theme: ${skills.join(', ')}.`;
      } else {
        reply = 'Core hackathon skills: React/Next.js, Node/Express or Python/FastAPI, a database (Mongo/Postgres), basic cloud deployment (Vercel/Render), and strong UX/pitch. Add AI/ML (Python + TensorFlow/PyTorch) if the theme calls for it.';
      }
      return NextResponse.json({ reply });
    }

    // Small talk / generic chat handling (only if not clearly hackathon intent)
    const looksHackathonIntent = /(hac?k|hackathon|team|skill|theme|ai|ongoing|upcoming|online|offline|prize)/.test(q);
    if (!looksHackathonIntent) {
      const smallTalkRules: Array<{ test: (s: string) => boolean; reply: () => string }> = [
        { test: s => /\b(hi|hello|hey|yo|hola|namaste)\b/.test(s), reply: () => 'Hello! How can I help with HackHub today?' },
        { test: s => /\b(how are you|how r u|how's it going)\b/.test(s), reply: () => "I'm doing great and ready to help you hack!" },
        { test: s => /\b(thanks|thank you|ty|appreciate it)\b/.test(s), reply: () => 'You’re welcome! If you need anything else, just ask.' },
        { test: s => /\b(bye|goodbye|see ya|see you|later)\b/.test(s), reply: () => 'Bye! Good luck and have fun hacking.' },
        { test: s => /\b(ok|okay|k|cool|nice|great)\b/.test(s), reply: () => 'Awesome. Would you like to explore upcoming or ongoing hackathons?' },
        { test: s => /\b(i (don'?t|do not) know|no idea|help|what should i do|confused)\b/.test(s), reply: () => 'No worries! I can show upcoming hackathons, suggest skills for your theme, or help you find a team. Try: "upcoming", "AI skills", or "find team".' },
      ];
      const st = smallTalkRules.find(r => r.test(q));
      if (st) return NextResponse.json({ reply: st.reply() });
    }

    if (q.includes('upcoming')) {
      const list = statusFiltered('Upcoming');
      reply = list.length
        ? `Upcoming hackathons: ${formatList(list.map(h => `${h.name} (${h.theme || 'General'}) on ${new Date(h.date).toLocaleDateString()}`))}.`
        : 'There are no upcoming hackathons right now.';
    } else if (q.includes('ongoing') || q.includes('live') || q.includes('running') || q.includes('in progress') || q.includes('current')) {
      const list = statusFiltered('Ongoing');
      reply = list.length
        ? `Ongoing hackathons: ${formatList(list.map(h => `${h.name} (${h.theme || 'General'})`))}.`
        : 'No hackathons are ongoing at the moment.';
    } else if (q.includes('ended') || q.includes('past')) {
      const list = statusFiltered('Ended');
      reply = list.length
        ? `Recently ended hackathons: ${formatList(list.map(h => h.name))}.`
        : 'No past hackathons found.';
    } else if (q.includes('prize') || q.includes('reward')) {
      const list = hacks
        .filter(h => (h.prize || 0) > 0)
        .sort((a, b) => (b.prize || 0) - (a.prize || 0))
        .slice(0, 5);
      reply = list.length
        ? `Top prizes: ${list.map(h => `${h.name}: ₹${Number(h.prize).toLocaleString()}`).join('; ')}.`
        : 'Prize information is not available yet.';
    } else if (q.includes('online') || q.includes('offline')) {
      const target = q.includes('online') ? 'online' : 'offline';
      const list = hacks.filter(h => (h.locationType || '').toLowerCase() === target);
      reply = list.length
        ? `${target.charAt(0).toUpperCase() + target.slice(1)} hackathons: ${formatList(list.map(h => h.name))}.`
        : `No ${target} hackathons found.`;
    } else {
      // Try theme/name keyword search with fuzzy support
      const themeMatch = byTheme(q);
      if (themeMatch.length) {
        reply = `Hackathons matching your interest: ${formatList(themeMatch.map(h => `${h.name} (${h.theme})`))}.`;
      } else {
        // Fuzzy name match
        const scored = hacks.map(h => ({ h, score: tokenOverlap(h.name, q) }));
        scored.sort((a, b) => b.score - a.score);
        const best = scored[0];
        if (best && best.score >= 0.34) {
          const h = best.h;
          // Enrich with backend details: rounds, team size, participants/teams counts if possible
          const details = await fetchJSON(`${base}/hackathons/get/${encodeURIComponent(h.id)}`);
          const teamsRes = await fetchJSON(`${base}/hackathons/teams/list/${encodeURIComponent(h.id)}`);
          const participantsRes = await fetchJSON(`${base}/hackathons/participants/public/${encodeURIComponent(h.id)}`);
          const status = getEventStatus(h);
          const teamCount = teamsRes && Array.isArray(teamsRes.teams) ? teamsRes.teams.length : undefined;
          const participantCount = participantsRes && Array.isArray(participantsRes.participants) ? participantsRes.participants.length : undefined;
          const rounds = details?.rounds as Round[] | undefined;
          const firstRound = rounds && rounds.length ? ` First round: ${new Date(rounds[0].date).toLocaleDateString()}.` : '';
          const counts = (teamCount || participantCount) ? ` ${teamCount ? `${teamCount} teams` : ''}${teamCount && participantCount ? ', ' : ''}${participantCount ? `${participantCount} participants` : ''}.` : '';
          const teamSize = details?.team_size ? ` Team size: up to ${details.team_size}.` : '';
          reply = `${h.name} — Theme: ${h.theme || 'General'}, Status: ${status}, Date: ${new Date(h.date).toLocaleDateString()}${(h.prize ? `, Prize: ₹${Number(h.prize).toLocaleString()}` : '')}.${firstRound}${teamSize}${counts}`.trim();
        } else {
          reply = `I couldn't find that. Try asking for "upcoming hackathons", "ongoing", a theme like "AI", or "online".`;
        }
      }
    }

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ reply: 'Sorry, I had trouble answering that. Please try again.' }, { status: 200 });
  }
}


