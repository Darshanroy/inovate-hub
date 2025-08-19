
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateOrganizerProfile, type OrganizerProfileFormValues } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Github, Linkedin, Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const organizerProfileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  organization: z.string().min(1, "Organization is required."),
  bio: z.string().min(1, "Bio is required."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
  github: z.string().url("Please enter a valid GitHub URL."),
});

export default function OrganizerProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<OrganizerProfileFormValues>({
        resolver: zodResolver(organizerProfileFormSchema),
        defaultValues: {
            name: "Organizer Name",
            organization: "HackHub Inc.",
            bio: "Passionate about empowering innovators and organizing world-class hackathons. Let's build the future together.",
            linkedin: "https://linkedin.com/in/organizer",
            github: "https://github.com/organizer"
        }
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: OrganizerProfileFormValues) => {
        const result = await updateOrganizerProfile(values);
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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="p-8">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <Image 
                                    src="https://placehold.co/128x128.png" 
                                    alt="Organizer"
                                    width={128}
                                    height={128}
                                    className="rounded-full"
                                    data-ai-hint="person portrait"
                                />
                                <div className="flex flex-col justify-center gap-1 text-center md:text-left w-full">
                                    {isEditing ? (
                                        <>
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                             <FormField control={form.control} name="organization" render={({ field }) => (
                                                <FormItem><FormLabel>Organization</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-4xl font-bold">{form.getValues("name")}</h2>
                                            <p className="text-muted-foreground">{form.getValues("organization")}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <FormField control={form.control} name="bio" render={({ field }) => (
                                <FormItem className="pt-6"><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={4} readOnly={!isEditing} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
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
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    );
}
