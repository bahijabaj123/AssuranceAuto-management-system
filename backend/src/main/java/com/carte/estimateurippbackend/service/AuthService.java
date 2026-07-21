package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UtilisateurRepository utilisateurRepository;
  // ❌ Supprimer PasswordEncoder
  // private final PasswordEncoder passwordEncoder;

  public Utilisateur findByEmail(String email) {
    return utilisateurRepository.findByEmail(email)
      .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
  }

  @Transactional
  public Utilisateur register(Utilisateur utilisateur) {
    if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
      throw new RuntimeException("Email déjà utilisé");
    }
    // ❌ NE PAS encoder
    utilisateur.setDateCreation(LocalDate.now());
    utilisateur.setDateModification(LocalDate.now());
    if (utilisateur.getRole() == null || utilisateur.getRole().isEmpty()) {
      utilisateur.setRole("GESTIONNAIRE");
    }
    utilisateur.setActif(true);
    return utilisateurRepository.save(utilisateur);
  }

  public Utilisateur login(String email, String password) {
    System.out.println("🔍 Recherche de l'utilisateur: " + email);
    Utilisateur user = findByEmail(email);
    System.out.println("👤 Utilisateur trouvé: " + user.getEmail());
    System.out.println("🔑 Mot de passe saisi: " + password);
    System.out.println("🔒 Mot de passe en BDD: " + user.getPassword());

    // ✅ Comparaison en clair
    if (!password.equals(user.getPassword())) {
      System.out.println("❌ Les mots de passe NE correspondent PAS !");
      throw new RuntimeException("Mot de passe incorrect");
    }
    System.out.println("✅ Les mots de passe correspondent !");
    return user;
  }

  @Transactional
  public Utilisateur resetPassword(String email, String nouveauMotDePasse) {
    Utilisateur user = findByEmail(email);
    // ❌ NE PAS encoder
    user.setPassword(nouveauMotDePasse);
    user.setDateModification(LocalDate.now());
    return utilisateurRepository.save(user);
  }
}
