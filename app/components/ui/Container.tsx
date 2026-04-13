import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return <div className={["mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8", className].filter(Boolean).join(" ")}>{children}</div>;
}
