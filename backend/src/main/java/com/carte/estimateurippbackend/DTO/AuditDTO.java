// src/main/java/com/carte/estimateurippbackend/DTO/AuditDTO.java
package com.carte.estimateurippbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuditDTO {
  private Long id;
  private Long idDossier;
  private Long idUtilisateur;
  private String nomUtilisateur;
  private String numDos;
  private String action;
  private String anciennesValeurs;
  private String nouvellesValeurs;
  private LocalDateTime dateAction;
  private String ipAdresse;

  public String getActionLabel() {
    switch (action) {
      case "CREATE": return "📝 Création";
      case "UPDATE": return "✏️ Modification";
      case "DELETE": return "🗑️ Suppression";
      default: return action;
    }
  }

  public String getActionColor() {
    switch (action) {
      case "CREATE": return "#2ecc71";
      case "UPDATE": return "#3498db";
      case "DELETE": return "#e74c3c";
      default: return "#95a5a6";
    }
  }
}
