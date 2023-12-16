import Image from "next/image";

export default function Login() {
	return (
		<>
			<div className="h-screen bg-gray-50 dark:bg-gray-950">
				<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
					<div className="sm:mx-auto sm:w-full sm:max-w-md">
						<Image
							width="50"
							height="50"
							className="mx-auto h-8 w-auto"
							src="/logo-simple-dark.svg"
							alt="Your Company"
						/>
					</div>

					<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
						<div className="bg-white px-6 py-12 shadow dark:border dark:border-gray-700/50 dark:bg-black sm:rounded-lg sm:px-12">
							Please open the link we just sent to your email address to be logged in.
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
