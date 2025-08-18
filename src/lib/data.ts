

export type Hackathon = {
    id: string;
    name: string;
    theme: string;
    date: string;
    prize: number;
    locationType: 'online' | 'offline';
    image: string;
    hint: string;
    description: string;
    registrationStatus?: 'Confirmed' | 'Pending' | 'Waitlisted';
    teamId?: string | null;
    submissionStatus?: 'Not Started' | 'Draft' | 'Submitted';
}

export type TeamMember = {
    name: string;
    role: "Leader" | "Developer" | "Designer";
    avatar: string;
};

export type Team = {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
};

export type TeamMessage = {
    id: number;
    author: string;
    avatar: string;
    content: string;
    isSelf: boolean;
};

export type SoloParticipant = {
    name: string;
    avatar: string;
    skills: string[];
}

export type Submission = {
    title: string;
    description: string;
    techStack: string[];
    githubUrl: string;
    videoUrl: string;
    status: 'draft' | 'submitted';
}

export const hackathons: Hackathon[] = [
  {
    id: "ai-innovation-challenge",
    name: "AI Innovation Challenge",
    theme: "Artificial Intelligence",
    date: "2024-08-15",
    prize: 20000,
    locationType: "online",
    image: "https://placehold.co/600x400.png",
    hint: "AI robot",
    description: "The AI Innovation Challenge is a global competition designed to foster creativity and problem-solving using artificial intelligence. Participants will tackle real-world challenges, developing innovative AI solutions that address pressing issues across various industries. This challenge aims to push the boundaries of AI applications, encouraging participants to explore new possibilities and create impactful solutions."
  },
  {
    id: "sustainable-solutions-hackathon",
    name: "Sustainable Solutions Hackathon",
    theme: "Sustainability",
    date: "2024-09-01",
    prize: 15000,
    locationType: "offline",
    image: "https://placehold.co/600x400.png",
    hint: "green energy",
    description: "Join us to build innovative solutions for a sustainable future. This hackathon focuses on environmental challenges, renewable energy, and circular economy models. Let's code for a greener planet!"
  },
  {
    id: "fintech-disruption",
    name: "FinTech Disruption",
    theme: "Financial Technology",
    date: "2024-09-20",
    prize: 25000,
    locationType: "online",
    image: "https://placehold.co/600x400.png",
    hint: "finance chart",
    description: "This hackathon is for disruptors who want to revolutionize the financial industry. From blockchain to AI-powered trading bots, we are looking for groundbreaking ideas that can change how we manage money."
  },
  {
    id: "healthcare-innovation-sprint",
    name: "Healthcare Innovation Sprint",
    theme: "Healthcare",
    date: "2024-10-05",
    prize: 18000,
    locationType: "offline",
    image: "https://placehold.co/600x400.png",
    hint: "medical technology",
    description: "A fast-paced sprint to create technology that can improve patient outcomes and streamline healthcare operations. We are looking for solutions in telehealth, medical devices, and data analytics."
  },
  {
    id: "creative-coding-marathon",
    name: "Creative Coding Marathon",
    theme: "Creative Coding",
    date: "2024-10-15",
    prize: 10000,
    locationType: "online",
    image: "https://placehold.co/600x400.png",
    hint: "abstract art",
    description: "A marathon for artists, designers, and developers to create stunning visual experiences with code. This is a celebration of art and technology, where you can build anything from interactive installations to generative art."
  },
  {
    id: "data-science-decathlon",
    name: "Data Science Decathlon",
    theme: "Data Science",
    date: "2024-11-01",
    prize: 30000,
    locationType: "online",
    image: "https://placehold.co/600x400.png",
    hint: "data visualization",
    description: "Ten challenges, one winner. This decathlon will test your data science skills to the limit. From data cleaning and feature engineering to model building and visualization, you will have to master it all."
  },
  {
    id: "ai-for-social-good",
    name: "AI for Social Good",
    theme: "Artificial Intelligence",
    date: "2024-11-12",
    prize: 22000,
    locationType: "offline",
    image: "https://placehold.co/600x400.png",
    hint: "AI robot",
    description: "Use your AI skills to make a positive impact on society. This hackathon is focused on creating solutions for social challenges, such as education, poverty, and public health. Let's build a better world with AI."
  },
  {
    id: "eco-warriors-hack",
    name: "Eco-Warriors Hack",
    theme: "Sustainability",
    date: "2024-12-01",
    prize: 12000,
    locationType: "online",
    image: "https://placehold.co/600x400.png",
    hint: "green energy",
    description: "A hackathon for environmental activists and developers to build tools that can help protect our planet. From tracking deforestation to monitoring pollution, we are looking for solutions that can make a difference."
  },
];


// This would typically come from a database query joining users, registrations, and hackathons.
export const myHackathons: Hackathon[] = [
    {
        ...hackathons.find(h => h.id === 'ai-innovation-challenge')!,
        registrationStatus: 'Confirmed',
        teamId: 'team-avengers',
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // Yesterday to make it ongoing
        submissionStatus: 'Draft',
    },
    {
        ...hackathons.find(h => h.id === 'fintech-disruption')!,
        registrationStatus: 'Confirmed',
        teamId: null,
        date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow to make it ongoing
        submissionStatus: 'Not Started'
    },
    {
        ...hackathons.find(h => h.id === 'creative-coding-marathon')!,
        registrationStatus: 'Confirmed',
        teamId: 'team-pixel-pushers',
        submissionStatus: 'Submitted'
    },
    {
        ...hackathons.find(h => h.id === 'data-science-decathlon')!,
        registrationStatus: 'Pending',
        teamId: null,
        date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // 30 days from now
        submissionStatus: 'Not Started'
    },
    {
        ...hackathons.find(h => h.id === 'eco-warriors-hack')!,
        registrationStatus: 'Confirmed',
        teamId: 'team-green-code',
        date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0] // 30 days ago
    }
]

export const team: Team = {
    id: "quantum-leap-ai",
    name: "Team QuantumLeap AI",
    description: "Building the future of AI-powered solutions.",
    members: [
        { name: "Alex Chen", role: "Leader", avatar: "https://placehold.co/64x64.png" },
        { name: "Sophia Rodriguez", role: "Developer", avatar: "https://placehold.co/64x64.png" },
        { name: "Ben Carter", role: "Developer", avatar: "https://placehold.co/64x64.png" },
        { name: "Olivia Martinez", role: "Designer", avatar: "https://placehold.co/64x64.png" },
    ]
}

export const openTeams: Omit<Team, 'description' | 'id'>[] = [
    { name: "Code Wizards", members: [{ name: "Gandalf", role: "Leader", avatar: "https://placehold.co/32x32.png" }, { name: "Merlin", role: "Developer", avatar: "https://placehold.co/32x32.png" }] },
    { name: "Pixel Perfect", members: [{ name: "Da Vinci", role: "Leader", avatar: "https://placehold.co/32x32.png" }]},
    { name: "Data Drivers", members: [{ name: "Ada Lovelace", role: "Leader", avatar: "https://placehold.co/32x32.png" }, { name: "Charles Babbage", role: "Developer", avatar: "https://placehold.co/32x32.png" }, { name: "Grace Hopper", role: "Developer", avatar: "https://placehold.co/32x32.png" }]},
]

export const teamMessages: TeamMessage[] = [
    { id: 1, author: "Sophia Rodriguez", avatar: "https://placehold.co/24x24.png", content: "Hey team, I've pushed the latest updates for the UI mockups. Let me know what you think!", isSelf: false },
    { id: 2, author: "Alex Chen", avatar: "https://placehold.co/24x24.png", content: "Looks great Sophia! The new color palette is much better. I'll start integrating the backend logic.", isSelf: true },
    { id: 3, author: "Olivia Martinez", avatar: "https://placehold.co/24x24.png", content: "I love it! The user flow feels much more intuitive now. Good job!", isSelf: false },
    { id: 4, author: "Ben Carter", avatar: "https://placehold.co/24x24.png", content: "The API endpoints are ready for integration. Let me know if you run into any issues.", isSelf: false },
]

export const soloParticipants: SoloParticipant[] = [
    { name: "David Lee", avatar: "https://placehold.co/40x40.png", skills: ["React", "Node.js", "GraphQL"] },
    { name: "Emily White", avatar: "https://placehold.co/40x40.png", skills: ["UX/UI Design", "Figma", "Prototyping"] },
    { name: "Frank Green", avatar: "https://placehold.co/40x40.png", skills: ["Python", "Django", "PostgreSQL"] },
    { name: "Grace Hall", avatar: "https://placehold.co/40x40.png", skills: ["iOS", "Swift", "CoreML"] },
    { name: "Henry King", avatar: "https://placehold.co/40x40.png", skills: ["Android", "Kotlin", "Firebase"] },
];

export const mySubmission: Submission = {
    title: "AI-Powered Code Assistant",
    description: "An intelligent code assistant that provides real-time suggestions, error checking, and code generation to improve developer productivity. Built with Next.js, Genkit, and a fine-tuned language model.",
    techStack: ["Next.js", "React", "TypeScript", "Genkit", "Tailwind CSS"],
    githubUrl: "https://github.com/sophiachen/ai-code-assistant",
    videoUrl: "https://youtube.com/watch?v=example",
    status: 'draft',
}
