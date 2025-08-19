
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type OrganizerProfileFormValues } from "@/app/actions";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useEffect } from "react";
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
import { LoadingOverlay } from "@/components/ui/loading-overlay";

const organizerProfileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  organization: z.string().min(1, "Organization is required."),
  location: z.string().min(1, "Location is required."),
  bio: z.string().min(1, "Bio is required."),
  contact_email: z.string().email("Please enter a valid contact email."),
  website: z.string().url("Please enter a valid website URL."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
});

export default function OrganizerProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<OrganizerProfileFormValues>({
        resolver: zodResolver(organizerProfileFormSchema),
        defaultValues: {
            name: "",
            organization: "",
            location: "",
            bio: "",
            contact_email: "",
            website: "",
            linkedin: "",
        }
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: OrganizerProfileFormValues) => {
        const token = getCookie('authToken');
        if (!token) { toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' }); return; }
        try {
            await apiService.updateProfile({ token, profile: { role: 'organizer', ...values } as any });
            toast({ title: 'Success', description: 'Profile saved.' });
            setIsEditing(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error?.message || 'Failed to save profile.' });
        }
    }

    useEffect(() => {
        const token = getCookie('authToken');
        if (!token) return;
        (async () => {
            try {
                const res = await apiService.getProfile(token);
                if (res?.profile) {
                    form.reset({
                        name: res.profile.name || "",
                        organization: res.profile.organization || "",
                        location: res.profile.location || "",
                        bio: res.profile.bio || "",
                        contact_email: res.profile.contact_email || "",
                        website: res.profile.website || "",
                        linkedin: res.profile.linkedin || "",
                    });
                }
            } catch {}
        })();
    }, [form]);

    return (
        <div className="container mx-auto px-4 py-8">
             {isSubmitting && <LoadingOverlay message="Saving your profile..." />}
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
                                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                             <FormField control={form.control} name="organization" render={({ field }) => (
                                                <FormItem><FormLabel>Organization</FormLabel><FormControl><Input placeholder="Company/Community name" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                             <FormField control={form.control} name="location" render={({ field }) => (
                                                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
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
                                <FormItem className="pt-6"><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Describe your role and the hackathons you organize." {...field} rows={4} readOnly={!isEditing} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-3">Social Links</h3>
                                {isEditing ? (
                                    <div className="flex flex-col gap-4">
                                        <FormField control={form.control} name="contact_email" render={({ field }) => (
                                            <FormItem className="w-full"><FormLabel>Contact Email</FormLabel><FormControl><Input placeholder="organizer@company.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="website" render={({ field }) => (
                                            <FormItem className="w-full"><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://your-organization.com" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <FormField control={form.control} name="linkedin" render={({ field }) => (
                                                <FormItem className="w-full"><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/your-profile" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button asChild variant="outline" className="w-full justify-start">
                                            <Link href={form.getValues("linkedin")} target="_blank">
                                                <Linkedin className="mr-2 h-4 w-4" />
                                                LinkedIn
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
