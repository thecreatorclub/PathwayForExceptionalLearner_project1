// EventEmitter.ts
export class EventEmitter {
    private listeners: { [key: string]: Function[] } = {};
  
    on(event: string, fn: Function) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(fn);
    }
  
    off(event: string, fn: Function) {
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
  