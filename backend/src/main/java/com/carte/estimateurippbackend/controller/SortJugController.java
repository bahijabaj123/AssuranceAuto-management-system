// src/main/java/com/carte/estimateurippbackend/controller/SortJugController.java
package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.entity.SortJug;
import com.carte.estimateurippbackend.repository.SortJugRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sort-jug")
@CrossOrigin(origins = "http://localhost:4200")
public class SortJugController {

  private final SortJugRepository repository;

  public SortJugController(SortJugRepository repository) {
    this.repository = repository;
  }

  // ✅ GET - Tous les jugements (commun)
  @GetMapping
  public List<SortJug> getAll() {
    System.out.println("📋 Récupération de tous les jugements (commun)");
    return repository.findAll();
  }

  // ✅ GET - Par ID
  @GetMapping("/{id}")
  public ResponseEntity<SortJug> getById(@PathVariable Long id) {
    return repository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // ✅ GET - RECHERCHE UNIQUE (UN SEUL @GetMapping("/search"))
  @GetMapping("/search")
  public List<SortJug> search(@RequestParam String numDos) {
    System.out.println("🔍 Recherche SortJug par: " + numDos);
    return repository.searchAllFields(numDos);
  }

  // ✅ POST - Créer
  @PostMapping
  public ResponseEntity<SortJug> create(@RequestBody SortJug entity) {
    System.out.println("📝 Création d'un jugement");
    entity.setId(null);
    entity.setDateCreation(LocalDate.now());
    entity.setDateModification(LocalDate.now());
    SortJug saved = repository.save(entity);
    System.out.println("✅ Jugement créé avec ID: " + saved.getId());
    return ResponseEntity.ok(saved);
  }

  // ✅ PUT - Mettre à jour
  @PutMapping("/{id}")
  public ResponseEntity<SortJug> update(@PathVariable Long id, @RequestBody SortJug entity) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    entity.setId(id);
    entity.setDateModification(LocalDate.now());
    SortJug updated = repository.save(entity);
    System.out.println("✅ Jugement mis à jour: " + updated.getId());
    return ResponseEntity.ok(updated);
  }

  // ✅ DELETE - Supprimer
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    repository.deleteById(id);
    System.out.println("🗑️ Jugement supprimé: " + id);
    return ResponseEntity.noContent().build();
  }
}
