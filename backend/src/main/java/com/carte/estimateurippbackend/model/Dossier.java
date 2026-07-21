package com.carte.estimateurippbackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dossier {
  private String id;
  private String numero;
  private int nbJours;
  private double tauxIpp;
  private String statut;      // Clôturé, En cours, Expertise, En attente
  private double indemnite;
  private LocalDate dateCreation;
  private LocalDate dateCloture;
  private String responsable;
  private String observations;
  private List<String> codeLesions;  // Liste des codes lésions

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getNumero() {
    return numero;
  }

  public void setNumero(String numero) {
    this.numero = numero;
  }

  public int getNbJours() {
    return nbJours;
  }

  public void setNbJours(int nbJours) {
    this.nbJours = nbJours;
  }

  public double getTauxIpp() {
    return tauxIpp;
  }

  public void setTauxIpp(double tauxIpp) {
    this.tauxIpp = tauxIpp;
  }

  public String getStatut() {
    return statut;
  }

  public void setStatut(String statut) {
    this.statut = statut;
  }

  public double getIndemnite() {
    return indemnite;
  }

  public void setIndemnite(double indemnite) {
    this.indemnite = indemnite;
  }

  public LocalDate getDateCreation() {
    return dateCreation;
  }

  public void setDateCreation(LocalDate dateCreation) {
    this.dateCreation = dateCreation;
  }

  public LocalDate getDateCloture() {
    return dateCloture;
  }

  public void setDateCloture(LocalDate dateCloture) {
    this.dateCloture = dateCloture;
  }

  public String getResponsable() {
    return responsable;
  }

  public void setResponsable(String responsable) {
    this.responsable = responsable;
  }

  public String getObservations() {
    return observations;
  }

  public void setObservations(String observations) {
    this.observations = observations;
  }

  public List<String> getCodeLesions() {
    return codeLesions;
  }

  public void setCodeLesions(List<String> codeLesions) {
    this.codeLesions = codeLesions;
  }
}
