/*package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.Alerte;
import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/test/mail")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TestMailController {

  private final EmailService emailService;


  @PostMapping("/send")
  public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
    try {
      // Créer un utilisateur de test
      Utilisateur utilisateur = new Utilisateur();
      utilisateur.setEmail(email);
      utilisateur.setNom("Test");
      utilisateur.setPrenom("Utilisateur");

      // Créer des alertes de test
      Alerte alerte1 = new Alerte();
      alerte1.setNumSinistre("2024000001");
      alerte1.setNature("CIV");
      alerte1.setDateSignif(LocalDate.now().plusDays(15));
      alerte1.setJoursRestants(15);

      Alerte alerte2 = new Alerte();
      alerte2.setNumSinistre("2024000002");
      alerte2.setNature("CORR");
      alerte2.setDateSignif(LocalDate.now().plusDays(5));
      alerte2.setJoursRestants(5);

      List<Alerte> alertes = Arrays.asList(alerte1, alerte2);

      // Envoyer l'email
      emailService.envoyerEmailAlertes(utilisateur, alertes);

      return ResponseEntity.ok("✅ Email envoyé avec succès à " + email);

    } catch (Exception e) {
      return ResponseEntity.badRequest().body("❌ Erreur : " + e.getMessage());
    }
  }
}
*/
