package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "sort_jug")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SortJug {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "num_dos", length = 50)
  private String numDos;

  @Column(name = "jug_num", length = 50)
  private String jugNum;

  @Column(length = 100)
  private String region;

  @Column(name = "date_signification")
  private LocalDate dateSignification;

  @Column(name = "huissier_notaire", length = 255)
  private String huissierNotaire;

  @Column(length = 50)
  private String observation;

  @Column(name = "date_remise_financier")
  private LocalDate dateRemiseFinancier;

  @Column(name = "montant_exec", columnDefinition = "DECIMAL(15,2)")
  private Double montantExec;

  @Column(name = "id_utilisateur")
  private Long idUtilisateur;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_modification")
  private LocalDate dateModification;


}
