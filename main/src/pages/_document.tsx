import Document, {Html, Head, Main, NextScript} from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html lang="en" className="bg-gray-950">
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
