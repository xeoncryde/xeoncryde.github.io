type Callback = (data?: unknown) => void;

export class EventBus {
  private listeners = new Map<string, Set<Callback>>();

  on(event: string, cb: Callback): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }

  off(event: string, cb: Callback): void {
    this.listeners.get(event)?.delete(cb);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const eventBus = new EventBus();
