package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.DossierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierRepository extends JpaRepository<DossierEntity, Long> {

  // Rechercher un dossier par son numéro
  Optional<DossierEntity> findByNumero(String numero);

  // Rechercher les dossiers similaires (avec au moins une lésion en commun)
  @Query("SELECT DISTINCT d FROM DossierEntity d " +
    "JOIN d.lesions l " +
    "WHERE l.code IN :codesLesions")
  List<DossierEntity> findSimilarDossiers(@Param("codesLesions") List<String> codesLesions);

  // Compter les dossiers par statut
  Long countByStatut(String statut);
}
