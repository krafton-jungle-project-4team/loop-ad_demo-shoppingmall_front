import type { ButtonHTMLAttributes } from 'react';

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./buttonClassName";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ className, variant = 'primary', size = 'md', type = 'button', ...props }: ButtonProps) {
  return <button className={buttonClassName({ variant, size, className })} type={type} {...props} />;
}
