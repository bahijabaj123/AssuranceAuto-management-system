package com.carte.estimateurippbackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstimationResult {
  private double tauxEstime;
  private double min;
  private double max;
  private int nbDossiersSimilaires;
  private List<DossierSimilaire> dossiersSimilaires;

  public double getTauxEstime() {
    return tauxEstime;
  }

  public void setTauxEstime(double tauxEstime) {
    this.tauxEstime = tauxEstime;
  }

  public double getMin() {
    return min;
  }

  public void setMin(double min) {
    this.min = min;
  }

  public double getMax() {
    return max;
  }

  public void setMax(double max) {
    this.max = max;
  }

  public int getNbDossiersSimilaires() {
    return nbDossiersSimilaires;
  }

  public void setNbDossiersSimilaires(int nbDossiersSimilaires) {
    this.nbDossiersSimilaires = nbDossiersSimilaires;
  }

  public List<DossierSimilaire> getDossiersSimilaires() {
    return dossiersSimilaires;
  }

  public void setDossiersSimilaires(List<DossierSimilaire> dossiersSimilaires) {
    this.dossiersSimilaires = dossiersSimilaires;
  }
}
