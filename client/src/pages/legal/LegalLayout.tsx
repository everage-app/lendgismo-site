import type { PropsWithChildren } from "react";

export default function LegalLayout({ children }: PropsWithChildren) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {children}
    </main>
  );
}
