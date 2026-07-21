package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tiers_sinistres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TiersSinistre {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "sin", nullable = false, length = 50)
  private String sin;

  @Column(name = "nom_tiers", nullable = false, length = 255)
  private String nomTiers;

  @Column(name = "ipp", columnDefinition = "DECIMAL(5,2) DEFAULT 0")
  private Double ipp;

  @Column(name = "nbr_jrs", columnDefinition = "INT DEFAULT 0")
  private Integer nbrJrs;

  @Column(name = "reglements", columnDefinition = "DECIMAL(15,2) DEFAULT 0")
  private Double reglements;

  @Column(name = "date_creation")
  private LocalDateTime dateCreation;

  @Column(name = "date_modification")
  private LocalDateTime dateModification;

  @PrePersist
  protected void onCreate() {
    dateCreation = LocalDateTime.now();
    dateModification = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    dateModification = LocalDateTime.now();
  }

  // Relation avec donnees_sinistres
  @ManyToOne
  @JoinColumn(name = "sin", referencedColumnName = "sin", insertable = false, updatable = false)
  private DonneesSinistre donneesSinistre;
}
