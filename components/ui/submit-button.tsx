"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant, type ButtonSize } from "./button";

export function SubmitButton({
  children,
  variant,
  size,
  fullWidth,
  className,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      loading={pending}
    >
      {children}
    </Button>
  );
}
