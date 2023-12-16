import Button from "~/components/form/button";
import TextField from "~/components/form/textfield";
import {getCsrfToken, signIn} from "next-auth/react";
import type {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {useRouter} from "next/router";
import Image from "next/image";
import {getServerAuthSession} from "~/server/auth";
import {useEffect} from "react";

export default function SignIn({csrfToken, session}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();

	useEffect(() => {
		if (session.expires) {
			void router.push("/models");
		}
	});

	return (
		<>
			<div className="h-screen bg-gray-50 dark:bg-gray-950">
				<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
					<div className="sm:mx-auto sm:w-full sm:max-w-md">
						<Image width="50" height="50" className="mx-auto w-8 " src="/logo-simple-dark.svg" alt="Your Company" />
						<h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
							Log in or create an account
						</h2>
					</div>

					<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
						<div className="bg-white px-6 pt-6 pb-12 shadow dark:border dark:border-gray-700/50 dark:bg-black sm:rounded-lg sm:px-12">
							<form className="space-y-4" method="post" action="/api/auth/signin/email">
								<input name="csrfToken" type="hidden" defaultValue={csrfToken} />

								<TextField id="email" name="email" type="email" label="Email address" required />

								<div>
									<Button id="submitButton" className="mt-4 w-full justify-center" type="submit">
										Sign in
									</Button>
								</div>
							</form>

							<div>
								<div className="relative mt-6">
									<div className="absolute inset-0 flex items-center" aria-hidden="true">
										<div className="w-full border-t border-gray-400" />
									</div>
									<div className="relative flex justify-center text-sm font-medium leading-6">
										<span className="bg-black px-6 text-gray-400">or</span>
									</div>
								</div>
								<div className="mt-6">
									<button
										onClick={() => signIn("google")}
										className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-1.5 text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
									>
										<svg
											stroke="currentColor"
											fill="currentColor"
											strokeWidth="0"
											viewBox="0 0 488 512"
											className="mr-2"
											height="1em"
											width="1em"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
										</svg>
										<span className="text-sm font-semibold leading-6">Sign in with Google</span>
									</button>
								</div>
								<div className="mt-6 text-sm text-gray-400">
									{"By signing in, you agree to Haven's "}
									<a className="underline" href="https://haven.run/terms">
										terms of service
									</a>
									, and{" "}
									<a className="underline" href="https://haven.run/privacy">
										privacy policy
									</a>
									.
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const csrfToken = await getCsrfToken(context);
	const session = await getServerAuthSession(context);

	return {
		props: {
			csrfToken,
			session: {
				expires: session?.expires || "",
			},
		},
	};
}
