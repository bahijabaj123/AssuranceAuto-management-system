// src/main/java/com/carte/estimateurippbackend/controller/DossProvisoireController.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.DossProvisoire;
import com.carte.estimateurippbackend.repository.DossProvisoireRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/dossiers-provisoires")
@CrossOrigin(origins = "http://localhost:4200")
public class DossProvisoireController {

  private final DossProvisoireRepository repository;

  public DossProvisoireController(DossProvisoireRepository repository) {
    this.repository = repository;
  }

  // ✅ GET - Tous les dossiers (filtrés par utilisateur)
  @GetMapping
  public List<DossProvisoire> getAll() {
    System.out.println("📋 Récupération de tous les dossiers provisoires (commun)");
    return repository.findAll();
  }

  // ✅ GET - Par ID
  @GetMapping("/{id}")
  public ResponseEntity<DossProvisoire> getById(@PathVariable Long id) {
    return repository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // ✅ GET - Recherche par numéro de dossier ou numéro de sinistre
  @GetMapping("/search")
  public List<DossProvisoire> search(@RequestParam String numDos) {
    System.out.println("🔍 Recherche provisoires par: " + numDos);
    List<DossProvisoire> result = repository.searchAllFields(numDos);
    System.out.println("   ✅ " + result.size() + " dossier(s) trouvé(s)");
    return result;
  }

  // ✅ POST - Créer un dossier
  @PostMapping
  public ResponseEntity<DossProvisoire> create(@RequestBody DossProvisoire dossier) {
    System.out.println("📝 Création d'un dossier provisoire");
    dossier.setId(null);
    dossier.setDateCreation(LocalDate.now());
    dossier.setDateModification(LocalDate.now());
    DossProvisoire saved = repository.save(dossier);
    System.out.println("✅ Dossier provisoire créé avec ID: " + saved.getId());
    return ResponseEntity.ok(saved);
  }

  // ✅ PUT - Mettre à jour
  @PutMapping("/{id}")
  public ResponseEntity<DossProvisoire> update(@PathVariable Long id, @RequestBody DossProvisoire dossier) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    dossier.setId(id);
    dossier.setDateModification(LocalDate.now());
    DossProvisoire updated = repository.save(dossier);
    System.out.println("✅ Dossier provisoire mis à jour: " + updated.getId());
    return ResponseEntity.ok(updated);
  }

  // ✅ DELETE - Supprimer
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    repository.deleteById(id);
    System.out.println("🗑️ Dossier provisoire supprimé: " + id);
    return ResponseEntity.noContent().build();
  }
}
