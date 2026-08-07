import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FAQs } from '../data/faqs';
import { HelpCircle } from 'lucide-react';

export const FAQPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] flex flex-col pt-24 pb-12">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Everything you need to know about navigating the Fabric Mart platform.</p>
          </div>

          <div className="space-y-6">
            {FAQs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
