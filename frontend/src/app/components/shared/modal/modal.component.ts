// src/app/components/shared/modal/modal.component.ts
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  details?: string;  // ✅ AJOUTER
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="modal-container" [class]="type">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <i class="fa" [class.fa-exclamation-triangle]="type === 'warning' || type === 'danger'"
               [class.fa-info-circle]="type === 'info'"
               [class.fa-check-circle]="type === 'success'"
               [style.color]="iconColor" aria-hidden="true"></i>
            {{ title }}
          </div>
          <button class="modal-close" (click)="cancel()">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <p>{{ message }}</p>
          <div *ngIf="details" class="modal-details">
            <i class="fa fa-info-circle" aria-hidden="true"></i>
            <span>{{ details }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-cancel" (click)="cancel()">
            {{ cancelText }}
          </button>
          <button class="btn-confirm" [class]="type" (click)="confirm()">
            <i class="fa" [class.fa-check]="type !== 'danger'"
               [class.fa-trash]="type === 'danger'" aria-hidden="true"></i>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-container {
      background: #ffffff;
      border-radius: 16px;
      max-width: 480px;
      width: 100%;
      padding: 0;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
    }

    .modal-container.warning { border-top: 4px solid #f39c12; }
    .modal-container.danger { border-top: 4px solid #e74c3c; }
    .modal-container.info { border-top: 4px solid #3498db; }
    .modal-container.success { border-top: 4px solid #2ecc71; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f0f2f5;
    }

    .modal-title {
      font-family: 'Poppins', 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .modal-title i {
      font-size: 20px;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 20px;
      color: #a0aec0;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: #f0f2f5;
      color: #1a202c;
    }

    .modal-body {
      padding: 20px 24px;
    }

    .modal-body p {
      font-size: 15px;
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .modal-details {
      margin-top: 12px;
      padding: 12px 16px;
      background: #f8f9fc;
      border-radius: 8px;
      font-size: 13px;
      color: #6b7a8f;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .modal-details i {
      color: #3498db;
      margin-top: 2px;
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      padding: 16px 24px 20px;
      border-top: 1px solid #f0f2f5;
      justify-content: flex-end;
    }

    .modal-footer button {
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-cancel {
      background: #f0f2f5;
      color: #4a5568;
    }

    .btn-cancel:hover {
      background: #e6eaef;
    }

    .btn-confirm {
      background: #0a2540;
      color: #ffffff;
    }

    .btn-confirm:hover {
      background: #1a3a7a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(10, 37, 64, 0.25);
    }

    .btn-confirm.warning {
      background: #f39c12;
    }
    .btn-confirm.warning:hover {
      background: #e67e22;
    }

    .btn-confirm.danger {
      background: #e74c3c;
    }
    .btn-confirm.danger:hover {
      background: #c0392b;
    }

    .btn-confirm.success {
      background: #2ecc71;
    }
    .btn-confirm.success:hover {
      background: #27ae60;
    }

    @media (max-width: 480px) {
      .modal-container {
        margin: 16px;
        max-width: 100%;
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .modal-footer button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ModalComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirmer';
  @Input() cancelText: string = 'Annuler';
  @Input() type: 'warning' | 'danger' | 'info' | 'success' = 'warning';
  @Input() details?: string;  // ✅ AJOUTER

  @Output() confirmAction = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();

  get iconColor(): string {
    const colors = {
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#3498db',
      success: '#2ecc71'
    };
    return colors[this.type] || '#f39c12';
  }

  confirm(): void {
    this.confirmAction.emit();
    this.visible = false;
  }

  cancel(): void {
    this.cancelAction.emit();
    this.visible = false;
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) {
      this.cancel();
    }
  }
}
