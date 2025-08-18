"use client";

import { Users, Server, Trophy, MessagesSquare } from "lucide-react";
import { TeammateMatcherModal } from "./teammate-matcher-modal";

const features = [
  {
    icon: <Users className="w-10 h-10 text-accent" />,
    title: "Easy Teaming",
    description: "Find the perfect team with our AI-powered matching algorithm.",
    isAiFeature: true,
  },
  {
    icon: <Server className="w-10 h-10 text-accent" />,
    title: "Effortless Hosting",
    description: "Streamline your hackathon with our intuitive, all-in-one platform.",
  },
  {
    icon: <Trophy className="w-10 h-10 text-accent" />,
    title: "Transparent Judging",
    description: "Ensure a fair and transparent judging process with our robust tools.",
  },
  {
    icon: <MessagesSquare className="w-10 h-10 text-accent" />,
    title: "Vibrant Community",
    description: "Connect with fellow innovators, mentors, and sponsors.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 container mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 font-headline">Everything You Need to Succeed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="text-center p-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary mx-auto mb-5 border-2 border-primary/50">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
            {feature.isAiFeature && (
              <div className="mt-4">
                <TeammateMatcherModal />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
