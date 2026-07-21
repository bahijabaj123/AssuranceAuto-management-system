// src/main/java/com/carte/estimateurippbackend/repository/UtilisateurRepository.java
package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
  Optional<Utilisateur> findByEmail(String email);
  boolean existsByEmail(String email);
}
