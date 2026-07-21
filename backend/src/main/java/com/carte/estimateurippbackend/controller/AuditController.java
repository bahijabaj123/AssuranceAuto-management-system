// src/main/java/com/carte/estimateurippbackend/controller/AuditController.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.DTO.AuditDTO;
import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuditController {

  private final AuditService auditService;

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<AuditDTO>> getAuditsByUser(@PathVariable Long userId) {
    return ResponseEntity.ok(auditService.getAuditsByUser(userId));
  }

  @GetMapping("/me")
  public ResponseEntity<List<AuditDTO>> getMyAudits(@RequestParam Long userId) {
    return ResponseEntity.ok(auditService.getAuditsAccessibles(userId));
  }

  @GetMapping("/all")
  public ResponseEntity<List<AuditDTO>> getAllAudits() {
    // ✅ Récupérer l'utilisateur connecté
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Utilisateur currentUser = null;
    if (auth != null && auth.getPrincipal() instanceof Utilisateur) {
      currentUser = (Utilisateur) auth.getPrincipal();
    }

    if (currentUser == null) {
      return ResponseEntity.status(401).build();
    }

    // ✅ Seul ADMIN peut voir tous les audits
    if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
      return ResponseEntity.status(403).build();
    }

    return ResponseEntity.ok(auditService.getAllAudits());
  }
}
