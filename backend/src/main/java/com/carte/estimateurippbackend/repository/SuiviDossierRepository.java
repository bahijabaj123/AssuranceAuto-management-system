// src/main/java/com/carte/estimateurippbackend/repository/SuiviDossierRepository.java
package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.SuiviDossier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuiviDossierRepository extends JpaRepository<SuiviDossier, Long> {

  //  RECHERCHE PAR NUMERO DE DOSSIER (pour la recherche)
  List<SuiviDossier> findByNumDosContaining(String numDos);

  //  RECHERCHE EXACTE PAR NUMERO DE DOSSIER (pour le propriétaire)
  Optional<SuiviDossier> findByNumDos(String numDos);

  //  FILTRAGE PAR UTILISATEUR
  List<SuiviDossier> findByIdUtilisateur(Long idUtilisateur);

  // ✅ Recherche dans TOUS les champs pour Suivi Dossiers
  @Query("SELECT s FROM SuiviDossier s WHERE " +
    "LOWER(s.numDos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.tiers) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.region) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.avocat) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.observation) LIKE LOWER(CONCAT('%', :search, '%'))")
  List<SuiviDossier> searchAllFields(@Param("search") String search);


  @Modifying
  @Query("UPDATE SuiviDossier s SET s.idUtilisateur = :userId WHERE s.id = :id")
  void updateUtilisateur(@Param("id") Long id, @Param("userId") Long userId);

}
