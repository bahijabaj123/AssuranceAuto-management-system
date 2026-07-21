// src/app/services/modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalData } from '../components/shared/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalData | null>(null);
  public modal$ = this.modalSubject.asObservable();

  private resolveCallback?: (value: boolean) => void;

  open(data: ModalData): Promise<boolean> {
    this.modalSubject.next(data);
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  confirm(
    message: string,
    title: string = 'Confirmation',
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'warning' | 'danger' | 'info' | 'success';
      details?: string;
    }
  ): Promise<boolean> {
    return this.open({
      title,
      message,
      confirmText: options?.confirmText || 'Confirmer',
      cancelText: options?.cancelText || 'Annuler',
      type: options?.type || 'warning',
      details: options?.details || ''  // ✅ AJOUTER details
    });
  }

  close(result: boolean): void {
    this.modalSubject.next(null);
    if (this.resolveCallback) {
      this.resolveCallback(result);
      this.resolveCallback = undefined;
    }
  }
}