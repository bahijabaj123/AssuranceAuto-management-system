package com.carte.estimateurippbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lesion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LesionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false, length = 10)
  private String code;

  @Column(nullable = false, length = 255)
  private String libelle;
}
