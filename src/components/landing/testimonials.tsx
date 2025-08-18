import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "This platform made hosting my hackathon a breeze! The support was fantastic, and the tools saved us countless hours.",
    name: "Sophia Carter",
    role: "Hackathon Organizer",
    avatar: "https://placehold.co/48x48.png",
    hint: "person portrait"
  },
  {
    quote: "I found my dream team through the platform's matching feature. We complemented each other's skills perfectly and won first place!",
    name: "Ethan Walker",
    role: "Hackathon Participant",
    avatar: "https://placehold.co/48x48.png",
    hint: "woman portrait"
  },
  {
    quote: "The community is so supportive and inspiring. I've learned so much from the mentors and other participants. Can't wait for the next event!",
    name: "Olivia Bennett",
    role: "Hackathon Participant",
    avatar: "https://placehold.co/48x48.png",
    hint: "man portrait"
  }
]

export function Testimonials() {
  return (
    <section className="py-20 px-6 container mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 font-headline">What Our Community Says</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="bg-secondary p-8 border border-white/10">
            <CardContent className="p-0">
              <p className="text-foreground">"{testimonial.quote}"</p>
              <div className="flex items-center mt-6">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
