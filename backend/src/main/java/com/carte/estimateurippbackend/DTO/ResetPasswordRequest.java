package com.carte.estimateurippbackend.DTO;

import lombok.Data;

@Data
public class ResetPasswordRequest {
  private String email;
  private String nouveauMotDePasse;
}
