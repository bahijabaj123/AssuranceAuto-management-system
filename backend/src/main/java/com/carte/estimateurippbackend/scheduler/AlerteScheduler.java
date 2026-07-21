// src/main/java/com/carte/estimateurippbackend/scheduler/AlerteScheduler.java
package com.carte.estimateurippbackend.scheduler;

import com.carte.estimateurippbackend.service.AlerteService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AlerteScheduler {

  private final AlerteService alerteService;

  // ✅ Vérifier les alertes tous les jours à 08:00
  @Scheduled(cron = "0 0 8 * * *")
  public void verifierAlertes() {
    System.out.println("⏰ Exécution du scheduler d'alertes - " + java.time.LocalDateTime.now());
    alerteService.verifierEtCreerAlertes();
  }
}
