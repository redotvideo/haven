import Modal from "~/components/modal";
import {Slider} from "~/components/ui/slider";
import Label from "~/components/form/label";
import {useState} from "react";
import Button from "~/components/form/button";
import {Dialog} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/20/solid";
import {Switch} from "~/components/ui/switch";

export interface ChatSettings {
	temperature: number;
	topP: number;
	maxTokens: number;
	repetitionPenalty: number;
	doSample: boolean;
}

function SettingsSlider({
	label,
	value,
	setValue,
	min = 0.1,
	max = 1,
	step = 0.01,
}: {
	label: string;
	value: number;
	setValue: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
}) {
	return (
		<div className="mb-4">
			<div className="flex justify-between items-center">
				<Label>{label}</Label>
				<div className="text-sm">{value}</div>
			</div>
			<Slider
				className="h-2"
				onValueChange={(value) => setValue(value[0]!)}
				defaultValue={[value]}
				value={[value]}
				min={min}
				max={max}
				step={step}
			/>
		</div>
	);
}

export default function Settings({
	open,
	setOpen,
	chatSettings,
	setChatSettings,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	chatSettings: ChatSettings;
	setChatSettings: (settings: ChatSettings) => void;
}) {
	// NOTE: we don't need the extra state here
	const [temperature, setTemperature] = useState(chatSettings.temperature);
	const [topP, setTopP] = useState(chatSettings.topP);
	const [maxTokens, setMaxTokens] = useState(chatSettings.maxTokens);
	const [repetitionPenalty, setRepetitionPenalty] = useState(chatSettings.repetitionPenalty);
	const [sample, setSample] = useState(chatSettings.doSample);

	function save() {
		setChatSettings({
			temperature,
			topP,
			maxTokens,
			repetitionPenalty,
			doSample: sample,
		});
		setOpen(false);
	}

	return (
		<>
			<Modal setOpen={setOpen} open={open}>
				<button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
					<XMarkIcon className="h-5 w-5" />
				</button>
				<Dialog.Title as="h3" className="mb-4 text-base font-semibold leading-6">
					Chat Parameters
				</Dialog.Title>
				<SettingsSlider label="Temperature" value={temperature} setValue={setTemperature} max={1.5} />
				<SettingsSlider label="Top P" value={topP} setValue={setTopP} />
				<SettingsSlider label="Max new tokens" value={maxTokens} setValue={setMaxTokens} min={10} max={2048} step={1} />
				<SettingsSlider
					label="Repetiton penalty"
					value={repetitionPenalty}
					setValue={setRepetitionPenalty}
					min={1}
					max={1.8}
				/>
				<div className="flex py-2 justify-between">
					<Label>Sample</Label>
					<Switch name="asd" checked={sample} onCheckedChange={setSample} />
				</div>
				<Button className="w-full justify-center" onClick={save}>
					Save
				</Button>
			</Modal>
		</>
	);
}
