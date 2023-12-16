"use client";
import Padding from "../../components/padding";
import PageHeading from "../../components/page-heading";
import Sidebar from "../../components/sidebar";
import Warning from "../../components/warning";
import {useState} from "react";
import Button from "../../components/form/button";
import AddCreditCard from "./add-credit-card";
import AddBalance from "./add-balance";
import {Elements} from "@stripe/react-stripe-js";
import {revalidate} from "./actions";
import {loadStripe} from "@stripe/stripe-js";

interface Props {
	balance: string;
	creditCardInformation?: {
		last4: string;
		expiry: string;
	};
	stripePublishableKey: string;
}

export default function Billing({balance, creditCardInformation, stripePublishableKey}: Props) {
	const [openCreditCardModal, setOpenCreditCardModal] = useState<boolean>(false);
	const [openAddBalanceModal, setOpenAddBalanceModal] = useState<boolean>(false);

	// Make sure we refresh the page when the modals close
	function refreshWrapper(setOpenCloseFunction: (state: boolean) => void) {
		return (state: boolean) => {
			setOpenCloseFunction(state);
			void revalidate();
		};
	}

	return (
		<>
			<Elements stripe={loadStripe(stripePublishableKey)}>
				<AddCreditCard open={openCreditCardModal} setOpen={refreshWrapper(setOpenCreditCardModal)} />
			</Elements>
			<AddBalance open={openAddBalanceModal} setOpen={refreshWrapper(setOpenAddBalanceModal)} />
			<Sidebar current="Billing">
				<Padding>
					<PageHeading>Billing</PageHeading>
				</Padding>
				<div className="mt-6 border-b border-gray-800" />
				{!creditCardInformation && (
					<Warning message="Please add a payment method to continue using Haven after your free balance has run out." />
				)}

				<Padding>
					<div className="mt-6 flex items-center gap-x-16">
						<div>
							<div className="font-medium text-lg">Balance</div>
							<div className="mt-2 mb-4 font-semibold text-5xl">{balance}</div>
							<Button
								onClick={() => {
									if (creditCardInformation) {
										setOpenAddBalanceModal(true);
									} else {
										setOpenCreditCardModal(true);
									}
								}}
							>
								{creditCardInformation ? "Add balance" : "Add credit card"}
							</Button>
						</div>
						{creditCardInformation && (
							<div>
								<div className="border w-40 border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-lg p-4">
									<div className="flex items-center gap-x-6">
										<div>
											<div>**** {creditCardInformation.last4}</div>
											<div className="text-gray-400 text-sm">Expires {creditCardInformation.expiry}</div>
										</div>
									</div>
									<div className="flex gap-x-4 text-sm mt-3">
										<div className="text-gray-400 pointer-events-none">Using</div>

										{/*
											//TODO: Enable delete button
											<button className="hover:text-gray-600" onClick={() => {}}>
												Delete
											</button>
							*/}
									</div>
								</div>
							</div>
						)}
					</div>
				</Padding>
			</Sidebar>
		</>
	);
}
