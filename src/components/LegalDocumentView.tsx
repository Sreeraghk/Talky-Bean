import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, ArrowLeft, ExternalLink, Printer, Check, Copy } from 'lucide-react';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, LegalDocument } from '../data/legalDocuments';

interface LegalDocumentViewProps {
  initialDocument?: 'terms' | 'privacy';
  isModal?: boolean;
  onClose?: () => void;
  onNavigateHome?: () => void;
}

export function LegalDocumentView({
  initialDocument = 'terms',
  isModal = false,
  onClose,
  onNavigateHome
}: LegalDocumentViewProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialDocument);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab(initialDocument);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialDocument]);

  const doc: LegalDocument = activeTab === 'terms' ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${activeTab}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const containerContent = (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-border/40 pb-6">
        <div className="flex items-center gap-3">
          {(onClose || onNavigateHome) && (
            <button
              onClick={onClose || onNavigateHome}
              className="p-2 -ml-2 rounded-xl bg-card-soft hover:bg-app-border/40 text-text-main transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-text-main tracking-tight">Talky Bean</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                Official Legal Policy
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Effective & Last Updated: {doc.effectiveDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Document Switcher Tabs */}
          <div className="bg-card-soft p-1 rounded-2xl border border-app-border flex items-center gap-1">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <FileText size={13} />
              <span>Terms of Use</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Privacy Policy</span>
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-card-soft hover:bg-app-border/40 border border-app-border text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex p-2 rounded-xl bg-card-soft hover:bg-app-border/40 border border-app-border text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Print document"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Document Overview Banner */}
      <div className="p-6 rounded-3xl bg-accent/5 border border-accent/20 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
          {doc.title}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          This document governs your use of the Talky Bean voice learning platform, covering AI-generated responses, microphone speech recognition, subscription terms (Dodo Payments, Apple StoreKit, and Google Play), and data protection practices.
        </p>
      </div>

      {/* Table of Contents / Section Index */}
      <div className="bg-card-bg border border-app-border/60 rounded-3xl p-5 space-y-3">
        <p className="text-xs font-black uppercase tracking-wider text-text-muted">Table of Contents</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {doc.sections.map((section, idx) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-xs text-text-muted hover:text-accent hover:underline flex items-center gap-2 truncate py-1 transition-colors"
            >
              <span className="text-[10px] font-mono text-accent font-bold">{idx + 1}.</span>
              <span className="truncate">{section.heading.replace(/^\d+\.\s*/, '')}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Document Sections Body */}
      <div className="space-y-8">
        {doc.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-24"
          >
            <h2 className="text-base sm:text-lg font-black text-text-main border-b border-app-border/30 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>{section.heading}</span>
            </h2>
            <div className="text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-app-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <p>© {new Date().getFullYear()} Talky Bean. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab(activeTab === 'terms' ? 'privacy' : 'terms')}
            className="font-bold text-accent hover:underline cursor-pointer"
          >
            Switch to {activeTab === 'terms' ? 'Privacy Policy' : 'Terms of Use'} →
          </button>
          {(onClose || onNavigateHome) && (
            <button
              onClick={onClose || onNavigateHome}
              className="px-4 py-2 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors cursor-pointer"
            >
              Return to App
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-app-bg text-text-main rounded-3xl border border-app-border max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        >
          {containerContent}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-main selection:bg-accent selection:text-white">
      {containerContent}
    </div>
  );
}
