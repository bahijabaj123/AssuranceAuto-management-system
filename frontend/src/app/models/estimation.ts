export interface EstimationResult {
    tauxEstime: number;
    min: number;
    max: number;
    nbDossiersSimilaires: number;
    dossiersSimilaires: DossierSimilaire[];
}

export interface DossierSimilaire {
    id: string;
    nbJours: number;
    lesions: string[];
    ipp: number;
    score: number;
}