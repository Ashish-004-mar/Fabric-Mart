import React, { useState } from 'react';
import { ShieldCheck, Award, Truck, Sparkles, FileText, CheckCircle2, Lock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNavigate?: (tab: string) => void;
  onNavigateMarketplace?: (query?: string, categoryId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onNavigateMarketplace }) => {
  const { user } = useAuth();
  const [activeModalKey, setActiveModalKey] = useState<string | null>(null);

  const handleCategoryLink = (query: string, catId?: string) => {
    if (onNavigateMarketplace) {
      onNavigateMarketplace(query, catId);
    } else {
      onNavigate?.('marketplace');
    }
  };

  const legalAndComplianceDocs: Record<string, { title: string; subtitle: string; icon: React.ReactNode; sections: { heading: string; body: string }[] }> = {
    'gots': {
      title: 'GOTS Organic Textile Certification Standard',
      subtitle: 'Global Organic Textile Standard Version 7.0 Ecological & Social Audit Compliance',
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      sections: [
        {
          heading: '1. Fiber Sourcing & Biological Integrity',
          body: 'GOTS certified organic fabrics listed on Fabric Mart require a minimum of 95% certified organic natural fibers (or 70% for "made with organic" labels). All raw cotton, linen, silk, or wool must originate from farms audited under IFOAM accredited organic farming practices without synthetic pesticides or GMO seeds.'
        },
        {
          heading: '2. Environmental & Processing Requirements',
          body: 'All chemical inputs (dyes, auxiliaries, sizing agents) must be evaluated and approved before use. Azo dyes releasing carcinogenic amine compounds, heavy metals, formaldehyde, phthalates, and aromatic solvents are strictly prohibited. Mills must operate functional effluent wastewater treatment plants (ETP) before discharge.'
        },
        {
          heading: '3. Social & Fair Labor Criteria',
          body: 'Every participating mill is audited against ILO key conventions. This includes zero child labor, safe and hygienic working conditions, fair living wages, maximum working hour limits, and freely chosen employment.'
        },
        {
          heading: '4. Lot Verification & Transaction Certificates (TC)',
          body: 'Fabric Mart automatically cross-references Transaction Certificates (TCs) issued by accredited certifying bodies (such as Control Union, IMO, or OneCert) for every mill shipment prior to escrow release.'
        }
      ]
    },
    'oeko-tex': {
      title: 'OEKO-TEX® Standard 100 Certification',
      subtitle: 'Tested for Harmful Substances & Skin Safety Compliance',
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      sections: [
        {
          heading: '1. Human-Ecological Safety Audit',
          body: 'OEKO-TEX® Standard 100 guarantees that textile goods are audited at all processing stages (from yarn spinning to final dyeing and finishing) for over 300 regulated and non-regulated harmful chemicals.'
        },
        {
          heading: '2. Product Classes & Threshold Limits',
          body: 'Suppliers on Fabric Mart undergo Class I (Infants & Toddlers up to 36 months) or Class II (Direct contact with skin, e.g., shirts, underwear, dresses) testing. Formaldehyde limits are strictly kept below 16 ppm for skin-contact items.'
        },
        {
          heading: '3. Annual Laboratory Testing',
          body: 'Independent OEKO-TEX partner institutes analyze samples for banned azo colorants, nickel emissions, perfluorinated chemicals (PFCs), lead, cadmium, and allergenic disperse dyes.'
        }
      ]
    },
    'grs': {
      title: 'GRS (Global Recycled Standard) Synthetics',
      subtitle: 'Chain of Custody & Recycled Content Verification',
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      sections: [
        {
          heading: '1. Post-Consumer Recycled Content',
          body: 'GRS fabrics must contain at least 50% verified recycled material (e.g., post-consumer rPET bottles, reclaimed ocean plastics, or recycled nylon waste) to carry the GRS verification logo on Fabric Mart.'
        },
        {
          heading: '2. Full Supply Chain Traceability',
          body: 'From raw waste collector to yarn extruder, weaver, and finisher, every step must hold valid Scope Certificates (SC) and Transaction Certificates (TC).'
        },
        {
          heading: '3. Chemical & Environmental Management',
          body: 'GRS prohibits toxic chemical inputs during recycled polymer reprocessing and monitors energy/water usage reduction goals across partner mills.'
        }
      ]
    },
    'escrow-guarantee': {
      title: 'Escrow B2B Payment Guarantee Protocol',
      subtitle: 'Milestone Protected Financial Transactions for Apparel Buyers & Mills',
      icon: <Lock className="w-6 h-6 text-amber-500" />,
      sections: [
        {
          heading: '1. Tier-1 Bank Escrow Holding',
          body: 'When a buyer places a fabric purchase order, funds are deposited directly into an audited escrow account. Money is never disbursed upfront to suppliers before physical production and inspection milestones.'
        },
        {
          heading: '2. Three-Stage Milestone Payout',
          body: 'Payout is structured in three secure phases: (1) 20% Deposit upon Order Acceptance, (2) 50% upon Pre-Shipment Swatch Approval & Mill Quality Clearance, (3) 30% Final Balance upon Destination Lab Inspection & Roll Acceptance.'
        },
        {
          heading: '3. Defect & Tolerance Guarantee',
          body: 'If delivered fabric rolls deviate beyond agreed spec tolerances (e.g., GSM weight variation > 4%, color fastness rating < 4.0, or shrinkage > 3.5%), funds remain locked while Fabric Mart dispatches third-party SGS inspectors for binding resolution or 100% refund.'
        }
      ]
    },
    'iso-9001': {
      title: 'ISO 9001 Quality Audit Compliance',
      subtitle: 'Standardized Quality Management Systems for Industrial Textile Production',
      icon: <CheckCircle2 className="w-6 h-6 text-indigo-500" />,
      sections: [
        {
          heading: '1. Process Standardization & Spectrophotometry',
          body: 'ISO 9001 verified mills employ computer-controlled spectrophotometers to maintain color accuracy within Delta E < 0.8 across repeat dye lots.'
        },
        {
          heading: '2. Four-Point Fabric Inspection Standard',
          body: 'Mill rolls are graded according to ASTM D5430 Four-Point System. Defect points per 100 square yards must remain under 20 points for Premium A-Grade clearance.'
        },
        {
          heading: '3. Continuous Quality Audits',
          body: 'Participating suppliers submit quarterly calibration reports for tensile strength, tear resistance, and pilling resistance testers.'
        }
      ]
    },
    'privacy-policy': {
      title: 'Fabric Mart Privacy Policy & Data Protection',
      subtitle: 'Effective Date: January 1, 2026 • Global B2B Data Compliance',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      sections: [
        {
          heading: '1. Information We Collect',
          body: 'Fabric Mart collects corporate profile details (company name, VAT/GST registration, work emails), delivery locations, tech packs, fabric specifications, and purchase order history necessary to facilitate B2B transactions.'
        },
        {
          heading: '2. Encryption & Confidentiality',
          body: 'All communications, custom tech packs, and sample request notes are protected using TLS 1.3 in transit and AES-256 encryption at rest in our SQLite & Cloud database servers. Proprietary garment designs are strictly protected by automated NDAs.'
        },
        {
          heading: '3. Account Control & Immediate Data Erasure',
          body: 'Users maintain full control over their account data. You may update your profile or permanently delete your entire account and associated records directly from your Dashboard settings with instant database removal.'
        }
      ]
    },
    'terms-of-service': {
      title: 'Fabric Mart Terms of Service',
      subtitle: 'Governing Principles for B2B Textile Sourcing & Marketplace Transactions',
      icon: <FileText className="w-6 h-6 text-slate-400" />,
      sections: [
        {
          heading: '1. Marketplace Platform Agreement',
          body: 'By creating an account on Fabric Mart as an Apparel Buyer or Textile Supplier, you agree to comply with verified B2B trading practices, authentic representation of fabric specs (GSM, width, fiber content), and prompt order fulfillment.'
        },
        {
          heading: '2. Order Minimums (MOQ) & Custom Sampling',
          body: 'Each supplier sets binding Minimum Order Quantities (MOQ) for production rolls. Swatch sample requests are provided for physical evaluation prior to bulk purchase orders.'
        },
        {
          heading: '3. Dispute Arbitration',
          body: 'Disputes regarding fabric quality, shipping delays, or quantity shortages are submitted to Fabric Mart’s Quality Resolution Desk within 14 calendar days of delivery.'
        }
      ]
    },
    'supplier-escrow-terms': {
      title: 'Supplier Escrow & Payment Settlement Terms',
      subtitle: 'Financial Regulations for Registered Textile Manufacturers & Suppliers',
      icon: <Lock className="w-6 h-6 text-amber-500" />,
      sections: [
        {
          heading: '1. Escrow Deposit & Payout Clearances',
          body: 'Suppliers receive automated notifications when buyer funds are locked in escrow. Milestone disbursements are automatically transferred to supplier bank accounts upon milestone verification.'
        },
        {
          heading: '2. Quality Inspection SLAs',
          body: 'Buyers have a 7-day inspection window upon fabric delivery to complete lab roll testing. If no quality dispute is filed within 14 days of delivery confirmation, escrow funds automatically clear to the mill.'
        },
        {
          heading: '3. Chargeback & Rejection Regulations',
          body: 'Arbitrated fabric rejections due to unannounced composition changes or severe dye bleeding mandate full mill replacement or buyer refund as per Escrow Terms.'
        }
      ]
    }
  };

  const activeDoc = activeModalKey ? legalAndComplianceDocs[activeModalKey] : null;

  return (
    <footer className="bg-[#0b1c30] text-slate-300 border-t border-slate-800">
      {/* Value Proposition Strip */}
      <div className="border-b border-slate-800/80 bg-[#131b2e] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Verified B2B Mills</h4>
              <p className="text-xs text-slate-400">Strict quality & lab compliance checks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">AI Fabric Matching</h4>
              <p className="text-xs text-slate-400">Instant GSM & composition recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">GOTS & OEKO-TEX</h4>
              <p className="text-xs text-slate-400">Certified sustainable global standards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Global Swatch Express</h4>
              <p className="text-xs text-slate-400">48-hour physical swatch air dispatch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                F
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Fabric Mart</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The next-generation B2B textile procurement platform connecting apparel brands, independent designers, and industrial manufacturers with verified global fabric mills.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Engine Connected to 500+ Verified Looms</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">MARKETPLACE</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleCategoryLink('', 'all')} className="hover:text-blue-400 transition-colors text-left">
                  All Textiles & Fabrics
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('Organic Sustainable', 'cat-sustainable')} className="hover:text-blue-400 transition-colors text-left">
                  Organic & Sustainable
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('Silk Satin', 'cat-silk')} className="hover:text-blue-400 transition-colors text-left">
                  Silk & High-Count Satins
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('Performance Synthetic', 'cat-synthetics')} className="hover:text-blue-400 transition-colors text-left">
                  Performance Synthetics
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('Denim Selvedge', 'cat-denim')} className="hover:text-blue-400 transition-colors text-left">
                  Technical Denim
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">SOLUTIONS</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {(!user || user.role === 'BUYER') && (
                <>
                  <li>
                    <button onClick={() => onNavigate?.('onboarding-buyer')} className="hover:text-blue-400 transition-colors text-left">
                      For Apparel Buyers
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate?.(user ? 'buyer-dashboard' : 'auth')}
                      className="hover:text-blue-400 transition-colors text-left"
                    >
                      Request Custom Swatch Book
                    </button>
                  </li>
                </>
              )}
              {(!user || user.role === 'SUPPLIER') && (
                <>
                  <li>
                    <button onClick={() => onNavigate?.('onboarding-supplier')} className="hover:text-blue-400 transition-colors text-left">
                      For Textile Suppliers / Mills
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate?.(user ? 'supplier-dashboard' : 'auth')}
                      className="hover:text-blue-400 transition-colors text-left"
                    >
                      Supplier Hub Portal
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">COMPLIANCE & SECURITY</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveModalKey('gots')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  GOTS Organic Certification
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModalKey('oeko-tex')} className="hover:text-blue-400 transition-colors text-left cursor-pointer">
                  OEKO-TEX Standard 100
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModalKey('grs')} className="hover:text-purple-400 transition-colors text-left cursor-pointer">
                  GRS Recycled Poly Standard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModalKey('escrow-guarantee')} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Escrow B2B Payment Guarantee
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModalKey('iso-9001')} className="hover:text-indigo-400 transition-colors text-left cursor-pointer">
                  ISO 9001 Quality Audit
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">SUPPORT</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate?.('faq')} className="hover:text-blue-400 transition-colors text-left cursor-pointer">
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('faq')} className="hover:text-blue-400 transition-colors text-left cursor-pointer">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('faq')} className="hover:text-blue-400 transition-colors text-left cursor-pointer">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <a href="mailto:support@fabricmart.com" className="hover:text-blue-400 transition-colors text-left cursor-pointer">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 Fabric Mart Inc. Industrial Precision in Every Thread. All rights reserved.</p>
          <div className="flex gap-6">
            <button
              onClick={() => setActiveModalKey('privacy-policy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModalKey('terms-of-service')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModalKey('supplier-escrow-terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Supplier Escrow Terms
            </button>
          </div>
        </div>
      </div>

      {/* COMPLIANCE & LEGAL POLICY MODAL */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
                  {activeDoc.icon}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {activeDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {activeDoc.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalKey(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300">
              {activeDoc.sections.map((sec, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {sec.heading}
                  </h4>
                  <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified & Enforced on Fabric Mart B2B Infrastructure
              </span>
              <button
                onClick={() => setActiveModalKey(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
