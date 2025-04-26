import { ReactNode } from "react";

export default function CRMLayout({ children }: { children: ReactNode }) {
  return <main className="h-full">{children}</main>;
}
