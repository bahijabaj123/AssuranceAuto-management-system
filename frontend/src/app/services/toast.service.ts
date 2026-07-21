// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  title?: string;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private defaultDuration = 4000;

  // ✅ Méthode principale
  show(
    message: string,
    type: Toast['type'] = 'info',
    duration: number = this.defaultDuration,
    options?: { title?: string; closable?: boolean }
  ): string {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      title: options?.title,
      closable: options?.closable !== false
    };
    
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    // Auto-suppression
    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  // ✅ Success
  success(message: string, duration?: number, options?: { title?: string; closable?: boolean }): string {
    return this.show(message, 'success', duration || this.defaultDuration, options);
  }

  // ✅ Error
  error(message: string, duration?: number, options?: { title?: string; closable?: boolean }): string {
    return this.show(message, 'error', duration || this.defaultDuration, options);
  }

  // ✅ Warning
  warning(message: string, duration?: number, options?: { title?: string; closable?: boolean }): string {
    return this.show(message, 'warning', duration || this.defaultDuration, options);
  }

  // ✅ Info
  info(message: string, duration?: number, options?: { title?: string; closable?: boolean }): string {
    return this.show(message, 'info', duration || this.defaultDuration, options);
  }

  // ✅ Supprimer un toast
  remove(id: string): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }

  // ✅ Supprimer tous les toasts
  clear(): void {
    this.toastsSubject.next([]);
  }

  // ✅ Toast avec confirmation (pour les actions importantes)
  confirm(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: { confirmText?: string; cancelText?: string }
  ): void {
    const confirmText = options?.confirmText || 'Confirmer';
    const cancelText = options?.cancelText || 'Annuler';
    
    // Créer un toast avec des boutons d'action
    const id = this.show(message, 'warning', 0, { title: 'Confirmation', closable: false });
    
    // Ajouter des boutons d'action (à gérer côté affichage)
    // Ou utiliser la boîte de dialogue native pour la simplicité
    if (confirm(`${message}\n\n${confirmText} / ${cancelText}`)) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
    this.remove(id);
  }

  // ✅ CONFIRMATION DE SUPPRESSION SPÉCIFIQUE (AJOUTÉ)
  confirmDelete(
    entityName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    const message = `⚠️ Êtes-vous sûr de vouloir supprimer ${entityName} ?\n\nCette action est irréversible.`;
    const confirmText = 'Supprimer';
    const cancelText = 'Annuler';
    
    if (confirm(`${message}\n\n${confirmText} / ${cancelText}`)) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  }

  // ✅ Toast de connexion réussie
  loginSuccess(nom?: string): void {
    this.success(
      `✅ Connexion réussie ! ${nom ? `Bienvenue ${nom}` : ''}`,
      3000,
      { title: 'Bienvenue' }
    );
  }

  // ✅ Toast de déconnexion
  logoutSuccess(): void {
    this.info('🔓 Déconnexion réussie. À bientôt !', 3000, { title: 'À bientôt' });
  }

  // ✅ Toast d'erreur de connexion
  loginError(): void {
    this.error(
      '❌ Email ou mot de passe incorrect. Veuillez réessayer.',
      4000,
      { title: 'Échec de connexion' }
    );
  }

  // ✅ Toast de suppression
  deleteSuccess(entity: string = 'Élément'): void {
    this.success(`✅ ${entity} supprimé avec succès`, 3000);
  }

  // ✅ Toast de suppression d'erreur
  deleteError(entity: string = 'Élément'): void {
    this.error(`❌ Erreur lors de la suppression du ${entity}`, 4000);
  }

  // ✅ Toast de création
  createSuccess(entity: string = 'Élément'): void {
    this.success(`✅ ${entity} créé avec succès`, 3000);
  }

  // ✅ Toast de mise à jour
  updateSuccess(entity: string = 'Élément'): void {
    this.success(`✅ ${entity} mis à jour avec succès`, 3000);
  }

  // ✅ Toast d'erreur générique
  genericError(): void {
    this.error(
      '❌ Une erreur est survenue. Veuillez réessayer.',
      4000,
      { title: 'Erreur' }
    );
  }

  // ✅ Toast d'avertissement
  warningMessage(message: string): void {
    this.warning(message, 3000);
  }

  // ✅ Toast d'information
  infoMessage(message: string): void {
    this.info(message, 3000);
  }
}