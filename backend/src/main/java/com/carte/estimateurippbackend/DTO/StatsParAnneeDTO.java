// src/main/java/com/carte/estimateurippbackend/DTO/StatsParAnneeDTO.java
package com.carte.estimateurippbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsParAnneeDTO {
  private Integer annee;
  private Long total;
  private Long natureCiv;
  private Long natureCorr;
  private Long naturePenal;
  private Long natureAdmin;
  private Double totalReglements;
}
