package com.carte.estimateurippbackend.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierSimilaire {
  private String id;
  private int nbJours;
  private List<String> lesions;
  private double ipp;
  private int score;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public int getNbJours() {
    return nbJours;
  }

  public void setNbJours(int nbJours) {
    this.nbJours = nbJours;
  }

  public List<String> getLesions() {
    return lesions;
  }

  public void setLesions(List<String> lesions) {
    this.lesions = lesions;
  }

  public double getIpp() {
    return ipp;
  }

  public void setIpp(double ipp) {
    this.ipp = ipp;
  }

  public int getScore() {
    return score;
  }

  public void setScore(int score) {
    this.score = score;
  }
}
