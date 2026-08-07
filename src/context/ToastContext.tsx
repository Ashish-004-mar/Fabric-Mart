import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { orderEventEmitter, OrderStatusChangedEvent, OrderCreatedEvent, ToastNotificationEvent } from '../utils/eventEmitter';
import { Order, OrderStatus } from '../types';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  status?: OrderStatus;
  oldStatus?: OrderStatus;
  orderId?: string;
  orderNumber?: string;
  timestamp: string;
  duration?: number;
}

export interface NextSimStep {
  label: string;
  orderNumber?: string;
  fromStatus?: OrderStatus;
  toStatus?: OrderStatus;
  hasActiveOrder?: boolean;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  simulateSupplierUpdate: (customOrderNum?: string, targetStatus?: OrderStatus) => Promise<void>;
  nextSimStep: NextSimStep;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STATUS_TO_TYPE_MAP: Record<OrderStatus, 'info' | 'success' | 'warning' | 'error'> = {
  Pending: 'info',
  Confirmed: 'info',
  Preparing: 'warning',
  'Ready for Dispatch': 'warning',
  Shipped: 'info',
  Completed: 'success',
  Rejected: 'error',
  Cancelled: 'error',
};

const STATUS_ICONS_TEXT: Record<OrderStatus, string> = {
  Pending: 'Order Received at Mill',
  Confirmed: 'Inventory Confirmed & Reserved',
  Preparing: 'Cutting & Packing Started',
  'Ready for Dispatch': 'QC Verification Complete',
  Shipped: 'Dispatched via Express Logistics',
  Completed: 'Delivered & Accepted by Buyer',
  Rejected: 'Order Rejected by Supplier',
  Cancelled: 'Order Cancelled',
};

const STATUS_SEQUENCE: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Dispatch',
  'Shipped',
  'Completed',
];

const TRANSITION_NOTES: Record<string, string> = {
  'Pending->Confirmed': 'Apex Textiles verified inventory and reserved mill production slot.',
  'Confirmed->Preparing': 'Mill manager allocated cutting floor and initiated fabric roll inspection.',
  'Preparing->Ready for Dispatch': 'QC verification completed; fabric rolls wrapped in vacuum foil with barcode tags.',
  'Ready for Dispatch->Shipped': 'Order dispatched via Express Air Freight. Tracking #FX-88219-US generated.',
  'Shipped->Completed': 'Shipment arrived at buyer facility in NYC; digital acceptance sign-off complete.',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [nextSimStep, setNextSimStep] = useState<NextSimStep>({
    label: '',
    hasActiveOrder: false,
  });

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const addToast = (toastInput: Omit<ToastItem, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast: ToastItem = {
      ...toastInput,
      id,
      timestamp,
      duration: toastInput.duration || 6000,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 active toasts
  };

  // Inspect server orders to calculate what the next simulation step will be
  const refreshSimPreview = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/my');
      const data = await res.json();
      const orders: Order[] = data.orders || [];

      // Find first active order that is not completed or rejected
      const activeOrder = orders.find((o) => o.status !== 'Completed' && o.status !== 'Rejected');
      if (activeOrder) {
        const currIdx = STATUS_SEQUENCE.indexOf(activeOrder.status);
        if (currIdx >= 0 && currIdx < STATUS_SEQUENCE.length - 1) {
          const nextStatus = STATUS_SEQUENCE[currIdx + 1];
          setNextSimStep({
            label: `Simulate PO #${activeOrder.orderNumber}: '${activeOrder.status}' → '${nextStatus}'`,
            orderNumber: activeOrder.orderNumber,
            fromStatus: activeOrder.status,
            toStatus: nextStatus,
            hasActiveOrder: true,
          });
          return;
        }
      }

      // If no active non-completed orders exist (e.g. all orders are Completed)
      setNextSimStep({
        label: '',
        hasActiveOrder: false,
      });
    } catch {
      setNextSimStep({
        label: '',
        hasActiveOrder: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshSimPreview();

    // Listen for order status change events
    const unsubStatusChange = orderEventEmitter.on<OrderStatusChangedEvent>('orderStatusChanged', (event) => {
      const type = STATUS_TO_TYPE_MAP[event.newStatus] || 'info';
      const statusTitle = STATUS_ICONS_TEXT[event.newStatus] || `Status: ${event.newStatus}`;

      addToast({
        title: `Order #${event.orderNumber} ${event.newStatus}`,
        message: `Supplier changed state from '${event.oldStatus}' to '${event.newStatus}'. ${statusTitle}.`,
        type,
        status: event.newStatus,
        oldStatus: event.oldStatus,
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        duration: 7000,
      });

      refreshSimPreview();
    });

    // Listen for new order creation events
    const unsubOrderCreated = orderEventEmitter.on<OrderCreatedEvent>('orderCreated', (event) => {
      addToast({
        title: `New Order Placed: #${event.orderNumber}`,
        message: `Order submitted by ${event.buyerName || 'Buyer'}. Total: $${(event.grandTotal || 0).toFixed(2)}. Status set to Pending.`,
        type: 'info',
        status: 'Pending',
        orderId: event.orderId,
        orderNumber: event.orderNumber,
        duration: 6000,
      });

      refreshSimPreview();
    });

    // Listen for direct toast events
    const unsubToast = orderEventEmitter.on<ToastNotificationEvent>('toastNotification', (event) => {
      addToast({
        title: event.title,
        message: event.message,
        type: event.type || 'info',
        status: event.status,
        orderId: event.orderId,
      });
    });

    return () => {
      unsubStatusChange();
      unsubOrderCreated();
      unsubToast();
    };
  }, [refreshSimPreview]);

  // Simulator function to advance orders step-by-step and update backend + trigger webhooks
  const simulateSupplierUpdate = async (customOrderNum?: string, targetStatus?: OrderStatus) => {
    try {
      const res = await fetch('/api/orders/my');
      const data = await res.json();
      const orders: Order[] = data.orders || [];

      let targetOrder = orders.find((o) =>
        customOrderNum ? o.orderNumber === customOrderNum : o.status !== 'Completed' && o.status !== 'Rejected'
      );

      // If no active order exists, create a new one!
      if (!targetOrder) {
        const createRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress: {
              companyName: 'My Fashion Brand',
              contactPerson: 'Buyer',
              phone: '+1 (555) 000-0000',
              addressLine1: '742 Fashion Avenue, Suite 800',
              city: 'New York',
              state: 'NY',
              postalCode: '10018',
              country: 'United States',
            },
            items: [
              {
                productId: 'prod-4',
                productName: 'Premium Organic Linen Blend',
                productImage: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
                supplierName: 'Apex Textiles Ltd.',
                supplierId: 'user-supplier-1',
                selectedColor: 'Natural Ecru',
                quantityMeters: 120,
                unitPrice: 18.5,
              },
            ],
            subtotal: 2220,
            shippingEstimate: 120,
            taxAmount: 177.6,
          }),
        });
        const createData = await createRes.json();
        targetOrder = createData.order;

        if (targetOrder) {
          orderEventEmitter.emitOrderCreated(
            targetOrder.id,
            targetOrder.orderNumber,
            'Sarah Jenkins',
            targetOrder.grandTotal
          );
        }
        await refreshSimPreview();
        return;
      }

      // Determine status transition
      const oldStatus = targetOrder.status;
      let newStatus: OrderStatus = targetStatus || 'Confirmed';

      if (!targetStatus) {
        const currIdx = STATUS_SEQUENCE.indexOf(oldStatus);
        if (currIdx >= 0 && currIdx < STATUS_SEQUENCE.length - 1) {
          newStatus = STATUS_SEQUENCE[currIdx + 1];
        } else {
          newStatus = 'Completed';
        }
      }

      const noteKey = `${oldStatus}->${newStatus}`;
      const note = TRANSITION_NOTES[noteKey] || `Mill manager updated processing queue from ${oldStatus} to ${newStatus}.`;

      // Update backend
      await fetch(`/api/supplier/orders/${targetOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });

      // Emit real-time event to refresh all dashboards
      orderEventEmitter.emitOrderStatusChange(
        targetOrder.id,
        targetOrder.orderNumber,
        oldStatus,
        newStatus,
        targetOrder.buyerName || 'Buyer',
        note
      );

      await refreshSimPreview();
    } catch (err) {
      console.error('Failed to simulate supplier update:', err);
    }
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearToasts,
        simulateSupplierUpdate,
        nextSimStep,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
