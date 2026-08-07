import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  Scissors,
  ShieldCheck,
  Truck,
  PackageCheck,
  AlertCircle,
  ExternalLink,
  Info,
  Calendar,
  MapPin,
  Barcode
} from 'lucide-react';

export interface StageInfo {
  key: OrderStatus;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ElementType;
}

export const SHIPMENT_STAGES: StageInfo[] = [
  {
    key: 'Pending',
    label: 'Order Placed',
    shortLabel: 'Pending',
    desc: 'Purchase order received and queued for mill review.',
    icon: Clock,
  },
  {
    key: 'Confirmed',
    label: 'Mill Confirmed',
    shortLabel: 'Confirmed',
    desc: 'Inventory verified and production slot reserved.',
    icon: CheckCircle2,
  },
  {
    key: 'Preparing',
    label: 'Cutting & Packing',
    shortLabel: 'Preparing',
    desc: 'Yards measured, rolls winding, and lab inspection.',
    icon: Scissors,
  },
  {
    key: 'Ready for Dispatch',
    label: 'QC Verified',
    shortLabel: 'QC Passed',
    desc: 'Vacuum foil sealed, barcoded & ready for courier pick-up.',
    icon: ShieldCheck,
  },
  {
    key: 'Shipped',
    label: 'In Transit',
    shortLabel: 'Shipped',
    desc: 'Dispatched via Air Freight Express with live GPS tracking.',
    icon: Truck,
  },
  {
    key: 'Completed',
    label: 'Delivered',
    shortLabel: 'Delivered',
    desc: 'Package delivered and quality sign-off confirmed by buyer.',
    icon: PackageCheck,
  },
];

interface ShipmentTrackingTimelineProps {
  order: Order;
  isCompact?: boolean;
}

export const ShipmentTrackingTimeline: React.FC<ShipmentTrackingTimelineProps> = ({
  order,
  isCompact = false,
}) => {
  const isRejected = order.status === 'Rejected';

  const getCurrentIndex = (): number => {
    if (isRejected) return -1;
    const idx = SHIPMENT_STAGES.findIndex((s) => s.key === order.status);
    return idx >= 0 ? idx : 0;
  };

  const activeStageIdx = getCurrentIndex();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(
    activeStageIdx >= 0 ? activeStageIdx : 0
  );

  // Percentage progress calculation (0% to 100%)
  const progressPercent = isRejected
    ? 0
    : Math.round((activeStageIdx / (SHIPMENT_STAGES.length - 1)) * 100);

  // Helper to find recorded history for a stage
  const getHistoryForStage = (stageKey: OrderStatus) => {
    if (!order.statusHistory) return null;
    return order.statusHistory.find((h) => h.status === stageKey);
  };

  // Tracking details
  const waybillNumber = `FX-${order.orderNumber.replace(/[^0-9]/g, '') || '88219'}-US`;
  const estDeliveryDate = new Date(
    new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isRejected) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">Order Rejected by Mill:</span>{' '}
          {order.rejectionReason || 'Stock allocation was unavailable.'}
        </div>
      </div>
    );
  }

  // COMPACT MODE (used inside order list items)
  if (isCompact) {
    return (
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Shipment Progress ({progressPercent}%)</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            Est. Delivery: {order.status === 'Completed' ? 'Delivered' : estDeliveryDate}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-700 ease-out rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Mini Stage Label Markers */}
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
          <span>Pending</span>
          <span className="hidden sm:inline">Cutting</span>
          <span className="hidden sm:inline">In Transit</span>
          <span className={order.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
            Delivered
          </span>
        </div>
      </div>
    );
  }

  // FULL INTERACTIVE TRACKING TIMELINE
  const currentStageInfo = SHIPMENT_STAGES[selectedStageIdx] || SHIPMENT_STAGES[0];
  const selectedHistory = getHistoryForStage(currentStageInfo.key);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* HEADER WITH COURIER INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
              Live Shipment Telemetry
            </span>
            <span className="text-xs text-slate-400 font-medium">• Waybill #{waybillNumber}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            Order #{order.orderNumber}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {order.status}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Estimated Arrival</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {order.status === 'Completed' ? 'Delivered' : estDeliveryDate}
              </span>
            </div>
          </div>
          <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Destination</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS BAR TRACK */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-blue-600" />
            Overall Fulfillment Progress
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
            {progressPercent}% Completed
          </span>
        </div>

        {/* Visual Bar */}
        <div className="relative w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-700 ease-out rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        {/* STEP NODES */}
        <div className="grid grid-cols-6 gap-1 relative pt-2">
          {SHIPMENT_STAGES.map((stage, idx) => {
            const isDone = idx <= activeStageIdx;
            const isCurrent = idx === activeStageIdx;
            const isSelected = idx === selectedStageIdx;
            const StageIcon = stage.icon;

            return (
              <button
                key={stage.key}
                onClick={() => setSelectedStageIdx(idx)}
                className={`flex flex-col items-center text-center group cursor-pointer transition-all ${
                  isSelected ? 'scale-105' : 'hover:opacity-80'
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/20 font-bold shadow-md'
                      : isDone
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  } ${isSelected ? 'border-2 border-blue-600 ring-2 ring-blue-400/30' : ''}`}
                >
                  <StageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Step Name */}
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-2 transition-colors line-clamp-1 ${
                    isCurrent
                      ? 'text-blue-600 dark:text-blue-400'
                      : isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.shortLabel}
                </span>

                {/* Subtitle indicator */}
                <span className="text-[9px] text-slate-400 hidden lg:block mt-0.5">
                  {isDone ? '✓ Completed' : `Step ${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED STAGE DETAIL CARD */}
      <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
              <currentStageInfo.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Step {selectedStageIdx + 1}: {currentStageInfo.label}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStageInfo.desc}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              selectedStageIdx < activeStageIdx
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                : selectedStageIdx === activeStageIdx
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800 animate-pulse'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            }`}
          >
            {selectedStageIdx < activeStageIdx
              ? 'Completed'
              : selectedStageIdx === activeStageIdx
              ? 'Current Phase'
              : 'Upcoming'}
          </span>
        </div>

        {/* Log / Note for this phase */}
        {selectedHistory ? (
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-bold text-slate-600 dark:text-slate-300">Log Entry Verified</span>
              <span>{new Date(selectedHistory.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {selectedHistory.note || 'Milestone confirmed by mill manager.'}
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>
              {selectedStageIdx <= activeStageIdx
                ? 'Milestone completed at supplier facility.'
                : 'Awaiting completion of prior fulfillment steps.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
