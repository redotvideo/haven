import {useFormStatus} from "react-dom";
import Button from "./button";

export default function SubmitButton({className, children}: {className?: string; children: React.ReactNode}) {
	const {pending} = useFormStatus();

	return (
		<Button className={className} type={"submit"} loading={pending}>
			{children}
		</Button>
	);
}
