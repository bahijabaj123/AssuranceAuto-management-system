package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.entity.DossierEntity;
import com.carte.estimateurippbackend.entity.LesionEntity;
import com.carte.estimateurippbackend.model.Dossier;
import com.carte.estimateurippbackend.repository.DossierRepository;
import com.carte.estimateurippbackend.repository.LesionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DossierService {

  private final DossierRepository dossierRepository;
  private final LesionRepository lesionRepository;

  public DossierService(DossierRepository dossierRepository, LesionRepository lesionRepository) {
    this.dossierRepository = dossierRepository;
    this.lesionRepository = lesionRepository;
  }

  // Convertir Entity → Model
  private Dossier toModel(DossierEntity entity) {
    Dossier model = new Dossier();
    model.setId(String.valueOf(entity.getId()));
    model.setNumero(entity.getNumero());
    model.setNbJours(entity.getNbJours());
    model.setTauxIpp(entity.getTauxIpp());
    model.setStatut(entity.getStatut());
    model.setIndemnite(entity.getIndemnite());
    model.setDateCreation(entity.getDateCreation());
    model.setDateCloture(entity.getDateCloture());
    model.setResponsable(entity.getResponsable());
    model.setObservations(entity.getObservations());
    model.setCodeLesions(entity.getLesions().stream()
      .map(LesionEntity::getCode)
      .collect(Collectors.toList()));
    return model;
  }

  public List<Dossier> getAllDossiers() {
    return dossierRepository.findAll().stream()
      .map(this::toModel)
      .collect(Collectors.toList());
  }

  public Dossier getDossierById(String id) {
    try {
      Long longId = Long.parseLong(id);
      return dossierRepository.findById(longId)
        .map(this::toModel)
        .orElse(null);
    } catch (NumberFormatException e) {
      // Si l'ID est une chaîne (ex: D-2023-0187), chercher par numéro
      return dossierRepository.findByNumero(id)
        .map(this::toModel)
        .orElse(null);
    }
  }

  public List<Dossier> findSimilarDossiers(int nbJours, List<String> codesLesions) {
    // Récupérer les dossiers qui ont au moins une lésion en commun
    List<DossierEntity> similaires = dossierRepository.findSimilarDossiers(codesLesions);

    // Limiter à 5 résultats
    return similaires.stream()
      .limit(5)
      .map(this::toModel)
      .collect(Collectors.toList());
  }
}
