package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.entity.DonneesSinistre;
import com.carte.estimateurippbackend.entity.SuiviDossier;
import com.carte.estimateurippbackend.repository.DonneesSinistreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SynchronisationSinistreService {

  private final DonneesSinistreRepository donneesSinistreRepository;

  /**
   * Synchronise les données d'un dossier vers la table donnees_sinistres
   * Appelé après création ou mise à jour d'un dossier dans suivi_dossiers
   */
  @Transactional
  public void synchroniserVersDonneesSinistres(SuiviDossier dossier) {
    if (dossier == null || dossier.getNumDos() == null) {
      log.warn("⚠️ Dossier ou numDos null, synchronisation ignorée");
      return;
    }

    String numDos = dossier.getNumDos();

    // ✅ Vérifier si un enregistrement existe déjà dans donnees_sinistres
    List<DonneesSinistre> existants = donneesSinistreRepository.findBySinContaining(numDos);

    // ✅ Si le dossier a des données à synchroniser (tiers, ipp, nb_jours, reglements)
    boolean aDesDonnees = (dossier.getTiers() != null && !dossier.getTiers().isEmpty())
      || dossier.getIpp() != null
      || dossier.getNbJours() != null
      || (dossier.getReglements() != null && !dossier.getReglements().isEmpty());

    if (!aDesDonnees) {
      log.debug("⏭️ Pas de données à synchroniser pour le dossier {}", numDos);
      return;
    }

    // ✅ Si un enregistrement existe, on le met à jour
    if (!existants.isEmpty()) {
      DonneesSinistre sinistre = existants.get(0); // Prendre le premier
      boolean modifie = false;

      if (dossier.getTiers() != null && !dossier.getTiers().isEmpty()) {
        sinistre.setNomTiers(dossier.getTiers());
        modifie = true;
      }
      if (dossier.getIpp() != null) {
        sinistre.setIpp(String.valueOf(dossier.getIpp()));
        modifie = true;
      }
      if (dossier.getNbJours() != null) {
        sinistre.setNbrJrs(String.valueOf(dossier.getNbJours()));
        modifie = true;
      }
      if (dossier.getReglements() != null && !dossier.getReglements().isEmpty()) {
        try {
          sinistre.setRcc(new BigDecimal(dossier.getReglements().replace(",", ".")));
          modifie = true;
        } catch (NumberFormatException e) {
          log.warn("⚠️ Impossible de parser le règlement: {}", dossier.getReglements());
        }
      }

      if (modifie) {
        sinistre.setDateModification(LocalDateTime.now());
        donneesSinistreRepository.save(sinistre);
        log.info("✅ Mise à jour des données sinistres pour le dossier {}", numDos);
      }
    } else {
      // ✅ Si aucun enregistrement, on en crée un nouveau
      DonneesSinistre sinistre = new DonneesSinistre();
      sinistre.setSin(numDos);
      sinistre.setAnnee(extraireAnnee(numDos));

      if (dossier.getTiers() != null && !dossier.getTiers().isEmpty()) {
        sinistre.setNomTiers(dossier.getTiers());
      }
      if (dossier.getIpp() != null) {
        sinistre.setIpp(String.valueOf(dossier.getIpp()));
      }
      if (dossier.getNbJours() != null) {
        sinistre.setNbrJrs(String.valueOf(dossier.getNbJours()));
      }
      if (dossier.getReglements() != null && !dossier.getReglements().isEmpty()) {
        try {
          sinistre.setRcc(new BigDecimal(dossier.getReglements().replace(",", ".")));
        } catch (NumberFormatException e) {
          log.warn("⚠️ Impossible de parser le règlement: {}", dossier.getReglements());
        }
      }

      sinistre.setDateCreation(LocalDateTime.now());
      sinistre.setDateModification(LocalDateTime.now());
      donneesSinistreRepository.save(sinistre);
      log.info("✅ Création des données sinistres pour le dossier {}", numDos);
    }
  }

  /**
   * Synchronise toutes les données existantes (pour migration)
   */
  @Transactional
  public void synchroniserTousLesDossiers(List<SuiviDossier> dossiers) {
    int compteur = 0;
    for (SuiviDossier dossier : dossiers) {
      try {
        synchroniserVersDonneesSinistres(dossier);
        compteur++;
      } catch (Exception e) {
        log.error("❌ Erreur lors de la synchronisation du dossier {}: {}", dossier.getNumDos(), e.getMessage());
      }
    }
    log.info("✅ Synchronisation terminée: {} dossiers traités", compteur);
  }

  private Integer extraireAnnee(String numDos) {
    if (numDos != null && numDos.length() >= 4) {
      try {
        return Integer.parseInt(numDos.substring(0, 4));
      } catch (NumberFormatException e) {
        return null;
      }
    }
    return null;
  }
}
