// src/main/java/com/carte/estimateurippbackend/entity/Utilisateur.java
package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false, length = 100)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(length = 100)
  private String nom;

  @Column(length = 100)
  private String prenom;


  @Column(length = 50)
  private String role = "ROLE_USER";

  @Column(name = "actif")
  private Boolean actif = true;

  @Column(name = "date_creation")
  private LocalDate dateCreation;

  @Column(name = "date_modification")
  private LocalDate dateModification;

  @Column(name = "derniere_connexion")
  private LocalDateTime derniereConnexion;
}
