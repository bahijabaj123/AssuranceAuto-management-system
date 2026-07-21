package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "doss_provisoires")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossProvisoire {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "num_prov", nullable = false, length = 50)
  private String numProv;

  @Column(length = 50)
  private String affaire;

  @Column(length = 50)
  private String nature;

  @Column(length = 255)
  private String tiers;

  @Column
  private LocalDate date;

  @Column(name = "region_trib", length = 100)
  private String regionTrib;

  @Column(length = 255)
  private String avocat;

  @Column(name = "num_sinistre", length = 50)
  private String numSinistre;

  @Column(columnDefinition = "TEXT")
  private String observation;

  @Column(name = "id_utilisateur")
  private Long idUtilisateur;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_modification")
  private LocalDate dateModification;
}
