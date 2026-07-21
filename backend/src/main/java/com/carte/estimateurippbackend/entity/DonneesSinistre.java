package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donnees_sinistres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonneesSinistre {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "sin", nullable = false, length = 50)
  private String sin;

  @Column(name = "nom_tiers", length = 255)
  private String nomTiers;

  @Column(name = "annee")
  private Integer annee;

  @Column(name = "ipp", length = 20)
  private String ipp;

  @Column(name = "nbr_jrs", length = 20)
  private String nbrJrs;

  @Column(name = "rcc", precision = 15, scale = 2)
  private BigDecimal rcc;

  @Column(name = "rcm", precision = 15, scale = 2)
  private BigDecimal rcm;

  @Column(name = "dommages_vehicules", precision = 15, scale = 2)
  private BigDecimal dommagesVehicules;

  @Column(name = "bris_glaces", precision = 15, scale = 2)
  private BigDecimal brisGlaces;

  @Column(name = "dom_collision", precision = 15, scale = 2)
  private BigDecimal domCollision;

  @Column(name = "dommage", precision = 15, scale = 2)
  private BigDecimal dommage;

  @Column(name = "vol", precision = 15, scale = 2)
  private BigDecimal vol;

  @Column(name = "inc", precision = 15, scale = 2)
  private BigDecimal inc;

  @Column(name = "afp", precision = 15, scale = 2)
  private BigDecimal afp;

  @Column(name = "aux", precision = 15, scale = 2)
  private BigDecimal aux;

  @Column(name = "reg_rcc", precision = 15, scale = 2)
  private BigDecimal regRcc;

  @Column(name = "reg_rcm", precision = 15, scale = 2)
  private BigDecimal regRcm;

  @Column(name = "reg_dommages_vehicules", precision = 15, scale = 2)
  private BigDecimal regDommagesVehicules;

  @Column(name = "reg_bris_glaces", precision = 15, scale = 2)
  private BigDecimal regBrisGlaces;

  @Column(name = "reg_dom_collision", precision = 15, scale = 2)
  private BigDecimal regDomCollision;

  @Column(name = "reg_dommage", precision = 15, scale = 2)
  private BigDecimal regDommage;

  @Column(name = "reg_vol", precision = 15, scale = 2)
  private BigDecimal regVol;

  @Column(name = "reg_inc", precision = 15, scale = 2)
  private BigDecimal regInc;

  @Column(name = "reg_afp", precision = 15, scale = 2)
  private BigDecimal regAfp;

  @Column(name = "reg_aux", precision = 15, scale = 2)
  private BigDecimal regAux;

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
}
