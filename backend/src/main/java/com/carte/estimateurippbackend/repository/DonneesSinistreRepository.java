package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.DonneesSinistre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonneesSinistreRepository extends JpaRepository<DonneesSinistre, Long> {

  // ✅ Recherche par SIN (contient)
  List<DonneesSinistre> findBySinContaining(String sin);

  // ✅ Recherche par année
  List<DonneesSinistre> findByAnnee(Integer annee);

  // ✅ RECHERCHE PAR NOM DE TIERS (AJOUTÉ)
  @Query("SELECT d FROM DonneesSinistre d WHERE LOWER(d.nomTiers) LIKE LOWER(CONCAT('%', :nomTiers, '%'))")
  List<DonneesSinistre> findByNomTiersContaining(@Param("nomTiers") String nomTiers);

  // ✅ RECHERCHE PAR SIN OU NOM DE TIERS (AJOUTÉ)
  @Query("SELECT d FROM DonneesSinistre d WHERE " +
    "(:sin IS NULL OR :sin = '' OR d.sin LIKE %:sin%) OR " +
    "(:nomTiers IS NULL OR :nomTiers = '' OR LOWER(d.nomTiers) LIKE LOWER(CONCAT('%', :nomTiers, '%')))")
  List<DonneesSinistre> searchBySinOrNomTiers(
    @Param("sin") String sin,
    @Param("nomTiers") String nomTiers
  );

  // ✅ Recherche avec filtres (sin, annee, ipp)
  @Query("SELECT d FROM DonneesSinistre d WHERE " +
    "(:sin IS NULL OR :sin = '' OR d.sin LIKE %:sin%) AND " +
    "(:annee IS NULL OR d.annee = :annee) AND " +
    "(:ipp IS NULL OR :ipp = '' OR d.ipp LIKE %:ipp%)")
  List<DonneesSinistre> search(
    @Param("sin") String sin,
    @Param("annee") Integer annee,
    @Param("ipp") String ipp
  );

  // ✅ Statistiques par année
  @Query("SELECT d.annee, COUNT(d) FROM DonneesSinistre d GROUP BY d.annee ORDER BY d.annee")
  List<Object[]> countByAnnee();
}
