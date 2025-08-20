import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { memo } from "react";

interface HackathonCardProps {
  hackathon: {
    id: string;
    name: string;
    theme: string;
    date: string;
    rounds?: Array<{ name: string; date: string; description: string }>;
    prize: number;
    locationType: 'online' | 'offline';
    image: string;
    hint: string;
    description: string;
    sponsors?: string[];
  };
  showStatus?: boolean;
}

export const HackathonCard = memo(function HackathonCard({ hackathon, showStatus = true }: HackathonCardProps) {
  const getEventStatus = () => {
    if (hackathon.rounds && hackathon.rounds.length > 0) {
      const firstRoundDate = parseISO(hackathon.rounds[0].date);
      const lastRoundDate = parseISO(hackathon.rounds[hackathon.rounds.length - 1].date);
      
      if (isPast(lastRoundDate)) return { status: "Ended", color: "bg-gray-500" };
      if (isFuture(firstRoundDate)) return { status: "Upcoming", color: "bg-blue-500" };
      return { status: "Ongoing", color: "bg-green-500" };
    }
    
    // Fallback for single-date hackathons
    const eventDate = parseISO(hackathon.date);
    const eventEndDate = new Date(eventDate);
    eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration

    if (isPast(eventEndDate)) return { status: "Ended", color: "bg-gray-500" };
    if (isPast(eventDate)) return { status: "Ongoing", color: "bg-green-500" };
    return { status: "Upcoming", color: "bg-blue-500" };
  };

  const status = getEventStatus();
  const registrationEndDate = hackathon.rounds?.[0]?.date || hackathon.date;

  return (
    <Card className="overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Top Banner Section - Dark Theme */}
      <div className="relative h-48 bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Branding Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">SO</span>
            </div>
            <span className="text-white text-sm font-semibold">SuperOps</span>
          </div>
          <div className="flex items-center gap-2 text-white text-xs">
            <span>Powered by</span>
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="text-gray-400 text-sm mb-2 font-mono">2025</div>
          <div className="relative">
            <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 font-mono mb-2">
              {hackathon.name.toUpperCase()}
            </div>
            {/* Decorative frames */}
            <div className="absolute inset-0 border-2 border-pink-400 rounded-lg -m-2"></div>
            <div className="absolute inset-0 border border-pink-400 rounded-lg -m-4"></div>
            <div className="absolute inset-0 border border-pink-400 rounded-lg -m-6"></div>
            {/* Corner stars */}
            <Star className="absolute -top-3 -left-3 h-3 w-3 text-pink-400" />
            <Star className="absolute -top-3 -right-3 h-3 w-3 text-pink-400" />
            <Star className="absolute -bottom-3 -left-3 h-3 w-3 text-pink-400" />
            <Star className="absolute -bottom-3 -right-3 h-3 w-3 text-pink-400" />
          </div>
          <div className="text-gray-400 text-sm font-mono mt-2">SUPEROPS</div>
          <div className="text-white text-sm mt-2 max-w-xs">
            {hackathon.description.substring(0, 60)}...
          </div>
        </div>

        {/* Prize Pool Badge */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-sm">Prize pool of</span>
            <Trophy className="h-4 w-4" />
            <span className="font-bold">${hackathon.prize.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bottom Details Section - White */}
      <CardContent className="p-6 bg-white">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{hackathon.name}</h3>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              FREE
            </Badge>
            <span className="text-gray-400">|</span>
            <Badge variant="outline" className="text-xs font-semibold">
              {hackathon.locationType.toUpperCase()}
            </Badge>
          </div>

          <div className="text-sm text-gray-900 mb-2">
            Registration Ends on
          </div>
          <div className="text-sm text-gray-500 mb-4">
            {format(parseISO(registrationEndDate), 'EEE MMM dd yyyy')}
          </div>

          {showStatus && (
            <div className="mb-4">
              <Badge className={`${status.color} text-white text-xs`}>
                {status.status}
              </Badge>
            </div>
          )}

          <LoadingButton 
            href={`/hackathons/${hackathon.id}`}
            loadingMessage="Opening hackathon..."
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Register Now
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
});
