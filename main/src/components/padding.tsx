export default function Padding(props: {children: React.ReactNode}) {
	return <div className="px-4 sm:px-6 lg:px-8">{props.children}</div>;
}
