
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupOrganizer, type SignupFormValues } from "@/app/actions";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";


const signupFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
  </svg>
)

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
  </svg>
)

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
    </svg>
)

export default function OrganizerSignUpPage() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: SignupFormValues) => {
        const result = await signupOrganizer(values);
        if (result.success) {
            toast({
                title: "Success",
                description: result.success,
            });
            router.push("/organizer/login");
        } else {
             toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        }
    }


  return (
    <div className="flex-1">
      {isSubmitting && <LoadingOverlay message="Creating your account..." />}
      <div className="relative min-h-full w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-20 blur-3xl filter"></div>
          <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-tl from-pink-500 via-red-500 to-yellow-400 opacity-20 blur-3xl filter"></div>
        </div>
        <main className="container mx-auto flex h-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl bg-secondary/50 backdrop-blur-xl border border-white/10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">Create an Organizer Account</h2>
              <p className="text-muted-foreground mt-2">Start hosting your own hackathons.</p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email Address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button className="w-full font-bold" type="submit" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
            </Form>
            <div className="my-6 flex items-center">
              <hr className="w-full border-t border-gray-600" />
              <span className="px-2 text-muted-foreground">OR</span>
              <hr className="w-full border-t border-gray-600" />
            </div>
            <div className="space-y-4">
              <Button variant="secondary" className="w-full">
                <GoogleIcon className="h-5 w-5 mr-3" />
                Continue with Google
              </Button>
              <Button variant="secondary" className="w-full">
                <GitHubIcon className="h-5 w-5 mr-3" />
                Continue with GitHub
              </Button>
              <Button variant="secondary" className="w-full">
                <LinkedInIcon className="h-5 w-5 mr-3 fill-current" />
                Continue with LinkedIn
              </Button>
            </div>
            <p className="mt-8 text-center text-muted-foreground">
              Already have an account?
              <Link className="font-semibold text-accent hover:underline ml-1" href="/organizer/login">Sign In</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
