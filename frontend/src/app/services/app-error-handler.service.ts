import { ErrorHandler, Injectable, PLATFORM_ID, inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification-service.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppErrorHandlerService implements ErrorHandler {
  private platformId = inject(PLATFORM_ID);
  private notify = inject(NotificationService);
  private ngZone = inject(NgZone);
  private router = inject(Router);

  handleError(error: unknown): void {
    const err: unknown = (error as any)?.rejection ?? error;
    let suppressConsole = false;

    // Only show notifications in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.notify.showError('Could not fetch the data from the database :(');
          } else if (err.status === 0) {
            this.notify.showError('Cannot connect to the server :(');
          } else if (
            err.error?.detail?.includes('Stock insuffisant') ||
            err.error?.detail?.includes('Produit en rupture de stock') ||
            err.error?.detail?.includes('insufficient quantity')
          ) {
            suppressConsole = this.stockIssue();
          } else {
            this.notify.showError(`HTTP ${err.status}: ${err.statusText || 'Unknown error'}`);
          }
        } else {
          this.notify.showError('An unexpected error occurred :(');
        }
      });
    }

    // Log the error to the console
    if (suppressConsole) return;
    console.error('Error message:', (err as any)?.message ?? err);
    console.error('Error object:', err);
  }

  // Custom messages
  stockIssue() {
    this.router.navigate(['']);
    this.notify.showWarning(
      'Certains produits dans votre panier sont en rupture de stock ou la quantité demandée est trop élevée. Le panier a été mis à jour en conséquence.'
    );
    setTimeout(() => {
      this.notify.clear();
    }, 5000);

    return true;
  }
}
