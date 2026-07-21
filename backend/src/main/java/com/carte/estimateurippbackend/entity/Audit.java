// src/main/java/com/carte/estimateurippbackend/entity/Audit.java
package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Audit {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "id_dossier", nullable = false)
  private Long idDossier;

  @Column(name = "id_utilisateur", nullable = false)
  private Long idUtilisateur;

  @Column(name = "action", nullable = false, length = 50)
  private String action; // CREATE, UPDATE, DELETE

  @Column(name = "nom_utilisateur", length = 100)
  private String nomUtilisateur;

  @Column(name = "num_dos", length = 50)
  private String numDos;

  @Column(name = "anciennes_valeurs", columnDefinition = "TEXT")
  private String anciennesValeurs;

  @Column(name = "nouvelles_valeurs", columnDefinition = "TEXT")
  private String nouvellesValeurs;

  @Column(name = "date_action", nullable = false)
  private LocalDateTime dateAction;

  @Column(name = "ip_adresse", length = 50)
  private String ipAdresse;
}
