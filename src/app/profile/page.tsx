import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const skills = [
    "Python", "Machine Learning", "Data Analysis", "Cloud Computing", 
    "Deep Learning", "Natural Language Processing", "Computer Vision", "TensorFlow"
];

const hackathons = [
    {
        name: "AI for Good Challenge",
        description: "Developed an AI-powered solution for environmental sustainability.",
        image: "https://placehold.co/600x400.png",
        hint: "AI environment"
    },
    {
        name: "Healthcare Innovation Hackathon",
        description: "Created a machine learning model for early disease detection.",
        image: "https://placehold.co/600x400.png",
        hint: "healthcare technology"
    },
    {
        name: "Smart City Solutions",
        description: "Designed an intelligent traffic management system using AI.",
        image: "https://placehold.co/600x400.png",
        hint: "smart city"
    }
]

export default function ProfilePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col max-w-4xl mx-auto">
                <Card className="p-8 bg-secondary border-white/10">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                         <Image 
                            src="https://placehold.co/128x128.png" 
                            alt="Sophia Chen"
                            width={128}
                            height={128}
                            className="rounded-full"
                            data-ai-hint="woman portrait"
                        />
                        <div className="flex flex-col justify-center gap-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold">Sophia Chen</h1>
                            <p className="text-muted-foreground">Software Engineer | AI Enthusiast</p>
                            <p className="text-muted-foreground">San Francisco, CA</p>
                        </div>
                         <Button className="w-full md:w-auto md:ml-auto">Download Résumé</Button>
                    </div>
                    <p className="text-muted-foreground pt-6">
                        Passionate software engineer with a focus on AI and machine learning. Experienced in developing innovative solutions and participating in hackathons to push the boundaries of technology.
                    </p>
                     <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">Skills</h3>
                        <div className="flex gap-2 flex-wrap">
                            {skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">Social Links</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="#">
                                    <Linkedin className="mr-2 h-4 w-4" />
                                    LinkedIn
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="#">
                                    <Github className="mr-2 h-4 w-4" />
                                    GitHub
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>

                 <Tabs defaultValue="hackathons" className="mt-8">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                        <TabsTrigger value="badges">Badges</TabsTrigger>
                        <TabsTrigger value="certificates">Certificates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="hackathons" className="mt-6">
                         <h2 className="text-2xl font-bold px-4 pb-4">Hackathon History</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {hackathons.map(hackathon => (
                                <Card key={hackathon.name} className="bg-secondary border-white/10 flex flex-col justify-between">
                                    <CardContent className="p-4 flex flex-col gap-3">
                                         <Image 
                                            src={hackathon.image}
                                            alt={hackathon.name}
                                            width={600}
                                            height={400}
                                            className="w-full h-auto aspect-video rounded-lg object-cover"
                                            data-ai-hint={hackathon.hint}
                                        />
                                        <div>
                                            <p className="text-lg font-bold leading-tight">{hackathon.name}</p>
                                            <p className="text-muted-foreground mt-1">{hackathon.description}</p>
                                        </div>
                                    </CardContent>
                                    <div className="p-4 pt-0">
                                      <Button variant="outline" className="w-full">View Details</Button>
                                    </div>
                                </Card>
                           ))}
                        </div>
                    </TabsContent>
                    {/* Add other TabsContent components here for overview, skills, etc. */}
                </Tabs>
            </div>
        </div>
    );
}
