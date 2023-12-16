"use client";
interface TextFieldProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: any) => void;

	type?: "text" | "number" | "password" | "email";
	name?: string;
	id?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;

	className?: string;
}

export default function TextField({
	value = undefined,
	defaultValue = undefined,
	onChange = undefined,
	type = "text",
	name = "",
	id = "",
	label = "",
	placeholder = "",
	disabled = false,
	required = false,
	className = "",
}: TextFieldProps) {
	return (
		<div className={`mb-4 ${className}`}>
			{label !== "" && (
				<label htmlFor={id} className="mb-2 block text-sm font-medium leading-6 text-gray-300">
					{label}
				</label>
			)}
			<div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
				<input
					id={id}
					type={type}
					name={name}
					className="flex-1 border-0 bg-transparent py-1.5 pl-3 text-white focus:ring-0 sm:text-sm sm:leading-6"
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					value={value}
					defaultValue={defaultValue}
					onChange={(e) => onChange && onChange(e.target.value)}
				/>
			</div>
		</div>
	);
}
