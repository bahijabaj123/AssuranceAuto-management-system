package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.DTO.StatsParAnneeDTO;
import com.carte.estimateurippbackend.entity.SuiviDossier;
import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.repository.SuiviDossierRepository;
import com.carte.estimateurippbackend.service.AuditService;
import com.carte.estimateurippbackend.service.SynchronisationSinistreService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suivi-dossiers")
@CrossOrigin(origins = "http://localhost:4200")
public class SuiviDossierController {

  private final SuiviDossierRepository repository;
  private final AuditService auditService;
  private final SynchronisationSinistreService synchronisationService;  // ✅ FINAL

  // ✅ CONSTRUCTEUR AVEC TOUS LES PARAMÈTRES
  public SuiviDossierController(
    SuiviDossierRepository repository,
    AuditService auditService,
    SynchronisationSinistreService synchronisationService) {
    this.repository = repository;
    this.auditService = auditService;
    this.synchronisationService = synchronisationService;  // ✅ INITIALISATION
  }

  // ============================================================
  // ✅ GET ALL - Filtré par rôle
  // ============================================================
  @GetMapping
  public List<SuiviDossier> getAll(@RequestParam(required = false) Long userId) {
    System.out.println("📋 Récupération des dossiers");

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Utilisateur currentUser = null;
    if (auth != null && auth.getPrincipal() instanceof Utilisateur) {
      currentUser = (Utilisateur) auth.getPrincipal();
    }

    if (currentUser == null) {
      return repository.findAll();
    }

    String role = currentUser.getRole();
    if ("ADMIN".equals(role) || "ROLE_ADMIN".equals(role)) {
      System.out.println("👑 ADMIN - Récupération de tous les dossiers");
      return repository.findAll();
    }

    System.out.println("👤 GESTIONNAIRE - Récupération des dossiers pour: " + currentUser.getId());
    return repository.findByIdUtilisateur(currentUser.getId());
  }

  // ============================================================
  // ✅ GET BY ID
  // ============================================================
  @GetMapping("/{id}")
  public ResponseEntity<SuiviDossier> getById(@PathVariable Long id) {
    System.out.println("📋 Récupération du dossier ID: " + id);
    return repository.findById(id)
      .map(d -> {
        System.out.println("✅ Dossier trouvé: " + d.getNumDos());
        return ResponseEntity.ok(d);
      })
      .orElse(ResponseEntity.notFound().build());
  }

  // ============================================================
  // ✅ GET BY USER
  // ============================================================
  @GetMapping("/user/{userId}")
  public List<SuiviDossier> getByUser(@PathVariable Long userId) {
    System.out.println("📋 Récupération des dossiers pour l'utilisateur: " + userId);
    return repository.findByIdUtilisateur(userId);
  }

  // ============================================================
  // ✅ CREATE - avec SYNCHRONISATION
  // ============================================================
  @PostMapping
  public ResponseEntity<SuiviDossier> create(@RequestBody SuiviDossier dossier, HttpServletRequest request) {
    System.out.println("📝 Création d'un dossier");
    System.out.println("   Num DOS: " + dossier.getNumDos());
    System.out.println("   Tiers: " + dossier.getTiers());
    System.out.println("   IPP: " + dossier.getIpp());
    System.out.println("   NB JOURS: " + dossier.getNbJours());
    System.out.println("   Règlements: " + dossier.getReglements());

    dossier.setId(null);
    dossier.setDateCreation(LocalDate.now());
    dossier.setDateModification(LocalDate.now());

    SuiviDossier saved = repository.save(dossier);
    System.out.println("✅ Dossier créé avec ID: " + saved.getId());

    // ✅ SYNCHRONISATION VERS DONNEES_SINISTRES
    try {
      synchronisationService.synchroniserVersDonneesSinistres(saved);
      System.out.println("✅ Synchronisation des données sinistres effectuée");
    } catch (Exception e) {
      System.err.println("❌ Erreur synchronisation: " + e.getMessage());
    }

    // AUDIT
    String ip = request.getRemoteAddr();
    auditService.enregistrerAction(
      saved.getId(),
      dossier.getIdUtilisateur(),
      "CREATE",
      saved.getNumDos(),
      null,
      "Création du dossier " + saved.getNumDos(),
      ip
    );

    return ResponseEntity.ok(saved);
  }

  // ============================================================
  // ✅ UPDATE - avec SYNCHRONISATION
  // ============================================================
  @PutMapping("/{id}")
  public ResponseEntity<SuiviDossier> update(
    @PathVariable Long id,
    @RequestBody SuiviDossier dossier,
    HttpServletRequest request) {
    System.out.println("✏️ Mise à jour du dossier ID: " + id);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Utilisateur currentUser = (Utilisateur) auth.getPrincipal();

    SuiviDossier existing = repository.findById(id).orElse(null);
    if (existing == null) {
      return ResponseEntity.notFound().build();
    }

    boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
    boolean isOwner = existing.getIdUtilisateur() != null &&
      existing.getIdUtilisateur().equals(currentUser.getId());

    if (!isAdmin && !isOwner) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // Sauvegarder l'ancien état
    String anciennesValeurs = "NumDOS: " + existing.getNumDos() +
      ", Tiers: " + existing.getTiers() +
      ", IPP: " + existing.getIpp() +
      ", NbJours: " + existing.getNbJours() +
      ", Règlements: " + existing.getReglements();

    if (dossier.getIdUtilisateur() == null) {
      dossier.setIdUtilisateur(existing.getIdUtilisateur());
    }
    dossier.setDateCreation(existing.getDateCreation());
    dossier.setDateModification(LocalDate.now());
    dossier.setId(id);

    SuiviDossier updated = repository.save(dossier);

    // ✅ SYNCHRONISATION VERS DONNEES_SINISTRES
    try {
      synchronisationService.synchroniserVersDonneesSinistres(updated);
      System.out.println("✅ Synchronisation des données sinistres effectuée");
    } catch (Exception e) {
      System.err.println("❌ Erreur synchronisation: " + e.getMessage());
    }

    String ip = request.getRemoteAddr();
    auditService.enregistrerAction(
      updated.getId(),
      updated.getIdUtilisateur(),
      "UPDATE",
      updated.getNumDos(),
      anciennesValeurs,
      "Mise à jour du dossier " + updated.getNumDos(),
      ip
    );

    return ResponseEntity.ok(updated);
  }

  // ============================================================
  // ✅ DELETE - avec AUDIT + VÉRIFICATION PERMISSIONS
  // ============================================================
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
    System.out.println("🗑️ Suppression du dossier ID: " + id);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Utilisateur currentUser = (Utilisateur) auth.getPrincipal();

    SuiviDossier existing = repository.findById(id).orElse(null);
    if (existing == null) {
      System.out.println("❌ Dossier non trouvé");
      return ResponseEntity.notFound().build();
    }

    boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
    boolean isOwner = existing.getIdUtilisateur() != null &&
      existing.getIdUtilisateur().equals(currentUser.getId());

    if (!isAdmin && !isOwner) {
      System.out.println("❌ Accès refusé: l'utilisateur n'est pas le propriétaire");
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    String numDos = existing.getNumDos();
    Long idUtilisateur = existing.getIdUtilisateur();

    repository.deleteById(id);
    System.out.println("✅ Dossier supprimé");

    String ip = request.getRemoteAddr();
    auditService.enregistrerAction(
      id,
      idUtilisateur,
      "DELETE",
      numDos,
      "Suppression du dossier " + numDos,
      null,
      ip
    );

    return ResponseEntity.noContent().build();
  }

  // ============================================================
  // ✅ SEARCH
  // ============================================================
  @GetMapping("/search")
  public List<SuiviDossier> search(@RequestParam String numDos) {
    return repository.searchAllFields(numDos);
  }

  // ============================================================
  // ✅ STATISTIQUES PAR ANNÉE
  // ============================================================
  @GetMapping("/stats/annee")
  public ResponseEntity<List<StatsParAnneeDTO>> getStatsParAnnee() {
    List<SuiviDossier> dossiers = repository.findAll();

    Map<Integer, StatsParAnneeDTO> statsMap = new HashMap<>();

    for (SuiviDossier d : dossiers) {
      Integer annee = d.getAnnee();
      if (annee == null) continue;

      StatsParAnneeDTO stats = statsMap.getOrDefault(annee,
        new StatsParAnneeDTO(annee, 0L, 0L, 0L, 0L, 0L, 0.0));

      stats.setTotal(stats.getTotal() + 1);

      String nature = d.getNatureAff() != null ? d.getNatureAff().toUpperCase() : "AUTRE";
      if (nature.contains("CIV")) {
        stats.setNatureCiv(stats.getNatureCiv() + 1);
      } else if (nature.contains("CORR")) {
        stats.setNatureCorr(stats.getNatureCorr() + 1);
      } else if (nature.contains("PENAL")) {
        stats.setNaturePenal(stats.getNaturePenal() + 1);
      } else if (nature.contains("ADMIN")) {
        stats.setNatureAdmin(stats.getNatureAdmin() + 1);
      }

      try {
        Double reglements = Double.parseDouble(d.getReglements());
        stats.setTotalReglements(stats.getTotalReglements() + reglements);
      } catch (NumberFormatException e) {
        // Ignorer
      }

      statsMap.put(annee, stats);
    }

    List<StatsParAnneeDTO> result = new ArrayList<>(statsMap.values());
    result.sort((a, b) -> a.getAnnee().compareTo(b.getAnnee()));

    return ResponseEntity.ok(result);
  }
}
