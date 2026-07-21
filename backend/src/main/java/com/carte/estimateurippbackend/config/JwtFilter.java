// src/main/java/com/carte/estimateurippbackend/config/JwtFilter.java
package com.carte.estimateurippbackend.config;

import com.carte.estimateurippbackend.entity.Utilisateur;
import com.carte.estimateurippbackend.repository.UtilisateurRepository;
import com.carte.estimateurippbackend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UtilisateurRepository utilisateurRepository;

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain chain) throws ServletException, IOException {

    final String authorizationHeader = request.getHeader("Authorization");

    String email = null;
    String jwt = null;

    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
      jwt = authorizationHeader.substring(7);
      try {
        email = jwtService.extractEmail(jwt);
      } catch (Exception e) {
        logger.warn("Token invalide: " + e.getMessage());
      }
    }

    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);

      if (utilisateur != null && jwtService.validateToken(jwt)) {
        // ✅ Ajouter le rôle dans les autorités
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (utilisateur.getRole() != null) {
          String role = utilisateur.getRole().replace("ROLE_", "");
          authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
          utilisateur.getEmail(),
          utilisateur.getPassword(),
          authorities
        );

        UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
            utilisateur,
            null,
            userDetails.getAuthorities()
          );

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    }

    chain.doFilter(request, response);
  }
}
