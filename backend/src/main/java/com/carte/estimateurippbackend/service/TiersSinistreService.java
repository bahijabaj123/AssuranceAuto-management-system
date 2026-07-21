package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.DTO.TiersSinistreDTO;
import com.carte.estimateurippbackend.entity.TiersSinistre;
import com.carte.estimateurippbackend.repository.TiersSinistreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TiersSinistreService {

  private final TiersSinistreRepository tiersSinistreRepository;

  // ✅ Récupérer tous les tiers d'un sinistre
  public List<TiersSinistreDTO> getTiersBySin(String sin) {
    return tiersSinistreRepository.findBySinOrderByNomTiersAsc(sin)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  // ✅ Récupérer un tiers par son ID
  public TiersSinistreDTO getTiersById(Long id) {
    return tiersSinistreRepository.findById(id)
      .map(this::toDTO)
      .orElse(null);
  }

  // ✅ Dans la méthode createTiers, NE PAS définir l'ID
  @Transactional
  public TiersSinistreDTO createTiers(TiersSinistre tiers) {
    if (tiers.getSin() == null || tiers.getSin().isEmpty()) {
      throw new IllegalArgumentException("Le numéro de sinistre est obligatoire");
    }
    if (tiers.getNomTiers() == null || tiers.getNomTiers().isEmpty()) {
      throw new IllegalArgumentException("Le nom du tiers est obligatoire");
    }

    // ✅ S'assurer que l'ID est null pour éviter l'erreur StaleObjectStateException
    tiers.setId(null);

    TiersSinistre saved = tiersSinistreRepository.save(tiers);
    log.info("✅ Tiers créé: {} pour le sinistre {}", saved.getNomTiers(), saved.getSin());
    return toDTO(saved);
  }


  //Mettre à jour un tiers
  @Transactional
  public TiersSinistreDTO updateTiers(Long id, TiersSinistre tiers) {
    TiersSinistre existing = tiersSinistreRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Tiers non trouvé"));

    existing.setNomTiers(tiers.getNomTiers());
    existing.setIpp(tiers.getIpp());
    existing.setNbrJrs(tiers.getNbrJrs());
    existing.setReglements(tiers.getReglements());

    TiersSinistre updated = tiersSinistreRepository.save(existing);
    log.info("✅ Tiers mis à jour: {}", updated.getNomTiers());
    return toDTO(updated);
  }

  // ✅ Supprimer un tiers
  @Transactional
  public void deleteTiers(Long id) {
    tiersSinistreRepository.deleteById(id);
    log.info("✅ Tiers supprimé: {}", id);
  }

  // ✅ Supprimer tous les tiers d'un sinistre
  @Transactional
  public void deleteTiersBySin(String sin) {
    List<TiersSinistre> tiers = tiersSinistreRepository.findBySinOrderByNomTiersAsc(sin);
    tiersSinistreRepository.deleteAll(tiers);
    log.info("✅ Tous les tiers du sinistre {} supprimés", sin);
  }

  // ✅ Compter les tiers d'un sinistre
  public Long countBySin(String sin) {
    return tiersSinistreRepository.countBySin(sin);
  }

  // ✅ Récupérer les tiers avec IPP
  public List<TiersSinistreDTO> getTiersAvecIPP(String sin) {
    return tiersSinistreRepository.findTiersAvecIPP(sin)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  // ✅ Calculer la moyenne IPP pour un sinistre
  public Double getMoyenneIPP(String sin) {
    List<TiersSinistre> tiers = tiersSinistreRepository.findBySinOrderByNomTiersAsc(sin);
    return tiers.stream()
      .filter(t -> t.getIpp() != null && t.getIpp() > 0)
      .mapToDouble(TiersSinistre::getIpp)
      .average()
      .orElse(0.0);
  }

  // ✅ Calculer le total des règlements pour un sinistre
  public Double getTotalReglements(String sin) {
    List<TiersSinistre> tiers = tiersSinistreRepository.findBySinOrderByNomTiersAsc(sin);
    return tiers.stream()
      .filter(t -> t.getReglements() != null)
      .mapToDouble(TiersSinistre::getReglements)
      .sum();
  }

  // ✅ Conversion en DTO
  private TiersSinistreDTO toDTO(TiersSinistre tiers) {
    return new TiersSinistreDTO(
      tiers.getId(),
      tiers.getSin(),
      tiers.getNomTiers(),
      tiers.getIpp(),
      tiers.getNbrJrs(),
      tiers.getReglements(),
      tiers.getDateCreation(),
      tiers.getDateModification()
    );
  }
}
