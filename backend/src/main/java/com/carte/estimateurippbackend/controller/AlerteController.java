// src/main/java/com/carte/estimateurippbackend/controller/AlerteController.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.DTO.AlerteDTO;
import com.carte.estimateurippbackend.service.AlerteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alertes")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AlerteController {

  private final AlerteService alerteService;

  // ✅ Récupérer toutes les alertes d'un utilisateur
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<AlerteDTO>> getAlertesByUser(@PathVariable Long userId) {
    return ResponseEntity.ok(alerteService.getAlertesDTOByUtilisateur(userId));
  }

  // ✅ Récupérer les alertes non lues d'un utilisateur
  @GetMapping("/user/{userId}/non-lues")
  public ResponseEntity<List<AlerteDTO>> getAlertesNonLues(@PathVariable Long userId) {
    return ResponseEntity.ok(alerteService.getAlertesNonLues(userId));
  }

  // ✅ Compter les alertes non lues
  @GetMapping("/user/{userId}/count")
  public ResponseEntity<Map<String, Long>> countNonVues(@PathVariable Long userId) {
    Long count = alerteService.countNonVues(userId);
    return ResponseEntity.ok(Map.of("count", count));
  }

  // ✅ Marquer une alerte comme lue
  @PutMapping("/{id}/lue")
  public ResponseEntity<Void> marquerCommeLue(@PathVariable Long id) {
    alerteService.marquerCommeLue(id);
    return ResponseEntity.ok().build();
  }

  // ✅ Marquer toutes les alertes comme lues
  @PutMapping("/user/{userId}/tout-lu")
  public ResponseEntity<Void> marquerToutCommeLu(@PathVariable Long userId) {
    alerteService.marquerToutCommeLu(userId);
    return ResponseEntity.ok().build();
  }

  // ✅ Déclencher manuellement la vérification des alertes
  @PostMapping("/verifier")
  public ResponseEntity<Map<String, String>> verifierAlertes() {
    String result = alerteService.verifierEtCreerAlertes();
    return ResponseEntity.ok(Map.of("message", result));
  }
}
