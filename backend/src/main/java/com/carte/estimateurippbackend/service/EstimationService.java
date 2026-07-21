package com.carte.estimateurippbackend.service;


import com.carte.estimateurippbackend.model.Dossier;
import com.carte.estimateurippbackend.model.DossierSimilaire;
import com.carte.estimateurippbackend.model.EstimationResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class EstimationService {

  private final DossierService dossierService;

  public EstimationService(DossierService dossierService) {
    this.dossierService = dossierService;
  }

  public EstimationResult estimerIPP(int nbJours, List<String> codesLesions) {
    // Calcul simplifié pour la démo
    double baseScore = Math.min(nbJours * 0.18, 20);
    double lesionBonus = codesLesions.size() * 2.5;
    double cumul = codesLesions.size() > 1 ? 1 + (codesLesions.size() - 1) * 0.15 : 1;
    double raw = Math.min((baseScore + lesionBonus) * cumul, 100);
    double tauxEstime = Math.round(raw * 10) / 10.0;

    // Fourchette
    double min = Math.max(0, tauxEstime - 3);
    double max = Math.min(100, tauxEstime + 4);

    // Dossiers similaires
    List<Dossier> similaires = dossierService.findSimilarDossiers(nbJours, codesLesions);
    List<DossierSimilaire> dossiersSimilaires = new ArrayList<>();
    Random random = new Random();

    for (Dossier d : similaires) {
      dossiersSimilaires.add(new DossierSimilaire(
        d.getId(),
        d.getNbJours(),
        d.getCodeLesions(),
        d.getTauxIpp(),
        70 + random.nextInt(25)  // Score de similitude aléatoire
      ));
    }

    return new EstimationResult(
      tauxEstime,
      min,
      max,
      dossiersSimilaires.size(),
      dossiersSimilaires
    );
  }
}
