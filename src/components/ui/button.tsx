import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	className?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
};

export const Button: React.FC<ButtonProps> = ({ className = '', variant = 'primary', children, ...props }) => {
	const variants = {
		primary: 'bg-violet-600 hover:bg-violet-500 text-white',
		secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
		outline: 'bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300',
		ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
		danger: 'bg-red-600 hover:bg-red-500 text-white',
	};

	return (
		<button
			{...props}
			className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold disabled:opacity-50 transition-all ${variants[variant]} ${className}`}
		>
			{children}
		</button>
	);
};

export default Button;
