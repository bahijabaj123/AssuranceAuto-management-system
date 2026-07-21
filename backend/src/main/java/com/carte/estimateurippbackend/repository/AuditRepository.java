// src/main/java/com/carte/estimateurippbackend/repository/AuditRepository.java
package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.Audit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {

  // ✅ Récupérer les audits d'un utilisateur spécifique
  List<Audit> findByIdUtilisateurOrderByDateActionDesc(Long idUtilisateur);

  // ✅ Récupérer les audits d'un dossier spécifique
  List<Audit> findByIdDossierOrderByDateActionDesc(Long idDossier);

  // ✅ Récupérer tous les audits triés par date
  List<Audit> findAllByOrderByDateActionDesc();

  // ✅ Récupérer les audits accessibles à un utilisateur
  // (Pour l'instant, seulement ses propres audits)
  @Query("SELECT a FROM Audit a WHERE a.idUtilisateur = :idUtilisateur")
  List<Audit> findAuditsAccessibles(Long idUtilisateur);

  // ✅ Récupérer les audits par action
  List<Audit> findByActionOrderByDateActionDesc(String action);

  // ✅ Récupérer les audits par numéro de dossier
  List<Audit> findByNumDosOrderByDateActionDesc(String numDos);
}
