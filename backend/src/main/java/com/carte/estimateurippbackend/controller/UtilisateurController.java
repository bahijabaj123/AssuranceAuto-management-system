// src/main/java/com/carte/estimateurippbackend/controller/UtilisateurController.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.repository.UtilisateurRepository;
import com.carte.estimateurippbackend.repository.SuiviDossierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:4200")
public class UtilisateurController {

  private final UtilisateurRepository utilisateurRepository;
  private final SuiviDossierRepository suiviDossierRepository;

  public UtilisateurController(UtilisateurRepository utilisateurRepository,
                               SuiviDossierRepository suiviDossierRepository) {
    this.utilisateurRepository = utilisateurRepository;
    this.suiviDossierRepository = suiviDossierRepository;
  }

  // ✅ Récupérer tous les utilisateurs (ADMIN only)
  @GetMapping
  public ResponseEntity<List<Utilisateur>> getAll() {
    System.out.println("📋 Récupération de tous les utilisateurs");
    return ResponseEntity.ok(utilisateurRepository.findAll());
  }

  // ✅ Récupérer un utilisateur par ID
  @GetMapping("/{id}")
  public ResponseEntity<Utilisateur> getById(@PathVariable Long id) {
    return utilisateurRepository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // ✅ Récupérer le propriétaire d'un dossier par son numéro
  @GetMapping("/by-dossier")
  public ResponseEntity<Utilisateur> getProprietaireByDossier(@RequestParam String numDos) {
    System.out.println("🔍 Recherche du propriétaire pour le dossier: " + numDos);

    Optional<com.carte.estimateurippbackend.entity.SuiviDossier> dossierOpt = suiviDossierRepository.findByNumDos(numDos);

    if (dossierOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Long userId = dossierOpt.get().getIdUtilisateur();
    if (userId == null) {
      return ResponseEntity.notFound().build();
    }

    return utilisateurRepository.findById(userId)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // ============================================================
  // ✅ ADMIN : Supprimer un utilisateur
  // ============================================================
  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    System.out.println("🗑️ Suppression de l'utilisateur ID: " + id);

    // ✅ Vérifier que l'utilisateur existe
    Utilisateur user = utilisateurRepository.findById(id).orElse(null);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    // ✅ Empêcher la suppression de l'admin lui-même
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof Utilisateur) {
      Utilisateur currentUser = (Utilisateur) auth.getPrincipal();
      if (currentUser.getId().equals(id)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "❌ Vous ne pouvez pas supprimer votre propre compte"));
      }
    }

    // ✅ Vérifier si l'utilisateur a des dossiers
    List<com.carte.estimateurippbackend.entity.SuiviDossier> dossiers =
      suiviDossierRepository.findByIdUtilisateur(id);

    if (!dossiers.isEmpty()) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("message", "❌ Cet utilisateur a des dossiers. Supprimez-les d'abord."));
    }

    utilisateurRepository.deleteById(id);
    System.out.println("✅ Utilisateur supprimé: " + user.getEmail());

    return ResponseEntity.ok(Map.of("message", "✅ Utilisateur supprimé avec succès"));
  }

  // ============================================================
  // ✅ ADMIN : Mettre à jour le rôle d'un utilisateur
  // ============================================================
  @PutMapping("/{id}/role")
  public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
    String newRole = payload.get("role");
    System.out.println("✏️ Mise à jour du rôle pour l'utilisateur ID: " + id + " -> " + newRole);

    Utilisateur user = utilisateurRepository.findById(id).orElse(null);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    // ✅ Valider le rôle
    if (!"ROLE_USER".equals(newRole) && !"ROLE_ADMIN".equals(newRole)) {
      return ResponseEntity.badRequest()
        .body(Map.of("message", "❌ Rôle invalide. Utilisez ROLE_USER ou ROLE_ADMIN"));
    }

    // ✅ Empêcher de changer le rôle de l'admin lui-même
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof Utilisateur) {
      Utilisateur currentUser = (Utilisateur) auth.getPrincipal();
      if (currentUser.getId().equals(id)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "❌ Vous ne pouvez pas modifier votre propre rôle"));
      }
    }

    user.setRole(newRole);
    utilisateurRepository.save(user);
    System.out.println("✅ Rôle mis à jour pour: " + user.getEmail());

    return ResponseEntity.ok(Map.of("message", "✅ Rôle mis à jour avec succès"));
  }

  // ============================================================
  // ✅ ADMIN : Récupérer l'utilisateur connecté
  // ============================================================
  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof Utilisateur) {
      Utilisateur user = (Utilisateur) auth.getPrincipal();
      return ResponseEntity.ok(user);
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
      .body(Map.of("message", "Non authentifié"));
  }

// src/main/java/com/carte/estimateurippbackend/controller/UtilisateurController.java

  // ✅ ADMIN : Activer/Désactiver un utilisateur
  @PutMapping("/{id}/actif")
  public ResponseEntity<?> toggleActif(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
    Boolean actif = payload.get("actif");
    System.out.println("🔄 Changement de statut pour l'utilisateur ID: " + id + " -> actif: " + actif);

    Utilisateur user = utilisateurRepository.findById(id).orElse(null);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    // ✅ Empêcher de désactiver l'admin lui-même
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof Utilisateur) {
      Utilisateur currentUser = (Utilisateur) auth.getPrincipal();
      if (currentUser.getId().equals(id)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "❌ Vous ne pouvez pas modifier votre propre compte"));
      }
    }

    user.setActif(actif);
    user.setDateModification(LocalDate.now());
    utilisateurRepository.save(user);

    System.out.println("✅ Statut mis à jour pour: " + user.getEmail());
    return ResponseEntity.ok(Map.of("message", "✅ Statut mis à jour avec succès"));
  }

}
