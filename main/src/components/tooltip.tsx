import {HoverCard, HoverCardContent, HoverCardTrigger} from "~/components/ui/hover-card";
import {QuestionMarkCircleIcon} from "@heroicons/react/24/outline";

export default function Tooltip({children, className}: {children: React.ReactElement; className?: string}) {
	return (
		<div className={className}>
			<HoverCard>
				<HoverCardTrigger>
					<QuestionMarkCircleIcon className="w-4 h-4" />
				</HoverCardTrigger>
				<HoverCardContent
					className="text-center max-w-xs p-1 bg-gray-700 border border-gray-500 text-xs text-gray-300"
					side="top"
				>
					{children}
				</HoverCardContent>
			</HoverCard>
		</div>
	);
}
