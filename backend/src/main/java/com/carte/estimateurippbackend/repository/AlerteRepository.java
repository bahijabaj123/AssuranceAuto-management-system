package com.carte.estimateurippbackend.repository;

import com.carte.estimateurippbackend.entity.Alerte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AlerteRepository extends JpaRepository<Alerte, Long> {

  // ✅ CORRIGÉ - Vérifier si une alerte existe déjà
  @Query("SELECT COUNT(a) > 0 FROM Alerte a WHERE a.idDossier = :dossierId AND a.nature = :nature AND a.dateCreation = :date")
  boolean existsByIdDossierAndNatureAndDateCreation(
    @Param("dossierId") Long dossierId,
    @Param("nature") String nature,
    @Param("date") LocalDate date
  );

  // ✅ Récupérer les alertes à envoyer
  @Query("SELECT a FROM Alerte a WHERE a.emailEnvoye = false AND a.statut = 'ACTIVE' AND a.actif = true")
  List<Alerte> findAlertesToSendByEmail();

  // ✅ Récupérer les alertes actives d'un utilisateur
  @Query("SELECT a FROM Alerte a WHERE a.idUtilisateur = :userId AND a.statut = 'ACTIVE' AND a.actif = true ORDER BY a.dateCreation DESC")
  List<Alerte> findActiveAlertesByUserId(@Param("userId") Long userId);

  // ✅ Récupérer les alertes non lues d'un utilisateur
  @Query("SELECT a FROM Alerte a WHERE a.idUtilisateur = :userId AND a.notificationVue = false AND a.actif = true ORDER BY a.dateCreation DESC")
  List<Alerte> findNonLuesByUserId(@Param("userId") Long userId);

  // ✅ Compter les alertes non lues d'un utilisateur
  @Query("SELECT COUNT(a) FROM Alerte a WHERE a.idUtilisateur = :userId AND a.notificationVue = false AND a.actif = true")
  Long countNonLuesByUserId(@Param("userId") Long userId);

  // ✅ Compter les alertes actives d'un utilisateur
  @Query("SELECT COUNT(a) FROM Alerte a WHERE a.idUtilisateur = :userId AND a.statut = 'ACTIVE' AND a.actif = true AND a.notificationVue = false")
  Long countActiveAlertesByUserId(@Param("userId") Long userId);

  // ✅ Marquer une alerte comme lue
  @Modifying
  @Query("UPDATE Alerte a SET a.notificationVue = true, a.dateLecture = CURRENT_TIMESTAMP WHERE a.id = :alerteId")
  void marquerCommeLue(@Param("alerteId") Long alerteId);

  // ✅ Marquer toutes les alertes d'un dossier comme lues
  @Modifying
  @Query("UPDATE Alerte a SET a.notificationVue = true, a.dateLecture = CURRENT_TIMESTAMP WHERE a.idDossier = :dossierId AND a.idUtilisateur = :userId")
  void marquerToutesLuesParDossier(@Param("dossierId") Long dossierId, @Param("userId") Long userId);

  // ✅ Marquer toutes les alertes d'un utilisateur comme lues
  @Modifying
  @Query("UPDATE Alerte a SET a.notificationVue = true, a.dateLecture = CURRENT_TIMESTAMP WHERE a.idUtilisateur = :userId AND a.notificationVue = false")
  void marquerToutesLuesParUtilisateur(@Param("userId") Long userId);
}
