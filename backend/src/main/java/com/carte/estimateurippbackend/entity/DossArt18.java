// src/main/java/com/carte/estimateurippbackend/entity/DossArt18.java
package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "doss_art18")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossArt18 {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // ✅ La colonne "ref" est obligatoire dans la BDD
  @Column(name = "ref", nullable = false, length = 50)
  private String ref;

  // ✅ La colonne "reference" est optionnelle
  @Column(name = "reference", length = 50)
  private String reference;

  @Column(name = "cie_adverse", length = 100)
  private String cieAdverse;

  @Column(name = "region", length = 100)
  private String region;

  @Column(name = "blesse", length = 255)
  private String blesse;

  @Column(name = "date_envoi_lett_info")
  private LocalDate dateEnvoiLettInfo;

  @Column(name = "sec_recup_informe", length = 50)
  private String secRecupInforme;

  @Column(name = "date")
  private LocalDate date;

  @Column(name = "id_utilisateur")
  private Long idUtilisateur;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_modification")
  private LocalDate dateModification;
}
