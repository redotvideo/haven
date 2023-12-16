// pages/_app.tsx
import {SessionProvider} from "next-auth/react";
import "../styles/globals.css";

function MyApp({Component, pageProps}: any) {
	return (
		<div lang="en" className="dark ">
			<div className="dark:bg-black dark:text-white">
				<SessionProvider>
					<Component {...pageProps} />
				</SessionProvider>
			</div>
		</div>
	);
}

export default MyApp;
