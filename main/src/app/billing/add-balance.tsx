import {Dialog} from "@headlessui/react";

import Modal from "../../components/modal";
import {XMarkIcon} from "@heroicons/react/24/outline";
import TextField from "../../components/form/textfield";
import Button from "../../components/form/button";
import {useState} from "react";
import {addBalanceAction} from "./actions";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export default function AddBalance({open, setOpen}: Props) {
	const [value, setValue] = useState<string>("$ 5");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	/**
	 * Make sure only only integers are allowed and they are prefixed with a dollar sign
	 */
	function onChange(str: string) {
		const re = /^\$ [0-9\b]*$/;
		if (re.test(str)) {
			setValue(str);
		}
	}

	async function addBalance() {
		const amountInDollars = parseInt(value.replace("$ ", ""));

		setLoading(true);
		try {
			await addBalanceAction(amountInDollars);
			setOpen(false);
		} catch (e) {
			setError((e as Error).message);
		}
		setLoading(false);
	}

	return (
		<Modal open={open} setOpen={setOpen}>
			<div>
				<div className="text-center">
					<Dialog.Title as="h3" className="text-base font-semibold leading-6">
						Add balance
					</Dialog.Title>
					<button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>
				<div className="my-4 text-sm text-gray-500">
					Add balance to your account. The selected amount will be charged to your credit card.
				</div>
				<TextField label="Amount" value={value} onChange={onChange} />
				<div className="mb-4 text-red-500 font-medium text-sm">{error}</div>
				<Button loading={loading} onClick={addBalance} className="w-full justify-center">
					Confirm
				</Button>
			</div>
		</Modal>
	);
}
