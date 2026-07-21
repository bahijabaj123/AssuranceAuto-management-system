// src/main/java/com/carte/estimateurippbackend/repository/DossProvisoireRepository.java
package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.DossProvisoire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DossProvisoireRepository extends JpaRepository<DossProvisoire, Long> {

  // ✅ Recherche par num_prov OU num_sinistre
  @Query("SELECT d FROM DossProvisoire d WHERE " +
    "LOWER(d.numProv) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.numSinistre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.tiers) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.avocat) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.affaire) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.nature) LIKE LOWER(CONCAT('%', :search, '%'))")
  List<DossProvisoire> searchAllFields(@Param("search") String search);

  // ✅ Filtrer par utilisateur
  List<DossProvisoire> findByIdUtilisateur(Long idUtilisateur);
}
