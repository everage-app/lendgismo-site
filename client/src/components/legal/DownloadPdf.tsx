"use client";
import { Download } from "lucide-react";
import * as React from "react";

export function DownloadPdf({ filename }: { filename: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
      aria-label={`Download ${filename} as PDF`}
      title="Download as PDF"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Download PDF</span>
    </button>
  );
}
