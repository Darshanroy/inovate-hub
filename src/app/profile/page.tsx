"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile, type ProfileFormValues } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Linkedin, Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  tagline: z.string().min(1, "Tagline is required."),
  location: z.string().min(1, "Location is required."),
  bio: z.string().min(1, "Bio is required."),
  skills: z.string().min(1, "Please enter at least one skill."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
  github: z.string().url("Please enter a valid GitHub URL."),
});


const initialSkills = [
    "Python", "Machine Learning", "Data Analysis", "Cloud Computing", 
    "Deep Learning", "Natural Language Processing", "Computer Vision", "TensorFlow"
];

const hackathons = [
    {
        id: "ai-for-good-challenge",
        name: "AI for Good Challenge",
        description: "Developed an AI-powered solution for environmental sustainability.",
        image: "https://placehold.co/600x400.png",
        hint: "AI environment"
    },
    {
        id: "healthcare-innovation-hackathon",
        name: "Healthcare Innovation Hackathon",
        description: "Created a machine learning model for early disease detection.",
        image: "https://placehold.co/600x400.png",
        hint: "healthcare technology"
    },
    {
        id: "smart-city-solutions",
        name: "Smart City Solutions",
        description: "Designed an intelligent traffic management system using AI.",
        image: "https://placehold.co/600x400.png",
        hint: "smart city"
    }
]

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: "Sophia Chen",
            tagline: "Software Engineer | AI Enthusiast",
            location: "San Francisco, CA",
            bio: "Passionate software engineer with a focus on AI and machine learning. Experienced in developing innovative solutions and participating in hackathons to push the boundaries of technology.",
            skills: initialSkills.join(", "),
            linkedin: "https://linkedin.com/in/sophiachen",
            github: "https://github.com/sophiachen"
        }
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: ProfileFormValues) => {
        const result = await updateProfile(values);
        if (result.success) {
            toast({
                title: "Success",
                description: result.success,
            });
            setIsEditing(false);
        } else {
             toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col max-w-4xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="p-8 bg-secondary border-white/10">
                            <div className="flex justify-end mb-4">
                                <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                                    <Pencil className="h-5 w-5" />
                                    <span className="sr-only">Edit Profile</span>
                                </Button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <Image 
                                    src="https://placehold.co/128x128.png" 
                                    alt="Sophia Chen"
                                    width={128}
                                    height={128}
                                    className="rounded-full"
                                    data-ai-hint="woman portrait"
                                />
                                <div className="flex flex-col justify-center gap-1 text-center md:text-left w-full">
                                    {isEditing ? (
                                        <>
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem><FormLabel className="sr-only">Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                             <FormField control={form.control} name="tagline" render={({ field }) => (
                                                <FormItem><FormLabel className="sr-only">Tagline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                             <FormField control={form.control} name="location" render={({ field }) => (
                                                <FormItem><FormLabel className="sr-only">Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </>
                                    ) : (
                                        <>
                                            <h1 className="text-4xl font-bold">{form.getValues("name")}</h1>
                                            <p className="text-muted-foreground">{form.getValues("tagline")}</p>
                                            <p className="text-muted-foreground">{form.getValues("location")}</p>
                                        </>
                                    )}
                                </div>
                                {!isEditing && <Button className="w-full md:w-auto md:ml-auto">Download Résumé</Button>}
                            </div>
                            
                            {isEditing ? (
                                <FormField control={form.control} name="bio" render={({ field }) => (
                                    <FormItem className="pt-6"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                                )} />
                            ) : (
                                <p className="text-muted-foreground pt-6">{form.getValues("bio")}</p>
                            )}
                            
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Skills</h3>
                                {isEditing ? (
                                     <FormField control={form.control} name="skills" render={({ field }) => (
                                        <FormItem><FormLabel className="sr-only">Skills</FormLabel><FormControl><Input placeholder="Comma-separated skills" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                ) : (
                                    <div className="flex gap-2 flex-wrap">
                                        {form.getValues("skills").split(',').map(skill => (
                                            <Badge key={skill.trim()} variant="secondary">{skill.trim()}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Social Links</h3>
                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <FormField control={form.control} name="linkedin" render={({ field }) => (
                                            <FormItem className="w-full"><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="github" render={({ field }) => (
                                            <FormItem className="w-full"><FormLabel>GitHub</FormLabel><FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button asChild variant="outline" className="w-full justify-start">
                                            <Link href={form.getValues("linkedin")} target="_blank">
                                                <Linkedin className="mr-2 h-4 w-4" />
                                                LinkedIn
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full justify-start">
                                            <Link href={form.getValues("github")} target="_blank">
                                                <Github className="mr-2 h-4 w-4" />
                                                GitHub
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>

                             {isEditing && (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); form.reset(); }}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </form>
                </Form>

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
                                      <Button asChild variant="outline" className="w-full">
                                        <Link href={`/hackathons/${hackathon.id}`}>View Details</Link>
                                      </Button>
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
