// src/main/java/com/carte/estimateurippbackend/controller/DossArt18Controller.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.DossArt18;
import com.carte.estimateurippbackend.repository.DossArt18Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doss-art18")
@CrossOrigin(origins = "http://localhost:4200")
public class DossArt18Controller {

  private final DossArt18Repository repository;

  public DossArt18Controller(DossArt18Repository repository) {
    this.repository = repository;
  }

  // ✅ GET - Tous les dossiers (commun)
  @GetMapping
  public List<DossArt18> getAll() {
    System.out.println("📋 Récupération de tous les dossiers ART18 (commun)");
    return repository.findAll();
  }

  // ✅ GET - Par ID
  @GetMapping("/{id}")
  public ResponseEntity<DossArt18> getById(@PathVariable Long id) {
    return repository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // ✅ GET - RECHERCHE UNIQUE (UN SEUL @GetMapping("/search"))
  @GetMapping("/search")
  public List<DossArt18> search(@RequestParam String numDos) {
    System.out.println("🔍 Recherche ART18 par: " + numDos);
    return repository.searchAllFields(numDos);
  }

  // ✅ POST - Créer
  @PostMapping
  public ResponseEntity<DossArt18> create(@RequestBody DossArt18 dossier) {
    System.out.println("📝 Création d'un dossier ART18");
    dossier.setId(null);
    dossier.setDateCreation(LocalDate.now());
    dossier.setDateModification(LocalDate.now());
    DossArt18 saved = repository.save(dossier);
    System.out.println("✅ Dossier ART18 créé avec ID: " + saved.getId());
    return ResponseEntity.ok(saved);
  }

  // ✅ PUT - Mettre à jour
  @PutMapping("/{id}")
  public ResponseEntity<DossArt18> update(@PathVariable Long id, @RequestBody DossArt18 dossier) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    dossier.setId(id);
    dossier.setDateModification(LocalDate.now());
    DossArt18 updated = repository.save(dossier);
    System.out.println("✅ Dossier ART18 mis à jour: " + updated.getId());
    return ResponseEntity.ok(updated);
  }

  // ✅ DELETE - Supprimer
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    repository.deleteById(id);
    System.out.println("🗑️ Dossier ART18 supprimé: " + id);
    return ResponseEntity.noContent().build();
  }
}
