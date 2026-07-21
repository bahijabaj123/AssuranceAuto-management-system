package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.entity.LesionEntity;
import com.carte.estimateurippbackend.model.Lesion;
import com.carte.estimateurippbackend.repository.LesionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LesionService {

  private final LesionRepository lesionRepository;

  public LesionService(LesionRepository lesionRepository) {
    this.lesionRepository = lesionRepository;
  }

  // Convertir Entity → Model
  private Lesion toModel(LesionEntity entity) {
    Lesion model = new Lesion();
    model.setCode(entity.getCode());
    model.setLibelle(entity.getLibelle());
    return model;
  }

  // Convertir Model → Entity
  private LesionEntity toEntity(Lesion model) {
    LesionEntity entity = new LesionEntity();
    entity.setCode(model.getCode());
    entity.setLibelle(model.getLibelle());
    return entity;
  }

  public List<Lesion> getAllLesions() {
    return lesionRepository.findAll().stream()
      .map(this::toModel)
      .collect(Collectors.toList());
  }

  public Lesion getLesionByCode(String code) {
    return lesionRepository.findByCode(code)
      .map(this::toModel)
      .orElse(null);
  }

  public Lesion addLesion(Lesion lesion) {
    if (lesionRepository.existsByCode(lesion.getCode())) {
      return null;
    }
    LesionEntity saved = lesionRepository.save(toEntity(lesion));
    return toModel(saved);
  }

  public Lesion updateLesion(String code, Lesion lesion) {
    return lesionRepository.findByCode(code)
      .map(existing -> {
        existing.setLibelle(lesion.getLibelle());
        // Si le code change, on le met à jour
        if (!existing.getCode().equals(lesion.getCode())) {
          existing.setCode(lesion.getCode());
        }
        return toModel(lesionRepository.save(existing));
      })
      .orElse(null);
  }

  public boolean deleteLesion(String code) {
    if (!lesionRepository.existsByCode(code)) {
      return false;
    }
    lesionRepository.deleteByCode(code);
    return true;
  }
}
