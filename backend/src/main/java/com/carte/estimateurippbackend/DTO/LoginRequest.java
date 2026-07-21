// src/main/java/com/carte/estimateurippbackend/dto/LoginRequest.java
package com.carte.estimateurippbackend.DTO;

import lombok.Data;

@Data
public class LoginRequest {
  private String email;
  private String password;
}
