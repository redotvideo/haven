"use client";
import {
	Bars3Icon,
	Cog8ToothIcon,
	ChevronUpDownIcon,
	XMarkIcon,
	CreditCardIcon,
	ChatBubbleLeftRightIcon,
	TableCellsIcon,
} from "@heroicons/react/24/outline";

import Dropdown from "./form/dropdown";
import {Dialog, Transition} from "@headlessui/react";
import {Fragment, useState} from "react";
import Link from "next/link";
import {signOut, useSession} from "next-auth/react";
import Image from "next/image";
import UserAvatar from "./user-avatar";

type SidebarItem = "Models" | "Datasets" | "Billing" | "Settings" | "None";

// TODO: these are copied form tailwindui so there are multiple in the codebase.
// we should only use one
function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

interface Props {
	children: React.ReactNode;
	current: SidebarItem;
	title?: string;
}

export default function Sidebar(props: Props) {
	// TODO: pass in through props
	const email = useSession().data?.user.email || "";

	const [sidebarOpen, setSidebarOpen] = useState(false);

	let navigation = [
		{
			name: "Models",
			page: "/models",
			icon: ChatBubbleLeftRightIcon,
			current: false,
		},
		{
			name: "Datasets",
			page: "/datasets",
			icon: TableCellsIcon,
			current: false,
		},
		{name: "Billing", page: "/billing", icon: CreditCardIcon, current: false, headline: "Account"},
		{
			name: "Settings",
			page: "/settings",
			icon: Cog8ToothIcon,
			current: false,
		},
	];

	// Set current navigation item
	navigation.map((item) => {
		if (item.name === props.current) {
			item.current = true;
		}
	});

	if (props.current === "None") {
		navigation = [];
	}

	return (
		<>
			<div>
				<Transition.Root show={sidebarOpen} as={Fragment}>
					<Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
						<Transition.Child
							as={Fragment}
							enter="transition-opacity ease-linear duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="transition-opacity ease-linear duration-300"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<div className="fixed inset-0 bg-gray-900/80" />
						</Transition.Child>

						<div className="fixed inset-0 flex">
							<Transition.Child
								as={Fragment}
								enter="transition ease-in-out duration-300 transform"
								enterFrom="-translate-x-full"
								enterTo="translate-x-0"
								leave="transition ease-in-out duration-300 transform"
								leaveFrom="translate-x-0"
								leaveTo="-translate-x-full"
							>
								<Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
									<Transition.Child
										as={Fragment}
										enter="ease-in-out duration-300"
										enterFrom="opacity-0"
										enterTo="opacity-100"
										leave="ease-in-out duration-300"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<div className="absolute left-full top-0 flex w-16 justify-center pt-5">
											<button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
												<span className="sr-only">Close sidebar</span>
												<XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
											</button>
										</div>
									</Transition.Child>
									<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 dark:bg-gray-950">
										<div className="flex h-16 shrink-0 items-center">
											<Link href="/models">
												<Image
													height={"10"}
													width={"10"}
													className="mt-4 h-6 w-auto"
													src="/logo-simple-dark.svg"
													alt="Haven"
												/>
											</Link>
										</div>
										<nav className="flex flex-1 flex-col">
											<ul role="list" className="flex flex-1 flex-col gap-y-7">
												<li>
													<ul role="list" className="-mx-2 space-y-1">
														{navigation.map((item) => (
															<li key={item.name}>
																<Link
																	href={item.page}
																	className={classNames(
																		item.current
																			? "bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
																			: "text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800",
																		"group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
																	)}
																>
																	<item.icon
																		className={classNames(
																			item.current ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400",
																			"h-6 w-6 shrink-0",
																		)}
																		aria-hidden="true"
																	/>
																	{item.name}
																</Link>
															</li>
														))}
													</ul>
												</li>
											</ul>
										</nav>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</Dialog>
				</Transition.Root>

				{/* Static sidebar for desktop */}
				<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-50 px-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="flex h-16 shrink-0 items-center">
							<Link href="/models">
								<Image height={"10"} width={"10"} className="mt-4 h-6 w-auto" src="/logo-simple-dark.svg" alt="Haven" />
							</Link>
						</div>
						<nav className="flex flex-1 flex-col">
							<ul role="list" className="flex flex-1 flex-col gap-y-7">
								<li>
									<ul role="list" className="-mx-2 space-y-1">
										{navigation.map((item) => (
											<li key={item.name}>
												{item.headline && (
													<div className="pl-2 text-xs font-semibold leading-6 text-gray-500 pt-4">{item.headline}</div>
												)}
												<Link
													href={item.page}
													className={classNames(
														item.current
															? "bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-gray-100"
															: "text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-900",
														"group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
													)}
												>
													<item.icon
														className={classNames(
															item.current ? "text-indigo-600 dark:text-gray-100" : "text-gray-400",
															"h-6 w-6 shrink-0",
														)}
														aria-hidden="true"
													/>
													{item.name}
												</Link>
											</li>
										))}
									</ul>
								</li>
								<li className="-mx-6 mt-auto">
									<div className="hover:bg-gray-50 dark:hover:bg-gray-900">
										<Dropdown options={["Logout"]} onSelect={() => signOut({callbackUrl: "/"})} dropdownDirection="up">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6">
													<UserAvatar name={email} />
													<span className="sr-only">Your profile</span>
													<span aria-hidden="true">{email}</span>
												</div>
												<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
											</div>
										</Dropdown>
									</div>
								</li>
							</ul>
						</nav>
					</div>
				</div>

				<div className="sticky top-0 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm dark:bg-gray-950 sm:px-6 lg:hidden">
					<div className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
						<span className="sr-only">Open sidebar</span>
						<Bars3Icon className="h-6 w-6" aria-hidden="true" />
					</div>
					<div className="flex-1 text-sm font-semibold leading-6 text-gray-900">{props.title}</div>
					<Dropdown options={["Logout"]} onSelect={() => signOut({callbackUrl: "/"})}>
						<span className="sr-only">Your profile</span>
						<UserAvatar name={email} />
					</Dropdown>
				</div>

				<main className="py-10 lg:pl-72">{props.children}</main>
			</div>
		</>
	);
}
