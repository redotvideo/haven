import Image from "next/image";

export interface Tile {
	id: number;
	name: string;
	imageUrl: string;
	selected: boolean;
	onClick: () => void;
}

interface TileProps {
	tiles: Tile[];
}

export default function Tiles({tiles}: TileProps) {
	return (
		<ul role="list" className={`grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-${tiles.length} xl:gap-x-8`}>
			{tiles.map((tile) => (
				<button
					key={tile.id}
					onClick={() => {
						tile.onClick();
					}}
				>
					<li className={`overflow-hidden rounded-xl ${tile.selected ? "border-2 border-blue-600" : ""}`}>
						<div className="flex items-center justify-center gap-x-4 bg-gray-50 p-6">
							<div className="h-12 w-12 flex justify-center items-center rounded-lg bg-white object-cover ring-1 ring-gray-900/10">
								<Image src={tile.imageUrl} alt={tile.name} className="h-8 w-8" />
							</div>
							<div className={`text-sm font-medium leading-6 ${tile.selected ? "text-gray-900" : "text-gray-400"} `}>
								{tile.name}
							</div>
						</div>
					</li>
				</button>
			))}
		</ul>
	);
}
