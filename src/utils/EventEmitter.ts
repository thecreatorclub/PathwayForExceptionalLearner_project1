export type Listener = (data?: any) => void;

export class EventEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, fn: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(fn);
  }

  off(event: string, fn: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== fn
    );
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((fn) => fn(data));
  }
}