import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  q: string
  a: string
}

const faqs: FAQItem[] = [
  {
    q: 'What is Quorum AI fact-checking?',
    a: 'Quorum is a free multi-agent AI fact-verification system that uses four independent AI agents to research claims, cross-verify facts against reliable sources, detect hallucinations, and compile citation-backed verification reports with per-claim confidence scores. Every claim is sourced and every score is explainable.',
  },
  {
    q: 'How does multi-agent verification work?',
    a: 'Each claim goes through four specialized AI agents in sequence: a Research Agent extracts factual claims and gathers sources, a Verification Agent independently cross-checks each claim, a Hallucination Detector flags fabricated data and contradictions, and a Synthesis Agent compiles the final citation-backed report. The agents work independently so no single AI model controls the outcome.',
  },
  {
    q: 'Is Quorum free to use?',
    a: 'Yes, Quorum is completely free to use. It offers a demo mode that works without any API key using simulated data, and a live mode that connects to your own Anthropic API key for real AI-powered multi-agent verification.',
  },
  {
    q: 'Can I share fact-check reports with others?',
    a: 'Yes, Quorum generates unique shareable links for every completed verification report. You can share these links via email, social media, or messaging apps. Anyone with the link can view the full report without needing an account or API key.',
  },
  {
    q: 'How accurate is AI fact-checking with Quorum?',
    a: 'Quorum uses a multi-agent approach where four independent AI models cross-check each other, which significantly reduces the chance of hallucinations compared to single-model fact-checking. Each claim receives a confidence score (0-100%) backed by evidence, and the system flags potential inaccuracies for your review.',
  },
  {
    q: 'What types of claims can I verify?',
    a: 'You can verify any text-based factual claim including statistics, historical events, scientific findings, political statements, product claims, and more. Quorum works best with specific, verifiable claims rather than opinions or subjective statements.',
  },
  {
    q: 'Do I need an account to use Quorum?',
    a: 'No, Quorum requires no login or account creation. Simply visit the website, enter your claim, and start fact-checking immediately. Your verification history is saved locally in your browser for your convenience.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h2 id="faq-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-md mx-auto">
            Everything you need to know about Quorum's multi-agent AI fact-verification system. Still have questions? Reach out on GitHub.
          </p>
        </motion.div>

        <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="border border-border rounded-xl overflow-hidden bg-surface"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openIndex === i}
              >
                <h3 className="font-display text-sm font-semibold pr-4" itemProp="name">{faq.q}</h3>
                <ChevronDown
                  className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="px-5 pb-5 text-text-secondary text-sm leading-relaxed border-t border-border/50 pt-4"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <div itemProp="text">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
