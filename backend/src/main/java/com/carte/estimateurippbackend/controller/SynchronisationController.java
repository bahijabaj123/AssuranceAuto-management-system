package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.SuiviDossier;
import com.carte.estimateurippbackend.repository.SuiviDossierRepository;
import com.carte.estimateurippbackend.service.SynchronisationSinistreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/synchronisation")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class SynchronisationController {

  private final SynchronisationSinistreService synchronisationService;
  private final SuiviDossierRepository suiviDossierRepository;

  /**
   * Synchronise tous les dossiers existants vers donnees_sinistres
   * (Pour migration des données existantes)
   */
  @PostMapping("/tous-les-dossiers")
  public ResponseEntity<Map<String, Object>> synchroniserTousLesDossiers() {
    List<SuiviDossier> dossiers = suiviDossierRepository.findAll();
    synchronisationService.synchroniserTousLesDossiers(dossiers);

    Map<String, Object> response = new HashMap<>();
    response.put("message", "Synchronisation terminée");
    response.put("totalDossiers", dossiers.size());
    return ResponseEntity.ok(response);
  }

  /**
   * Synchronise un dossier spécifique
   */
  @PostMapping("/dossier/{id}")
  public ResponseEntity<Map<String, Object>> synchroniserDossier(@PathVariable Long id) {
    SuiviDossier dossier = suiviDossierRepository.findById(id).orElse(null);
    if (dossier == null) {
      return ResponseEntity.notFound().build();
    }

    synchronisationService.synchroniserVersDonneesSinistres(dossier);

    Map<String, Object> response = new HashMap<>();
    response.put("message", "Synchronisation terminée pour le dossier " + dossier.getNumDos());
    response.put("numDos", dossier.getNumDos());
    return ResponseEntity.ok(response);
  }
}
