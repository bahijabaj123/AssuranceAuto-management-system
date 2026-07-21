package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.DTO.TiersSinistreDTO;
import com.carte.estimateurippbackend.entity.TiersSinistre;
import com.carte.estimateurippbackend.service.TiersSinistreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tiers-sinistres")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class TiersSinistreController {

  private final TiersSinistreService tiersSinistreService;

  // ✅ Récupérer tous les tiers d'un sinistre
  @GetMapping("/sin/{sin}")
  public ResponseEntity<List<TiersSinistreDTO>> getTiersBySin(@PathVariable String sin) {
    try {
      List<TiersSinistreDTO> result = tiersSinistreService.getTiersBySin(sin);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Récupérer un tiers par son ID
  @GetMapping("/{id}")
  public ResponseEntity<TiersSinistreDTO> getTiersById(@PathVariable Long id) {
    try {
      TiersSinistreDTO tiers = tiersSinistreService.getTiersById(id);
      if (tiers == null) {
        return ResponseEntity.notFound().build();
      }
      return ResponseEntity.ok(tiers);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Créer un tiers
  @PostMapping
  public ResponseEntity<?> createTiers(@RequestBody TiersSinistre tiers) {
    try {
      if (tiers.getSin() == null || tiers.getSin().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Le numéro de sinistre est obligatoire"));
      }
      if (tiers.getNomTiers() == null || tiers.getNomTiers().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Le nom du tiers est obligatoire"));
      }
      TiersSinistreDTO created = tiersSinistreService.createTiers(tiers);
      return ResponseEntity.status(HttpStatus.CREATED).body(created);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", e.getMessage()));
    }
  }

  // ✅ Mettre à jour un tiers
  @PutMapping("/{id}")
  public ResponseEntity<?> updateTiers(@PathVariable Long id, @RequestBody TiersSinistre tiers) {
    try {
      TiersSinistreDTO updated = tiersSinistreService.updateTiers(id, tiers);
      return ResponseEntity.ok(updated);
    } catch (RuntimeException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("message", e.getMessage()));
    }
  }

  // ✅ Supprimer un tiers
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTiers(@PathVariable Long id) {
    try {
      tiersSinistreService.deleteTiers(id);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Supprimer tous les tiers d'un sinistre
  @DeleteMapping("/sin/{sin}")
  public ResponseEntity<Void> deleteTiersBySin(@PathVariable String sin) {
    try {
      tiersSinistreService.deleteTiersBySin(sin);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Compter les tiers d'un sinistre
  @GetMapping("/sin/{sin}/count")
  public ResponseEntity<Map<String, Long>> countBySin(@PathVariable String sin) {
    try {
      Long count = tiersSinistreService.countBySin(sin);
      return ResponseEntity.ok(Map.of("count", count));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Récupérer la moyenne IPP d'un sinistre
  @GetMapping("/sin/{sin}/moyenne-ipp")
  public ResponseEntity<Map<String, Double>> getMoyenneIPP(@PathVariable String sin) {
    try {
      Double moyenne = tiersSinistreService.getMoyenneIPP(sin);
      return ResponseEntity.ok(Map.of("moyenneIPP", moyenne));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Récupérer le total des règlements d'un sinistre
  @GetMapping("/sin/{sin}/total-reglements")
  public ResponseEntity<Map<String, Double>> getTotalReglements(@PathVariable String sin) {
    try {
      Double total = tiersSinistreService.getTotalReglements(sin);
      return ResponseEntity.ok(Map.of("totalReglements", total));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // ✅ Récupérer les tiers avec IPP
  @GetMapping("/sin/{sin}/avec-ipp")
  public ResponseEntity<List<TiersSinistreDTO>> getTiersAvecIPP(@PathVariable String sin) {
    try {
      List<TiersSinistreDTO> result = tiersSinistreService.getTiersAvecIPP(sin);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
