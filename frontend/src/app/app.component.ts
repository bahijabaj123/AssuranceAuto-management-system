// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/shared/modal/modal.component';
import { ModalService } from './services/modal.service';
import { AlerteBellComponent } from './components/layout/alerte-bell/alerte-bell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ModalComponent],
  template: `
    <router-outlet></router-outlet>
    
    <!-- ✅ Modal personnalisé -->
    <app-modal
      *ngIf="modalData"
      [visible]="true"
      [title]="modalData.title"
      [message]="modalData.message"
      [confirmText]="modalData.confirmText || 'Confirmer'"
      [cancelText]="modalData.cancelText || 'Annuler'"
      [type]="modalData.type || 'warning'"
      [details]="modalData.details"
      (confirmAction)="onModalConfirm()"
      (cancelAction)="onModalCancel()"
    ></app-modal>
  `,
  styles: []
})
export class AppComponent {
  title = 'estimateur-ipp';
  modalData: any = null;

  constructor(private modalService: ModalService) {
    this.modalService.modal$.subscribe(data => {
      this.modalData = data;
    });
  }

  onModalConfirm(): void {
    this.modalService.close(true);
  }

  onModalCancel(): void {
    this.modalService.close(false);
  }
}