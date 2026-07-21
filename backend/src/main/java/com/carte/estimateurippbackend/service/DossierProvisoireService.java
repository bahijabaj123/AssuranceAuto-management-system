package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.entity.DossProvisoire;
import com.carte.estimateurippbackend.repository.DossProvisoireRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class DossierProvisoireService {

  @Autowired
  private DossProvisoireRepository repository;

  public List<DossProvisoire> findAll() {
    log.info("📋 Récupération de tous les dossiers provisoires");
    List<DossProvisoire> dossiers = repository.findAll();
    log.info("✅ {} dossiers trouvés", dossiers.size());
    return dossiers;
  }

  public DossProvisoire findById(Long id) {
    log.info("📋 Récupération du dossier ID: {}", id);
    return repository.findById(id)
      .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'ID: " + id));
  }

  public DossProvisoire save(DossProvisoire dossier) {
    log.info("📝 Sauvegarde du dossier: {}", dossier.getNumProv());
    if (dossier.getDateCreation() == null) {
      dossier.setDateCreation(LocalDate.now());
    }
    dossier.setDateModification(LocalDate.now());
    return repository.save(dossier);
  }

  public DossProvisoire update(Long id, DossProvisoire dossier) {
    log.info("✏️ Mise à jour du dossier ID: {}", id);
    DossProvisoire existing = findById(id);
    existing.setNumProv(dossier.getNumProv());
    existing.setAffaire(dossier.getAffaire());
    existing.setNature(dossier.getNature());
    existing.setTiers(dossier.getTiers());
    existing.setDate(dossier.getDate());
    existing.setRegionTrib(dossier.getRegionTrib());
    existing.setAvocat(dossier.getAvocat());
    existing.setNumSinistre(dossier.getNumSinistre());
    existing.setObservation(dossier.getObservation());
    existing.setDateModification(LocalDate.now());
    return repository.save(existing);
  }

  public void delete(Long id) {
    log.info("🗑️ Suppression du dossier ID: {}", id);
    repository.deleteById(id);
  }
}
