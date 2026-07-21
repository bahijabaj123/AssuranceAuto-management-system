package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alerte {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "id_dossier")
  private Long idDossier;

  @Column(name = "num_dos", length = 50)
  private String numDos;

  // ✅ AJOUTER CE CHAMP (correspond à la colonne num_sinistre dans la BDD)
  @Column(name = "num_sinistre", nullable = false, length = 50)
  private String numSinistre;

  @Column(name = "id_utilisateur")
  private Long idUtilisateur;

  @Column(name = "nature", length = 20)
  private String nature;

  @Column(name = "message", columnDefinition = "TEXT")
  private String message;

  @Column(name = "date_signif")
  private LocalDate dateSignification;

  @Column(name = "jours_restants")
  private Integer joursRestants;

  @Column(name = "statut", length = 20)
  private String statut;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_envoi")
  private LocalDateTime dateEnvoi;

  @Column(name = "email_envoye")
  private Boolean emailEnvoye = false;

  @Column(name = "notification_vue")
  private Boolean notificationVue = false;

  @Column(name = "date_lecture")
  private LocalDateTime dateLecture;

  @Column(name = "actif")
  private Boolean actif = true;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_utilisateur", insertable = false, updatable = false)
  private Utilisateur utilisateur;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_dossier", insertable = false, updatable = false)
  private SuiviDossier dossier;

  @PrePersist
  protected void onCreate() {
    if (dateCreation == null) {
      dateCreation = LocalDate.now();
    }
    if (statut == null) {
      statut = "ACTIVE";
    }
    if (emailEnvoye == null) {
      emailEnvoye = false;
    }
    if (notificationVue == null) {
      notificationVue = false;
    }
    if (actif == null) {
      actif = true;
    }
    // ✅ Ajouter une valeur par défaut pour numSinistre
    if (numSinistre == null && numDos != null) {
      numSinistre = numDos;  // Utiliser numDos comme valeur par défaut
    }
  }
}
