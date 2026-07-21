// src/main/java/com/carte/estimateurippbackend/entity/SuiviDossier.java
package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "suivi_dossiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuiviDossier {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "num_dos", nullable = false, length = 50)
  private String numDos;

  @Column(name = "date_audience")
  private LocalDate dateAudience;

  @Column(name = "tiers", length = 255)
  private String tiers;

  @Column(name = "ipp")
  private Double ipp;

  @Column(name = "nb_jours")
  private Integer nbJours;

  @Column(name = "reglements", length = 255)
  private String reglements;

  @Column(name = "nature_aff", length = 50)
  private String natureAff;

  @Column(name = "region", length = 100)
  private String region;

  @Column(name = "avocat", length = 255)
  private String avocat;

  // 1ère instance
  @Column(name = "aff_instance", length = 50)
  private String affInstance;

  @Column(name = "date_report_instance")
  private LocalDate dateReportInstance;

  @Column(name = "date_jug_instance")
  private LocalDate dateJugInstance;

  // Cour d'appel
  @Column(name = "aff_appel", length = 50)
  private String affAppel;

  @Column(name = "date_report_appel")
  private LocalDate dateReportAppel;

  @Column(name = "date_jug_appel")
  private LocalDate dateJugAppel;

  // Cassation
  @Column(name = "aff_cassation", length = 50)
  private String affCassation;

  @Column(name = "date_jug_cassation")
  private LocalDate dateJugCassation;

  @Column(name = "observation", columnDefinition = "TEXT")
  private String observation;

  // Champs système
  @Column(name = "id_utilisateur")
  private Long idUtilisateur;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_modification")
  private LocalDate dateModification;

  @Transient  // ✅ Ne pas stocker en BDD, calculé à la volée
  public Integer getAnnee() {
    if (this.numDos != null && this.numDos.length() >= 4) {
      try {
        return Integer.parseInt(this.numDos.substring(0, 4));
      } catch (NumberFormatException e) {
        return null;
      }
    }
    return null;
  }

}
