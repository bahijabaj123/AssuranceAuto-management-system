// src/main/java/com/carte/estimateurippbackend/service/AlerteService.java
package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.DTO.AlerteDTO;
import com.carte.estimateurippbackend.entity.Alerte;
import com.carte.estimateurippbackend.entity.SuiviDossier;
import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.repository.AlerteRepository;
import com.carte.estimateurippbackend.repository.SortJugRepository;
import com.carte.estimateurippbackend.repository.SuiviDossierRepository;
import com.carte.estimateurippbackend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlerteService {

  private final AlerteRepository        alerteRepository;
  private final SuiviDossierRepository  suiviDossierRepository;
  private final SortJugRepository       sortJugRepository;
  private final UtilisateurRepository   utilisateurRepository;
  private final EmailService            emailService;

  @Value("${app.alerte.test-mode:false}")
  private boolean testMode;

  // ─────────────────────────────────────────────────────────────
  //  SCHEDULER — chaque jour à 9h00
  // ─────────────────────────────────────────────────────────────
  @Scheduled(cron = "${app.alerte.cron:0 30 9 * * *}")
  @Transactional
  public void calculerAlertes() {
    log.info("🚀 Calcul des alertes — {}", LocalDate.now());

    LocalDate today = LocalDate.now();
    List<Object[]> dossiers = sortJugRepository.findDossiersAvecDateSignif();
    int alertesCreees = 0;

    for (Object[] row : dossiers) {
      try {
        String    numDos       = (String)    row[0];
        String    nature       = (String)    row[1];
        LocalDate dateSignif   = (LocalDate) row[2];
        Long      dossierId    = (Long)      row[3];
        Long      utilisateurId = (Long)     row[4];

        if (dateSignif == null) {
          log.debug("⏭️ Date de signification NULL pour le dossier {}", numDos);
          continue;
        }

        int seuil = "CIV".equals(nature) ? 20 : 10;
        long joursRestants = ChronoUnit.DAYS.between(today, dateSignif);

        boolean doitEnvoyer;
        if (testMode) {
          doitEnvoyer = joursRestants >= (seuil - 5) && joursRestants <= (seuil + 5);
          if (doitEnvoyer) {
            log.info("🧪 TEST — {} ({}) : {} jours restants (seuil={})",
              numDos, nature, joursRestants, seuil);
          }
        } else {
          doitEnvoyer = (joursRestants == seuil);
        }

        if (!doitEnvoyer) continue;

        if (alerteRepository.existsByIdDossierAndNatureAndDateCreation(
          dossierId, nature, today)) {
          log.info("⏭️ Alerte déjà créée aujourd'hui pour {} ({})", numDos, nature);
          continue;
        }

        Optional<Utilisateur>  utilisateurOpt = utilisateurRepository.findById(utilisateurId);
        Optional<SuiviDossier> dossierOpt     = suiviDossierRepository.findById(dossierId);

        if (utilisateurOpt.isEmpty() || dossierOpt.isEmpty()) {
          log.warn("⚠️ Utilisateur ou dossier introuvable — numDos={}", numDos);
          continue;
        }

        Alerte alerte = new Alerte();
        alerte.setNumDos(numDos);
        alerte.setNumSinistre(numDos);
        alerte.setNature(nature);
        alerte.setDateSignification(dateSignif);
        alerte.setJoursRestants((int) joursRestants);
        alerte.setStatut("ACTIVE");
        alerte.setDateCreation(LocalDate.now());
        alerte.setEmailEnvoye(false);
        alerte.setIdUtilisateur(utilisateurId);
        alerte.setIdDossier(dossierId);
        alerte.setUtilisateur(utilisateurOpt.get());
        alerte.setDossier(dossierOpt.get());

        alerteRepository.save(alerte);
        alertesCreees++;

        log.info("✅ Alerte créée — {} ({}) : signification le {} → email J-{}",
          numDos, nature, dateSignif, seuil);

      } catch (Exception e) {
        log.error("❌ Erreur dossier {} : {}", row[0], e.getMessage(), e);
      }
    }

    log.info("📊 {} alerte(s) créée(s)", alertesCreees);

    if (alertesCreees > 0) {
      envoyerEmailsRecapitulatifs();
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Envoie les emails groupés par utilisateur
  // ─────────────────────────────────────────────────────────────
  @Transactional
  public void envoyerEmailsRecapitulatifs() {
    log.info("📧 Envoi des emails récapitulatifs...");

    List<Alerte> alertes = alerteRepository.findAlertesToSendByEmail();
    if (alertes.isEmpty()) {
      log.info("📭 Aucune alerte à envoyer");
      return;
    }

    Map<Utilisateur, List<Alerte>> parUtilisateur = alertes.stream()
      .filter(a -> a.getUtilisateur() != null)
      .collect(Collectors.groupingBy(Alerte::getUtilisateur));

    for (Map.Entry<Utilisateur, List<Alerte>> entry : parUtilisateur.entrySet()) {
      Utilisateur      utilisateur        = entry.getKey();
      List<Alerte>     alertesUtilisateur = entry.getValue();

      try {
        emailService.envoyerEmailAlertes(utilisateur, alertesUtilisateur);

        alertesUtilisateur.forEach(a -> {
          a.setEmailEnvoye(true);
          a.setDateEnvoi(LocalDateTime.now());
          alerteRepository.save(a);
        });

        log.info("✅ Email envoyé à {} ({} alertes)",
          utilisateur.getEmail(), alertesUtilisateur.size());

      } catch (Exception e) {
        log.error("❌ Erreur email pour {} : {}",
          utilisateur.getEmail(), e.getMessage());
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  ✅ MÉTHODES POUR LE CONTROLLER (AJOUTÉES)
  // ─────────────────────────────────────────────────────────────

  // ✅ Récupérer les alertes d'un utilisateur (retourne des AlerteDTO)
  public List<AlerteDTO> getAlertesDTOByUtilisateur(Long userId) {
    return alerteRepository.findActiveAlertesByUserId(userId)
      .stream()
      .map(this::convertToDTO)
      .collect(Collectors.toList());
  }

  // ✅ Récupérer les alertes non lues d'un utilisateur
  public List<AlerteDTO> getAlertesNonLues(Long userId) {
    return alerteRepository.findNonLuesByUserId(userId)
      .stream()
      .map(this::convertToDTO)
      .collect(Collectors.toList());
  }

  // ✅ Compter les alertes non lues
  public Long countNonVues(Long userId) {
    return alerteRepository.countNonLuesByUserId(userId);
  }

  // ✅ Marquer toutes les alertes comme lues
  @Transactional
  public void marquerToutCommeLu(Long userId) {
    alerteRepository.marquerToutesLuesParUtilisateur(userId);
    log.info("📌 Toutes les alertes de l'utilisateur {} marquées comme lues", userId);
  }

  // ✅ Déclencher manuellement la vérification des alertes
  public String verifierEtCreerAlertes() {
    calculerAlertes();
    return "✅ Vérification des alertes terminée";
  }

  // ✅ Récupérer les alertes d'un utilisateur (version Alerte)
  public List<Alerte> getAlertesByUtilisateur(Long userId) {
    return alerteRepository.findActiveAlertesByUserId(userId);
  }

  // ✅ Compter les alertes actives
  public Long countActiveAlertes(Long userId) {
    return alerteRepository.countActiveAlertesByUserId(userId);
  }

  @Transactional
  public void marquerCommeLue(Long alerteId) {
    alerteRepository.marquerCommeLue(alerteId);
    log.info("📌 Alerte {} marquée comme lue", alerteId);
  }

  @Transactional
  public void marquerToutesLuesParDossier(Long dossierId, Long userId) {
    alerteRepository.marquerToutesLuesParDossier(dossierId, userId);
    log.info("📌 Toutes les alertes du dossier {} marquées comme lues", dossierId);
  }

  @Transactional
  public String calculerAlertesManuellement() {
    calculerAlertes();
    return "✅ Calcul des alertes terminé";
  }

  // ─────────────────────────────────────────────────────────────
  //  Conversion en DTO
  // ─────────────────────────────────────────────────────────────
  private AlerteDTO convertToDTO(Alerte alerte) {
    String nomUtilisateur = "";
    if (alerte.getUtilisateur() != null) {
      nomUtilisateur = alerte.getUtilisateur().getNom() + " " +
        (alerte.getUtilisateur().getPrenom() != null ? alerte.getUtilisateur().getPrenom() : "");
    }

    return new AlerteDTO(
      alerte.getId(),
      alerte.getIdDossier(),
      alerte.getNumDos(),
      alerte.getIdUtilisateur(),
      nomUtilisateur,
      alerte.getNature(),
      alerte.getMessage(),
      alerte.getDateSignification() != null ? alerte.getDateSignification().atStartOfDay() : null,
      alerte.getDateCreation() != null ? alerte.getDateCreation().atStartOfDay() : null,
      alerte.getDateEnvoi(),
      alerte.getEmailEnvoye(),
      alerte.getNotificationVue(),
      alerte.getDateLecture(),
      alerte.getActif()
    );
  }
}
