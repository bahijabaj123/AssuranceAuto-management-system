package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.LesionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LesionRepository extends JpaRepository<LesionEntity, Long> {

  // Rechercher une lésion par son code
  Optional<LesionEntity> findByCode(String code);

  // Vérifier si une lésion existe par code
  boolean existsByCode(String code);

  // Supprimer une lésion par code
  void deleteByCode(String code);
}
