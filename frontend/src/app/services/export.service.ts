// src/app/services/export.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Dossier } from '../models/dossier.model';
import { EstimationHistorique } from './historique.service';

export interface DossierSimilaireExport {
  id: string;
  tauxIPP: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  // ============================================================
  // EXISTANT - Estimation IPP
  // ============================================================

  exporterEstimationPDF(
    nbJours: number,
    lesions: string[],
    tauxEstime: number,
    min: number,
    max: number,
    dossiersSimilaires: { id: string; tauxIPP: number }[]
  ): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(5, 10, 138);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('CARTE ASSURANCES', pageWidth / 2, 18, { align: 'center' });
    doc.setTextColor(76, 200, 221);
    doc.setFontSize(10);
    doc.text('Estimation IPP - Sinistre Auto', pageWidth / 2, 26, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Résultat de l\'estimation', 14, 45);

    doc.setFontSize(28);
    doc.setTextColor(5, 10, 138);
    doc.text(`${tauxEstime}%`, 14, 60);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fourchette : ${min}% - ${max}%`, 14, 72);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Nombre de jours d'ITT : ${nbJours}`, 14, 90);
    doc.text(`Lésions : ${lesions.join(', ')}`, 14, 100);
    doc.text(`Nombre de dossiers similaires : ${dossiersSimilaires.length}`, 14, 110);

    if (dossiersSimilaires.length > 0) {
      doc.text('Dossiers similaires :', 14, 130);
      const tableData = dossiersSimilaires.map(d => [d.id, `${d.tauxIPP}%`]);
      autoTable(doc, {
        startY: 135,
        head: [['Dossier', 'Taux IPP']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [5, 10, 138] },
        margin: { left: 14 },
      });
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    doc.save('estimation_IPP.pdf');
  }

  exporterDossiersExcel(dossiers: Dossier[], titre: string = 'Liste des dossiers'): void {
    const data = dossiers.map(d => ({
      'Numéro': d.id,
      'Jours ITT': d.nbJours,
      'Lésions': d.codeLesions.join(', '),
      'Taux IPP (%)': d.tauxIpp,
      'Statut': d.statut,
      'Indemnité (DT)': d.indemnite || 0,
      'Date création': d.dateCreation,
      'Date clôture': d.dateCloture || 'En cours',
      'Responsable': d.responsable
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dossiers');

    const colWidths = [
      { wch: 14 },
      { wch: 10 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `${titre}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  exporterHistoriqueExcel(historique: EstimationHistorique[]): void {
    const data = historique.map(h => ({
      'ID': h.id,
      'Date': new Date(h.date).toLocaleString('fr-FR'),
      'Jours ITT': h.nbJours,
      'Lésions': h.lesions.join(', '),
      'Taux IPP estimé (%)': h.tauxEstime,
      'Dossiers similaires': h.dossiersSimilaires.map(d => `${d.id} (${d.tauxIPP}%)`).join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historique');

    const colWidths = [
      { wch: 14 },
      { wch: 20 },
      { wch: 10 },
      { wch: 30 },
      { wch: 16 },
      { wch: 40 },
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Historique_estimations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // ============================================================
  // NOUVEAU - Export des données de gestion
  // ============================================================

  /**
   * Exporter les dossiers judiciaires
   */
  exporterDossiersJudiciaires(data: any[], fileName: string = 'Dossiers_Judiciaires'): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dossiers');

    // Ajuster la largeur des colonnes
    const colWidths = Object.keys(data[0]).map(() => ({ wch: 18 }));
    ws['!cols'] = colWidths;

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
  }

  /**
   * Exporter les jugements (Sort Jug)
   */
  exporterSortJug(data: any[], fileName: string = 'Sort_Jug'): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jugements');

    const colWidths = Object.keys(data[0]).map(() => ({ wch: 18 }));
    ws['!cols'] = colWidths;

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
  }

  /**
   * Exporter les dossiers provisoires
   */
  exporterDossiersProvisoires(data: any[], fileName: string = 'Dossiers_Provisoires'): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Provisoires');

    const colWidths = Object.keys(data[0]).map(() => ({ wch: 18 }));
    ws['!cols'] = colWidths;

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
  }

  /**
   * Exporter les dossiers ART18
   */
  exporterDossiersArt18(data: any[], fileName: string = 'Dossiers_ART18'): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ART18');

    const colWidths = Object.keys(data[0]).map(() => ({ wch: 18 }));
    ws['!cols'] = colWidths;

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
  }
}
