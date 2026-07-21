package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false, length = 50)
  private String numero;

  @Column(name = "nb_jours")
  private int nbJours;

  @Column(name = "taux_ipp")
  private double tauxIpp;

  @Column(length = 30)
  private String statut;

  private double indemnite;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_cloture")
  private LocalDate dateCloture;

  private String responsable;

  @Column(columnDefinition = "TEXT")
  private String observations;

  @ManyToMany
  @JoinTable(
    name = "dossier_lesion",
    joinColumns = @JoinColumn(name = "dossier_id"),
    inverseJoinColumns = @JoinColumn(name = "lesion_id")
  )
  private List<LesionEntity> lesions = new ArrayList<>();
}
