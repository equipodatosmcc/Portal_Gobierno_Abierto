import type { ReactNode } from "react";

export const runtime = "nodejs";

type AdminNewsLayoutProps = {
  children: ReactNode;
};

export default function AdminNewsLayout({ children }: AdminNewsLayoutProps) {
  return children;
}

