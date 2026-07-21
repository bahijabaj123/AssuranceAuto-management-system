package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.SortJug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SortJugRepository extends JpaRepository<SortJug, Long> {

  @Query("SELECT s FROM SortJug s WHERE " +
    "LOWER(s.numDos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.jugNum) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.region) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.huissierNotaire) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(s.observation) LIKE LOWER(CONCAT('%', :search, '%'))")
  List<SortJug> searchAllFields(@Param("search") String search);

  // ============================================================
  // RECHERCHE PAR NUMERO DE DOSSIER
  // ============================================================

  Optional<SortJug> findByNumDos(String numDos);
  List<SortJug> findByNumDosContaining(String numDos);

  @Query("SELECT s FROM SortJug s WHERE LOWER(s.numDos) LIKE LOWER(CONCAT('%', :numDos, '%'))")
  List<SortJug> searchByNumDosIgnoreCase(@Param("numDos") String numDos);

  // ============================================================
  // FILTRAGE PAR UTILISATEUR
  // ============================================================

  List<SortJug> findByIdUtilisateur(Long idUtilisateur);

  @Query("SELECT s FROM SortJug s WHERE s.idUtilisateur = :userId AND LOWER(s.numDos) LIKE LOWER(CONCAT('%', :numDos, '%'))")
  List<SortJug> findByIdUtilisateurAndNumDosContaining(@Param("userId") Long userId, @Param("numDos") String numDos);

  // ============================================================
  // FILTRES ET TRI
  // ============================================================

  List<SortJug> findByRegion(String region);
  List<SortJug> findByRegionAndIdUtilisateur(String region, Long idUtilisateur);
  List<SortJug> findByObservationContaining(String observation);
  List<SortJug> findByObservationContainingAndIdUtilisateur(String observation, Long idUtilisateur);
  List<SortJug> findByMontantExecGreaterThan(Double montant);
  List<SortJug> findByDateSignificationBetween(LocalDate start, LocalDate end);

  // ============================================================
  // STATISTIQUES
  // ============================================================

  @Query("SELECT s.region, COUNT(s) FROM SortJug s GROUP BY s.region")
  List<Object[]> countByRegion();

  @Query("SELECT s.observation, COUNT(s) FROM SortJug s GROUP BY s.observation")
  List<Object[]> countByObservation();

  long countByIdUtilisateur(Long idUtilisateur);

  @Query("SELECT s.region, COUNT(s) FROM SortJug s WHERE s.idUtilisateur = :userId GROUP BY s.region")
  List<Object[]> countByRegionAndUser(@Param("userId") Long userId);

  // ============================================================
  // ALERTES - Jointure avec SuiviDossier pour récupérer la nature
  // ============================================================

  /**
   * Récupérer les dossiers avec leur date de signification ET leur nature
   * Jointure entre SortJug et SuiviDossier via numDos
   */
  // ✅ Récupérer les dossiers avec date de signification pour les alertes
  @Query("SELECT " +
    "s.numDos, " +
    "d.natureAff, " +
    "s.dateSignification, " +
    "d.id, " +
    "d.idUtilisateur " +
    "FROM SortJug s " +
    "JOIN SuiviDossier d ON s.numDos = d.numDos " +
    "WHERE s.dateSignification IS NOT NULL " +
    "AND d.natureAff IN ('CIV', 'CORR') " )
  List<Object[]> findDossiersAvecDateSignif();
  /**
   * Récupérer les dossiers avec date de signification pour un utilisateur spécifique
   */
  @Query("SELECT s.numDos, d.natureAff, s.dateSignification, d.id, d.idUtilisateur " +
    "FROM SortJug s " +
    "JOIN SuiviDossier d ON s.numDos = d.numDos " +
    "WHERE s.dateSignification IS NOT NULL " +
    "AND (d.natureAff = 'CIV' OR d.natureAff = 'CORR') " +
    "AND d.idUtilisateur = :userId")
  List<Object[]> findDossiersAvecDateSignifByUser(@Param("userId") Long userId);

  /**
   * Récupérer la date de signification par numéro de dossier
   */
  @Query("SELECT s.dateSignification FROM SortJug s WHERE s.numDos = :numDos")
  Optional<LocalDate> findDateSignifByNumDos(@Param("numDos") String numDos);


}
