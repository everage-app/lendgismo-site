import type React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      q: "What exactly do we get?",
      a: "You receive the full source code, documentation, architecture diagrams, demo data, and a live handoff session to walk your team through setup, customization, and deployment.",
    },
    {
      q: "How long does it take to go live?",
      a: "Most teams integrate and stand up their branded version in a matter of weeks, depending on internal approvals and integrations (payments, KYC, etc.).",
    },
    {
      q: "Can we customize the UI and workflows?",
      a: "Yes. The codebase is modular and uses a modern React/TypeScript stack with Tailwind and shadcn patterns—easy to adapt to your brand and flows.",
    },
    {
      q: "Is there ongoing support?",
      a: "We offer optional support windows aligned to your timeline. You fully own the codebase and can continue independently at any time.",
    },
  ];

  return (
    <section className="py-14">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="bg-white/5 rounded-2xl border border-white/10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="px-4 text-white">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 text-zinc-300">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
