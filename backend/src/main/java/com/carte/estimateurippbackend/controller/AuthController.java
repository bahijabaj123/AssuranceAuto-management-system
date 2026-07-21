// src/main/java/com/carte/estimateurippbackend/controller/AuthController.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.DTO.LoginRequest;
import com.carte.estimateurippbackend.DTO.LoginResponse;
import com.carte.estimateurippbackend.DTO.RegisterRequest;
import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.repository.UtilisateurRepository;
import com.carte.estimateurippbackend.service.AuthService;
import com.carte.estimateurippbackend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final JwtService jwtService;
  private final UtilisateurRepository utilisateurRepository;

  // ============================================================
  // ✅ 1. CONNEXION
  // ============================================================
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    System.out.println("🔐 Tentative de connexion: " + request.getEmail());

    try {
      Utilisateur user = authService.login(request.getEmail(), request.getPassword());

      // ✅ Mettre à jour la date de dernière connexion
      user.setDerniereConnexion(LocalDateTime.now());
      utilisateurRepository.save(user);

      // ✅ Générer le token avec le rôle
      String token = jwtService.generateToken(user.getEmail(), user.getRole());

      System.out.println("✅ Connexion réussie: " + user.getEmail());
      System.out.println("👤 Rôle: " + user.getRole());
      System.out.println("🕐 Dernière connexion: " + user.getDerniereConnexion());

      return ResponseEntity.ok(new LoginResponse(
        token,
        user.getId(),
        user.getEmail(),
        user.getNom(),
        user.getPrenom(),
        user.getRole()
      ));
    } catch (RuntimeException e) {
      System.out.println("❌ Erreur de connexion: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("message", "Email ou mot de passe incorrect"));
    }
  }

  // ============================================================
  // ✅ 2. INSCRIPTION
  // ============================================================
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    System.out.println("📝 Inscription: " + request.getEmail());

    try {
      Utilisateur user = new Utilisateur();
      user.setEmail(request.getEmail());
      user.setPassword(request.getPassword());
      user.setNom(request.getNom());
      user.setPrenom(request.getPrenom());
      user.setRole(request.getRole() != null ? request.getRole() : "ROLE_USER");

      Utilisateur saved = authService.register(user);
      String token = jwtService.generateToken(saved.getEmail(), saved.getRole());

      System.out.println("✅ Utilisateur créé: " + saved.getEmail());

      return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(
        token,
        saved.getId(),
        saved.getEmail(),
        saved.getNom(),
        saved.getPrenom(),
        saved.getRole()
      ));
    } catch (RuntimeException e) {
      System.out.println("❌ Erreur: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("message", e.getMessage()));
    }
  }

  // ============================================================
  // ✅ 3. RÉINITIALISATION DU MOT DE PASSE
  // ============================================================
  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
    String email = payload.get("email");
    String nouveauMotDePasse = payload.get("nouveauMotDePasse");

    System.out.println("🔑 Réinitialisation du mot de passe: " + email);

    if (email == null || nouveauMotDePasse == null) {
      return ResponseEntity.badRequest()
        .body(Map.of("message", "Email et nouveau mot de passe requis"));
    }

    try {
      Utilisateur user = authService.resetPassword(email, nouveauMotDePasse);
      System.out.println("✅ Mot de passe réinitialisé pour: " + email);
      return ResponseEntity.ok(Map.of(
        "message", "Mot de passe réinitialisé avec succès",
        "id", user.getId(),
        "email", user.getEmail()
      ));
    } catch (RuntimeException e) {
      System.out.println("❌ Erreur: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("message", "Email non trouvé"));
    }
  }

  // ============================================================
  // ✅ 4. VÉRIFICATION DU TOKEN
  // ============================================================
  @GetMapping("/verify")
  public ResponseEntity<?> verifyToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("valid", false, "message", "Token manquant"));
    }

    try {
      String token = authHeader.substring(7);
      boolean isValid = jwtService.validateToken(token);
      String email = jwtService.extractEmail(token);

      return ResponseEntity.ok(Map.of(
        "valid", isValid,
        "email", email
      ));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("valid", false, "message", "Token invalide"));
    }
  }

  // ============================================================
  // ✅ 5. RÉCUPÉRER L'UTILISATEUR CONNECTÉ
  // ============================================================
  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
    try {
      String token = authHeader.substring(7);
      String email = jwtService.extractEmail(token);

      if (!jwtService.validateToken(token)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("message", "Token invalide"));
      }

      Utilisateur user = authService.findByEmail(email);

      return ResponseEntity.ok(Map.of(
        "id", user.getId(),
        "email", user.getEmail(),
        "nom", user.getNom(),
        "prenom", user.getPrenom(),
        "role", user.getRole(),
        "actif", user.getActif(),
        "dateCreation", user.getDateCreation(),
        "derniereConnexion", user.getDerniereConnexion()
      ));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("message", "Non authentifié"));
    }
  }

  // ============================================================
  // ✅ 6. DÉCONNEXION (Optionnel - côté frontend)
  // ============================================================
  @PostMapping("/logout")
  public ResponseEntity<?> logout() {
    return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
  }
}
