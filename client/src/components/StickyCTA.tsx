import React, { useEffect, useState, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

export default function StickyCTA() {
  const [visible, setVisible] = useState(false)
  const footerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    footerRef.current = document.querySelector('footer') as HTMLElement | null
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      const pastThreshold = scrolled > 0.25
      // Hide if footer is in view
      const footerTop = footerRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const nearFooter = footerTop < window.innerHeight - 120
      setVisible(pastThreshold && !nearFooter)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-4 z-[60] transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur shadow-xl p-3 md:p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="text-sm md:text-base text-white/90 font-medium text-center md:text-left">
            Ship a lender‑grade platform in weeks, not months.
            <span className="hidden md:inline text-zinc-300"> Pre-built workflows, docs, and integration scaffolding.</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:ml-auto">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              Request Handoff <ArrowRight size={16} />
            </a>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Read Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
