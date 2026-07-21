package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.TiersSinistre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TiersSinistreRepository extends JpaRepository<TiersSinistre, Long> {

  // ✅ Récupérer tous les tiers d'un sinistre
  List<TiersSinistre> findBySinOrderByNomTiersAsc(String sin);

  // ✅ Compter les tiers par sinistre
  Long countBySin(String sin);

  // ✅ Récupérer les tiers avec IPP > 0
  List<TiersSinistre> findBySinAndIppGreaterThan(String sin, Double ipp);

  // ✅ Récupérer les tiers par nom (recherche)
  @Query("SELECT t FROM TiersSinistre t WHERE LOWER(t.nomTiers) LIKE LOWER(CONCAT('%', :nom, '%'))")
  List<TiersSinistre> rechercherParNom(@Param("nom") String nom);

  // ✅ Récupérer les tiers avec leurs données IPP pour un sinistre
  @Query("SELECT t FROM TiersSinistre t WHERE t.sin = :sin AND t.ipp > 0 ORDER BY t.ipp DESC")
  List<TiersSinistre> findTiersAvecIPP(@Param("sin") String sin);
}
