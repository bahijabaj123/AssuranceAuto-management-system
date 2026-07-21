// src/main/java/com/carte/estimateurippbackend/DTO/AlerteDTO.java
package com.carte.estimateurippbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AlerteDTO {
  private Long id;
  private Long idDossier;
  private String numDos;
  private Long idUtilisateur;
  private String nomUtilisateur;
  private String nature;
  private String message;
  private LocalDateTime dateSignification;
  private LocalDateTime dateAlerte;
  private LocalDateTime dateEnvoi;
  private Boolean emailEnvoye;
  private Boolean notificationVue;
  private LocalDateTime dateLecture;
  private Boolean actif;

  public String getNatureLabel() {
    return nature != null && nature.equals("CORR") ? "🔴 Correctionnel" : "⚖️ Civil";
  }
}
