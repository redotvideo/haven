export default function Label({className = "", children}: {className?: string; children: React.ReactNode}) {
	return <label className={`text-gray-300 mb-2 block text-sm font-medium leading-6 ${className}`}>{children}</label>;
}
