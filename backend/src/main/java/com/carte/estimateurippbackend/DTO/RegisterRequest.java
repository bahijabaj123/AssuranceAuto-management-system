// src/main/java/com/carte/estimateurippbackend/dto/RegisterRequest.java
package com.carte.estimateurippbackend.DTO;

import lombok.Data;

@Data
public class RegisterRequest {
  private String email;
  private String password;
  private String nom;
  private String prenom;
  private String role;
}
