package com.carte.estimateurippbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TiersSinistreDTO {
  private Long id;
  private String sin;
  private String nomTiers;
  private Double ipp;
  private Integer nbrJrs;
  private Double reglements;
  private LocalDateTime dateCreation;
  private LocalDateTime dateModification;
}
