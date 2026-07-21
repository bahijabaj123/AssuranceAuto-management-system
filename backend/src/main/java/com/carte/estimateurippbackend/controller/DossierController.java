package com.carte.estimateurippbackend.controller;
import com.carte.estimateurippbackend.model.Dossier;
import com.carte.estimateurippbackend.service.DossierService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dossiers")
@CrossOrigin(origins = "http://localhost:4200")
public class DossierController {

  private final DossierService dossierService;

  public DossierController(DossierService dossierService) {
    this.dossierService = dossierService;
  }
//AFFICHAGE filtre les dossiers
  @GetMapping
  public List<Dossier> getAllDossiers() {
    return dossierService.getAllDossiers();
  }
  @GetMapping("/{id}")
  public Dossier getDossierById(@PathVariable String id) {
    return dossierService.getDossierById(id);
  }
}
