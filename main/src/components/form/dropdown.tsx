"use client";
import {Fragment} from "react";
import {Menu, Transition} from "@headlessui/react";
import Label from "./label";

interface DropdownProps {
	children: React.ReactNode;
	options: string[];
	onSelect?: (selectedOption: string) => void;
	dropdownDirection?: "up" | "downRight" | "downLeft";
	label?: string;
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

// TODO: we can simplify this, most of these styles are the same
const styles = Object.freeze({
	up: "absolute left-0 bottom-0 z-10 ml-3 mb-10 w-56 rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
	downLeft:
		"absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
	downRight:
		"absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
});

export default function Dropdown({children, options, onSelect, label, dropdownDirection = "downRight"}: DropdownProps) {
	return (
		<>
			{label !== "" && <Label>{label}</Label>}
			<Menu as="div" className="relative inline-block text-left">
				<Menu.Button>{children}</Menu.Button>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<Menu.Items className={styles[dropdownDirection]}>
						<div className="py-1 rounded-md border border-gray-800">
							{options.map((option, index) => (
								<Menu.Item key={index}>
									{({active}) => (
										<a
											onClick={() => onSelect && onSelect(option)}
											className={classNames(active ? "bg-gray-100 dark:bg-gray-900" : "", "block px-4 py-2 text-sm")}
										>
											{option}
										</a>
									)}
								</Menu.Item>
							))}
						</div>
					</Menu.Items>
				</Transition>
			</Menu>
		</>
	);
}
