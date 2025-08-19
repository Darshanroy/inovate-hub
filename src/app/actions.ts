
"use server";

import { teammateMatch, TeammateMatchInput } from "@/ai/flows/teammate-matching";
import { z } from "zod";

const findTeammatesFormSchema = z.object({
  skills: z.string().min(1, "Please enter at least one skill."),
  interests: z.string().min(1, "Please enter at least one interest."),
  category: z.string().min(1, "Please select a category."),
});

type FindTeammatesFormValues = z.infer<typeof findTeammatesFormSchema>;

export async function findTeammates(values: FindTeammatesFormValues) {
  const validatedFields = findTeammatesFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }
  
  const { skills, interests, category } = validatedFields.data;
  
  const input: TeammateMatchInput = {
    userSkills: skills.split(",").map(s => s.trim()).filter(Boolean),
    userInterests: interests.split(",").map(i => i.trim()).filter(Boolean),
    hackathonCategory: category,
  };

  try {
    const result = await teammateMatch(input);
    return { data: result };
  } catch (error) {
    console.error("Error in teammateMatch flow:", error);
    return { error: "An error occurred while matching teammates." };
  }
}


const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  tagline: z.string().min(1, "Tagline is required."),
  location: z.string().min(1, "Location is required."),
  bio: z.string().min(1, "Bio is required."),
  skills: z.string().min(1, "Please enter at least one skill."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
  github: z.string().url("Please enter a valid GitHub URL."),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export async function updateProfile(values: ProfileFormValues) {
  const validatedFields = profileFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }

  // In a real application, you would save this data to a database.
  console.log("Profile updated:", validatedFields.data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: "Profile updated successfully!" };
}

const organizerProfileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  organization: z.string().min(1, "Organization is required."),
  bio: z.string().min(1, "Bio is required."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
  github: z.string().url("Please enter a valid GitHub URL."),
});

export type OrganizerProfileFormValues = z.infer<typeof organizerProfileFormSchema>;

export async function updateOrganizerProfile(values: OrganizerProfileFormValues) {
  const validatedFields = organizerProfileFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }

  console.log("Organizer Profile updated:", validatedFields.data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: "Profile updated successfully!" };
}


const judgeProfileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  specialization: z.string().min(1, "Specialization is required."),
  bio: z.string().min(1, "Bio is required."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
});

export type JudgeProfileFormValues = z.infer<typeof judgeProfileFormSchema>;

export async function updateJudgeProfile(values: JudgeProfileFormValues) {
    const validatedFields = judgeProfileFormSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid input." };
    }
    
    console.log("Judge Profile updated:", validatedFields.data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: "Profile updated successfully!" };
}


const signupFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export async function signupParticipant(values: SignupFormValues) {
    const validatedFields = signupFormSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid input." };
    }

    console.log("New participant signup:", validatedFields.data);
    // In a real app, create user in Firebase Auth and database.
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: "Account created successfully! You can now log in." };
}

export async function signupOrganizer(values: SignupFormValues) {
    const validatedFields = signupFormSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid input." };
    }

    console.log("New organizer signup:", validatedFields.data);
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: "Organizer account created successfully! You can now log in." };
}
