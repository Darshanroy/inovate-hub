import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Heart } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { memo, useEffect, useState } from "react";
import { isWishlisted as isWishlistedInStorage } from "@/lib/wishlist";
import Image from "next/image";

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
	onWishlistToggle?: (hackathonId: string, isWishlisted: boolean) => void;
	isWishlisted?: boolean;
}

export const HackathonCard = memo(function HackathonCard({ 
	hackathon, 
	showStatus = true, 
	onWishlistToggle,
	isWishlisted = false 
}: HackathonCardProps) {
	const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);

	useEffect(() => {
		const fromStorage = isWishlistedInStorage(hackathon.id);
		setLocalWishlisted(isWishlisted ?? fromStorage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hackathon.id, isWishlisted]);

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

	const handleWishlistToggle = () => {
		const newWishlistedState = !localWishlisted;
		setLocalWishlisted(newWishlistedState);
		onWishlistToggle?.(hackathon.id, newWishlistedState);
	};

	const status = getEventStatus();
	const registrationEndDate = hackathon.rounds?.[0]?.date || hackathon.date;

	return (
		<Card className="overflow-hidden bg-secondary border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
			<CardContent className="p-4 flex flex-col gap-3">
				{/* Image */}
				<div className="relative">
					<Image
						src={hackathon.image}
						alt={hackathon.name}
						width={600}
						height={400}
						className="w-full h-auto aspect-video rounded-lg object-cover"
						data-ai-hint={hackathon.hint}
					/>
					{/* Wishlist Button */}
					{onWishlistToggle && status.status !== 'Ended' && (
						<Button
							variant="ghost"
							size="sm"
							className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full w-8 h-8 p-0"
							onClick={handleWishlistToggle}
						>
							<Heart 
								className={`h-4 w-4 ${localWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
							/>
						</Button>
					)}
				</div>

				{/* Content */}
				<div className="text-center">
					<LoadingButton 
						href={`/hackathons/${hackathon.id}?from=explore`}
						variant="ghost"
						className="p-0 h-auto text-lg font-bold leading-tight hover:text-blue-600"
						loadingMessage="Opening hackathon..."
					>
						{hackathon.name}
					</LoadingButton>
					<p className="text-sm text-muted-foreground mt-1">Theme: {hackathon.theme}</p>
					<p className="text-xs text-muted-foreground mt-1">
						Date: {hackathon.date ? new Date(hackathon.date).toLocaleDateString() : 'TBA'}
					</p>
					<p className="text-sm font-bold text-blue-600 mt-2">
						Prize: ₹{Number(hackathon.prize || 0).toLocaleString()}
					</p>
				</div>

				{/* Status Badge */}
				{showStatus && (
					<div className="mt-2 flex justify-center">
						<Badge className={`${status.color} text-white text-xs`}>
							{status.status}
						</Badge>
					</div>
				)}

				{/* Action Button */}
				<LoadingButton 
					href={`/hackathons/${hackathon.id}?from=explore`}
					loadingMessage="Opening hackathon..."
					className="w-full bg-blue-600 hover:bg-blue-700 text-white"
				>
					View Details
				</LoadingButton>
			</CardContent>
		</Card>
	);
});
