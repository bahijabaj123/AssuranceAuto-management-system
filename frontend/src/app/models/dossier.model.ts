export interface Dossier {
    id: string;
    numero: string;
    nbJours: number;
    tauxIpp: number;          
    statut: string;
    indemnite: number;
    dateCreation: string;
    dateCloture: string | null;
    responsable: string;
    observations: string;
    codeLesions: string[];    
}