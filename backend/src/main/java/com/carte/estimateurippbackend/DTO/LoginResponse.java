// src/main/java/com/carte/estimateurippbackend/DTO/LoginResponse.java
package com.carte.estimateurippbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
  private String token;
  private Long id;
  private String email;
  private String nom;
  private String prenom;
  private String role;
}
