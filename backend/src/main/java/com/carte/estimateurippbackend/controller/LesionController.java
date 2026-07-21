package com.carte.estimateurippbackend.controller;


import com.carte.estimateurippbackend.model.Lesion;
import com.carte.estimateurippbackend.service.LesionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lesions")
@CrossOrigin(origins = "http://localhost:4200")
public class LesionController {

  private final LesionService lesionService;

  public LesionController(LesionService lesionService) {
    this.lesionService = lesionService;
  }

  @GetMapping
  public List<Lesion> getAllLesions() {
    return lesionService.getAllLesions();
  }

  @GetMapping("/{code}")
  public ResponseEntity<Lesion> getLesionByCode(@PathVariable String code) {
    Lesion lesion = lesionService.getLesionByCode(code);
    if (lesion == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(lesion);
  }

  @PostMapping
  public ResponseEntity<Lesion> addLesion(@RequestBody Lesion lesion) {
    Lesion created = lesionService.addLesion(lesion);
    if (created == null) {
      return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{code}")
  public ResponseEntity<Lesion> updateLesion(@PathVariable String code, @RequestBody Lesion lesion) {
    Lesion updated = lesionService.updateLesion(code, lesion);
    if (updated == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/{code}")
  public ResponseEntity<Void> deleteLesion(@PathVariable String code) {
    boolean deleted = lesionService.deleteLesion(code);
    if (!deleted) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.noContent().build();
  }
}
