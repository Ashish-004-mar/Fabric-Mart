import { OrderStatus } from '../types';

export interface OrderStatusChangedEvent {
  orderId: string;
  orderNumber: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  buyerName?: string;
  supplierName?: string;
  note?: string;
  updatedAt?: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  buyerName?: string;
  grandTotal?: number;
}

export interface ToastNotificationEvent {
  id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  orderId?: string;
  status?: OrderStatus;
  timestamp?: string;
}

export type EventCallback<T = any> = (data: T) => void;

class MockEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // Return cleanup function for easy useEffect unbinding
    return () => this.off(event, callback);
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback as EventCallback);
    }
  }

  emit<T = any>(event: string, data: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error executing event listener for ${event}:`, err);
        }
      });
    }
  }

  // Convenience helper methods
  emitOrderStatusChange(
    orderId: string,
    orderNumber: string,
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
    buyerName?: string,
    note?: string
  ): void {
    const payload: OrderStatusChangedEvent = {
      orderId,
      orderNumber,
      oldStatus,
      newStatus,
      buyerName,
      note,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.emit('orderStatusChanged', payload);
  }

  emitOrderCreated(orderId: string, orderNumber: string, buyerName?: string, grandTotal?: number): void {
    const payload: OrderCreatedEvent = {
      orderId,
      orderNumber,
      buyerName,
      grandTotal,
    };
    this.emit('orderCreated', payload);
  }

  emitToast(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', orderId?: string, status?: OrderStatus): void {
    const payload: ToastNotificationEvent = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      orderId,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.emit('toastNotification', payload);
  }
}

// Singleton event emitter instance for application-wide real-time event distribution
export const orderEventEmitter = new MockEventEmitter();
