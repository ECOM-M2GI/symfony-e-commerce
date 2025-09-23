import { Injectable, signal } from '@angular/core';

export type AlertKind = 'error' | 'success' | 'warning' | 'info';
export interface AlertPayload { kind: AlertKind; text: string; }

@Injectable({ providedIn: 'root' })
export class NotificationService {
    readonly alert = signal<AlertPayload | null>(null);

    show(payload: AlertPayload) { this.alert.set(payload); }
    showError(text: string) { this.alert.set({ kind: 'error', text }); }
    showSuccess(text: string) { this.alert.set({ kind: 'success', text }); }
    showWarning(text: string) { this.alert.set({ kind: 'warning', text }); }
    showInfo(text: string) { this.alert.set({ kind: 'info', text }); }
    clear() { this.alert.set(null); }
}