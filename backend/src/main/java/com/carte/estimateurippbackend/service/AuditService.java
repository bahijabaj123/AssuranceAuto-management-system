// src/main/java/com/carte/estimateurippbackend/service/AuditService.java
package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.DTO.AuditDTO;
import com.carte.estimateurippbackend.entity.Audit;
import com.carte.estimateurippbackend.repository.AuditRepository;
import com.carte.estimateurippbackend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {

  private final AuditRepository auditRepository;
  private final UtilisateurRepository utilisateurRepository;

  @Transactional
  public void enregistrerAction(Long idDossier, Long idUtilisateur, String action,
                                String numDos, String anciennesValeurs, String nouvellesValeurs, String ipAdresse) {
    Audit audit = new Audit();
    audit.setIdDossier(idDossier);
    audit.setIdUtilisateur(idUtilisateur);
    audit.setAction(action);
    audit.setNumDos(numDos);
    audit.setAnciennesValeurs(anciennesValeurs);
    audit.setNouvellesValeurs(nouvellesValeurs);
    audit.setDateAction(LocalDateTime.now());
    audit.setIpAdresse(ipAdresse);

    // Récupérer le nom de l'utilisateur
    utilisateurRepository.findById(idUtilisateur).ifPresent(u ->
      audit.setNomUtilisateur(u.getNom() + (u.getPrenom() != null ? " " + u.getPrenom() : ""))
    );

    auditRepository.save(audit);
    System.out.println("✅ Audit enregistré: " + action + " - Dossier: " + numDos);
  }

  public List<AuditDTO> getAuditsByUser(Long idUtilisateur) {
    return auditRepository.findByIdUtilisateurOrderByDateActionDesc(idUtilisateur)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  public List<AuditDTO> getAuditsAccessibles(Long idUtilisateur) {
    // ✅ Pour l'instant, seulement les audits de l'utilisateur
    return auditRepository.findAuditsAccessibles(idUtilisateur)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  public List<AuditDTO> getAllAudits() {
    return auditRepository.findAllByOrderByDateActionDesc()
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  public List<AuditDTO> getAuditsByAction(String action) {
    return auditRepository.findByActionOrderByDateActionDesc(action)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  public List<AuditDTO> getAuditsByNumDos(String numDos) {
    return auditRepository.findByNumDosOrderByDateActionDesc(numDos)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  private AuditDTO toDTO(Audit audit) {
    return new AuditDTO(
      audit.getId(),
      audit.getIdDossier(),
      audit.getIdUtilisateur(),
      audit.getNomUtilisateur(),
      audit.getNumDos(),
      audit.getAction(),
      audit.getAnciennesValeurs(),
      audit.getNouvellesValeurs(),
      audit.getDateAction(),
      audit.getIpAdresse()
    );
  }
}
