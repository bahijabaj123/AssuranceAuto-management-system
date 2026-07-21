// src/main/java/com/carte/estimateurippbackend/repository/DossArt18Repository.java
package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.DossArt18;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossArt18Repository extends JpaRepository<DossArt18, Long> {

  // ✅ Recherche dans TOUS les champs pour Art 18
  @Query("SELECT d FROM DossArt18 d WHERE " +
    "LOWER(d.reference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.cieAdverse) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.region) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.blesse) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
    "LOWER(d.secRecupInforme) LIKE LOWER(CONCAT('%', :search, '%'))")
  List<DossArt18> searchAllFields(@Param("search") String search);

  Optional<DossArt18> findByReference(String reference);

  List<DossArt18> findByRegion(String region);

  List<DossArt18> findBySecRecupInforme(String secRecupInforme);

  List<DossArt18> findByReferenceContaining(String reference);
}
