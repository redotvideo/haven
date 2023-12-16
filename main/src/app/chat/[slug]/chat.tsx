"use client";
import {SendIcon} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import Button from "~/components/form/button";
import Label from "~/components/form/label";
import Settings from "./settings";
import {AdjustmentsHorizontalIcon} from "@heroicons/react/24/outline";
import {parseStream} from "./process";

import type {ChatMessage} from "./process";
import type {ChatSettings} from "./settings";
import UserAvatar from "~/components/user-avatar";
import {CpuChipIcon} from "@heroicons/react/20/solid";

export default function ChatComponent({modelId, email}: {modelId: string; email?: string}) {
	const [loading, setLoading] = useState(false);

	const [systemPrompt, setSystemPrompt] = useState("You're a useful assistant.");
	const [message, setMessage] = useState("");

	const lastMessageRef = useRef<HTMLDivElement>(null);
	const [chat, setChat] = useState<ChatMessage[]>([]);

	const [settingsOpen, setSettingsOpen] = useState(false);
	const [chatSettings, setChatSettings] = useState<ChatSettings>({
		temperature: 0.9,
		topP: 0.8,
		maxTokens: 256,
		repetitionPenalty: 1.1,
		doSample: true,
	});

	function AssistantAvatar() {
		return (
			<div>
				<div className="h-8 w-8 flex justify-center items-center rounded-md border-2 border-gray-100 bg-gray-50 leading-7 text-gray-400 dark:border-gray-800 dark:bg-gray-900">
					<CpuChipIcon className="h-5 w-5" />
				</div>
			</div>
		);
	}

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setLoading(true);
		setMessage("");

		const newChat: ChatMessage[] = [...chat, {role: "user", content: message}];
		setChat(newChat);

		const res = await fetch("/api/inference", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				modelId,
				history: [{role: "system", content: systemPrompt}, ...newChat],
				parameters: chatSettings,
			}),
		});

		if (res.status === 402) {
			alert(`You have reached the rate limit of 100 messages in 24h :(`);
			return;
		}

		// Res is a stream, read it line by line
		const reader = res.body!.getReader();

		newChat.push({role: "assistant", content: ""});
		await parseStream(reader, newChat, setChat);

		setLoading(false);
	};

	useEffect(() => {
		if (lastMessageRef.current) {
			lastMessageRef.current.scrollIntoView({behavior: "smooth"});
		}
	}, [chat]);

	return (
		<>
			<Settings
				open={settingsOpen}
				setOpen={setSettingsOpen}
				chatSettings={chatSettings}
				setChatSettings={setChatSettings}
			/>
			<Button className="fixed top-5 right-5 ml-72" onClick={() => setSettingsOpen(true)}>
				<AdjustmentsHorizontalIcon className="h-4 w-4" />
				Chat Parameters
			</Button>
			<div className="w-full p-4">
				<Label>System prompt</Label>
				<input
					className="w-full px-3 py-1.5 border rounded-md bg-gray-900 border-gray-700"
					type="text"
					value={systemPrompt}
					onChange={(e) => setSystemPrompt(e.target.value)}
					placeholder="You're a useful assistant."
				/>
			</div>
			{chat.map((message, i) => (
				<div
					key={i}
					className={`flex items-center gap-x-2 p-5 ${message.role === "assistant" && "bg-gray-950"}`}
					ref={i === chat.length - 1 ? lastMessageRef : null}
				>
					{message.role === "user" ? <UserAvatar name={email} /> : <AssistantAvatar />}
					<div className="p-2">{message.content}</div>
				</div>
			))}
			<div className="h-10" />
			<div className="fixed inset-x-0 bottom-0 ml-72">
				<div className="p-8">
					<form onSubmit={handleFormSubmit}>
						<div className="flex gap-x-2">
							<input
								type="text"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								className="w-full px-3 py-1.5 border rounded-md bg-gray-900 border-gray-700 disabled:opacity-50"
								placeholder="Type your message here..."
								disabled={loading}
							/>
							<Button type="submit" loading={loading}>
								<SendIcon className="h-4 w-4" />
								Send
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
