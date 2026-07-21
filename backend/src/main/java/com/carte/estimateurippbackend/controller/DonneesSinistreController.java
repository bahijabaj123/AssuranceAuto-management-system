package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.DonneesSinistre;
import com.carte.estimateurippbackend.repository.DonneesSinistreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donnees-sinistres")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class DonneesSinistreController {

  private final DonneesSinistreRepository repository;

  // ✅ Récupérer tous les sinistres
  @GetMapping
  public List<DonneesSinistre> getAll() {
    return repository.findAll();
  }

  // ✅ Récupérer un sinistre par ID
  @GetMapping("/{id}")
  public ResponseEntity<DonneesSinistre> getById(@PathVariable Long id) {
    return repository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // ✅ RECHERCHE AMÉLIORÉE - Recherche par SIN ou nom_tiers
  @GetMapping("/search")
  public List<DonneesSinistre> search(
    @RequestParam(required = false) String sin,
    @RequestParam(required = false) String nomTiers,
    @RequestParam(required = false) Integer annee,
    @RequestParam(required = false) String ipp) {

    System.out.println("🔍 Recherche DonneesSinistres - sin: " + sin + ", nomTiers: " + nomTiers);

    // ✅ Si nomTiers est fourni, rechercher par nom de tiers
    if (nomTiers != null && !nomTiers.isEmpty()) {
      System.out.println("   🔍 Recherche par nom de tiers: " + nomTiers);
      return repository.findByNomTiersContaining(nomTiers);
    }

    // ✅ Si sin est fourni, rechercher par sin
    if (sin != null && !sin.isEmpty()) {
      System.out.println("   🔍 Recherche par SIN: " + sin);
      return repository.findBySinContaining(sin);
    }

    // ✅ Si année est fournie
    if (annee != null) {
      System.out.println("   🔍 Recherche par année: " + annee);
      return repository.findByAnnee(annee);
    }

    // ✅ Sinon, recherche avec tous les filtres
    System.out.println("   🔍 Recherche avec filtres");
    return repository.search(sin, annee, ipp);
  }

  // ✅ Créer un sinistre
  @PostMapping
  public ResponseEntity<DonneesSinistre> create(@RequestBody DonneesSinistre sinistre) {
    System.out.println("📝 Création d'un sinistre: " + sinistre.getSin());
    DonneesSinistre saved = repository.save(sinistre);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  // ✅ Mettre à jour un sinistre
  @PutMapping("/{id}")
  public ResponseEntity<DonneesSinistre> update(@PathVariable Long id, @RequestBody DonneesSinistre sinistre) {
    System.out.println("✏️ Mise à jour du sinistre ID: " + id);
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    sinistre.setId(id);
    DonneesSinistre updated = repository.save(sinistre);
    return ResponseEntity.ok(updated);
  }

  // ✅ Supprimer un sinistre
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    System.out.println("🗑️ Suppression du sinistre ID: " + id);
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    repository.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  // ✅ Statistiques par année
  @GetMapping("/stats/annees")
  public List<Object[]> getStatsByAnnee() {
    return repository.countByAnnee();
  }
}
