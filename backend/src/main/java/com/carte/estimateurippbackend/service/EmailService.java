package com.carte.estimateurippbackend.service;

import com.carte.estimateurippbackend.entity.Alerte;
import com.carte.estimateurippbackend.entity.Utilisateur;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

  private final JavaMailSender mailSender;

  @Value("${spring.mail.username}")
  private String fromEmail;

  public boolean envoyerEmail(String to, String subject, String body) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(body, true);  // ✅ TRUE = HTML

      mailSender.send(message);
      log.info("📧 Email envoyé à {}", to);
      return true;
    } catch (MessagingException e) {
      log.error("❌ Erreur d'envoi d'email à {}: {}", to, e.getMessage());
      return false;
    }
  }

  public void envoyerEmailAlertes(Utilisateur utilisateur, List<Alerte> alertes) {
    String nomComplet = utilisateur.getPrenom() + " " + utilisateur.getNom();
    String htmlContent = construireEmailHTML(utilisateur, alertes);

    envoyerEmail(utilisateur.getEmail(), "🔔 Carte Assurances - Alertes dossiers judiciaires", htmlContent);
    log.info("✅ Email envoyé avec succès à {} ({} alertes)", utilisateur.getEmail(), alertes.size());
  }

  private String construireEmailHTML(Utilisateur utilisateur, List<Alerte> alertes) {
    String nomComplet = utilisateur.getPrenom() + " " + utilisateur.getNom();
    int totalAlertes = alertes.size();
    int urgentCount = (int) alertes.stream().filter(a -> a.getJoursRestants() != null && a.getJoursRestants() <= 5).count();

    StringBuilder sb = new StringBuilder();

    sb.append("<!DOCTYPE html>");
    sb.append("<html lang='fr'>");
    sb.append("<head>");
    sb.append("<meta charset='UTF-8'>");
    sb.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
    sb.append("<title>Alertes Carte Assurances</title>");
    sb.append("<style>");
    sb.append("body { margin: 0; padding: 0; background: #f0f4f8; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; }");
    sb.append(".container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; }");

    // HEADER
    sb.append(".header { background: linear-gradient(135deg, #1a237e 0%, #283593 100%); padding: 30px 35px; position: relative; }");
    sb.append(".header::after { content: ''; position: absolute; top: -50%; right: -20%; width: 60%; height: 200%; background: rgba(255,255,255,0.04); border-radius: 50%; }");
    sb.append(".header-content { position: relative; z-index: 1; }");
    sb.append(".header-logo { display: flex; align-items: center; gap: 12px; }");
    sb.append(".header-logo span { font-size: 28px; }");
    sb.append(".header-logo h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }");
    sb.append(".header-logo h1 span { color: #ffd54f; }");
    sb.append(".header-subtitle { color: rgba(255,255,255,0.8); font-size: 14px; margin: 6px 0 0 0; }");
    sb.append(".header-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,107,107,0.2); border: 1px solid rgba(255,107,107,0.3); padding: 6px 16px; border-radius: 20px; margin-top: 12px; }");
    sb.append(".header-badge span { color: #ff6b6b; font-size: 13px; font-weight: 600; }");
    sb.append(".header-badge .count { background: #ff6b6b; color: white; padding: 0 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }");

    // CONTENT
    sb.append(".content { padding: 30px 35px; }");
    sb.append(".greeting { margin-bottom: 25px; }");
    sb.append(".greeting h2 { margin: 0 0 4px 0; font-size: 20px; color: #1a237e; }");
    sb.append(".greeting p { margin: 0; color: #5c6b7e; font-size: 15px; line-height: 1.5; }");
    sb.append(".greeting strong { color: #1a237e; }");

    // STATS
    sb.append(".stats { display: flex; gap: 12px; margin: 20px 0 25px; }");
    sb.append(".stat-card { flex: 1; background: #f8f9fe; border-radius: 12px; padding: 14px 16px; text-align: center; border: 1px solid #eef0f5; }");
    sb.append(".stat-card .number { font-size: 26px; font-weight: 700; color: #1a237e; }");
    sb.append(".stat-card .label { font-size: 12px; color: #8a9bb0; margin-top: 2px; }");
    sb.append(".stat-card.urgent .number { color: #ff6b6b; }");

    // ALERTES LIST
    sb.append(".alertes-list { margin: 25px 0; }");
    sb.append(".alertes-list .title { font-size: 14px; font-weight: 600; color: #1a237e; margin-bottom: 15px; }");

    sb.append(".alerte-item { display: flex; align-items: center; padding: 14px 18px; margin-bottom: 10px; background: #f8f9fe; border-radius: 12px; border-left: 4px solid #ffd54f; transition: all 0.2s; }");
    sb.append(".alerte-item.urgent { border-left-color: #ff6b6b; background: #fff5f5; }");
    sb.append(".alerte-item .icon { font-size: 20px; margin-right: 14px; }");
    sb.append(".alerte-item .info { flex: 1; }");
    sb.append(".alerte-item .dossier { font-weight: 600; color: #1a237e; font-size: 15px; }");
    sb.append(".alerte-item .meta { display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap; }");
    sb.append(".alerte-item .meta .nature { display: inline-block; padding: 1px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; }");
    sb.append(".alerte-item .meta .nature.civ { background: #e3f2fd; color: #1565c0; }");
    sb.append(".alerte-item .meta .nature.corr { background: #fff3e0; color: #e65100; }");
    sb.append(".alerte-item .meta .date { color: #6b7f96; font-size: 13px; }");
    sb.append(".alerte-item .jours { font-weight: 700; font-size: 18px; min-width: 50px; text-align: right; }");
    sb.append(".alerte-item .jours.safe { color: #43a047; }");
    sb.append(".alerte-item .jours.warning { color: #ffa726; }");
    sb.append(".alerte-item .jours.danger { color: #ff6b6b; }");
    sb.append(".alerte-item .link { color: #1a237e; text-decoration: none; font-size: 13px; font-weight: 500; }");
    sb.append(".alerte-item .link:hover { text-decoration: underline; }");

    // BUTTON
    sb.append(".btn-container { text-align: center; margin: 30px 0 10px; }");
    sb.append(".btn { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #1a237e 0%, #283593 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(26,35,126,0.3); }");
    sb.append(".btn:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(26,35,126,0.4); }");

    // FOOTER
    sb.append(".footer { background: #f8f9fe; padding: 20px 35px; border-top: 1px solid #eef0f5; text-align: center; }");
    sb.append(".footer p { margin: 4px 0; font-size: 12px; color: #8a9bb0; }");
    sb.append(".footer .brand { color: #1a237e; font-weight: 600; }");
    sb.append(".footer .unsubscribe { color: #8a9bb0; font-size: 11px; text-decoration: underline; }");

    sb.append("</style>");
    sb.append("</head>");
    sb.append("<body>");

    // ===== CONTAINER =====
    sb.append("<div class='container'>");

    // ===== HEADER =====
    sb.append("<div class='header'>");
    sb.append("<div class='header-content'>");
    sb.append("<div class='header-logo'>");
    sb.append("<span>🛡️</span>");
    sb.append("<h1>Carte <span>Assurances</span></h1>");
    sb.append("</div>");
    sb.append("<p class='header-subtitle'>Système d'alertes automatique</p>");
    if (urgentCount > 0) {
      sb.append("<div class='header-badge'>");
      sb.append("<span>⚠️</span>");
      sb.append("<span>" + urgentCount + " dossier(s) urgent(s)</span>");
      sb.append("<span class='count'>!" + urgentCount + "</span>");
      sb.append("</div>");
    }
    sb.append("</div>");
    sb.append("</div>");

    // ===== CONTENT =====
    sb.append("<div class='content'>");

    // Greeting
    sb.append("<div class='greeting'>");
    sb.append("<h2>Bonjour " + nomComplet + " 👋</h2>");
    sb.append("<p>Vous avez <strong>" + totalAlertes + "</strong> dossier(s) nécessitant votre attention.</p>");
    sb.append("</div>");

    // Stats
    int urgent = urgentCount;
    int normal = totalAlertes - urgent;
    sb.append("<div class='stats'>");
    sb.append("<div class='stat-card'>");
    sb.append("<div class='number'>" + totalAlertes + "</div>");
    sb.append("<div class='label'>📋 Total</div>");
    sb.append("</div>");
    sb.append("<div class='stat-card urgent'>");
    sb.append("<div class='number'>" + urgent + "</div>");
    sb.append("<div class='label'>🔴 Urgent</div>");
    sb.append("</div>");
    sb.append("<div class='stat-card'>");
    sb.append("<div class='number'>" + normal + "</div>");
    sb.append("<div class='label'>🟡 À suivre</div>");
    sb.append("</div>");
    sb.append("</div>");

    // Alertes list
    sb.append("<div class='alertes-list'>");
    sb.append("<div class='title'>📋 Détail des dossiers</div>");

    for (Alerte alerte : alertes) {
      String classeUrgence = alerte.getJoursRestants() != null && alerte.getJoursRestants() <= 5 ? "urgent" : "";
      String classeJours;
      String labelJours;
      if (alerte.getJoursRestants() != null && alerte.getJoursRestants() <= 5) {
        classeJours = "danger";
        labelJours = "⚠️ " + alerte.getJoursRestants() + "j";
      } else if (alerte.getJoursRestants() != null && alerte.getJoursRestants() <= 10) {
        classeJours = "warning";
        labelJours = "⚡ " + alerte.getJoursRestants() + "j";
      } else {
        classeJours = "safe";
        labelJours = "✅ " + (alerte.getJoursRestants() != null ? alerte.getJoursRestants() : "?") + "j";
      }

      String icon = "CIV".equals(alerte.getNature()) ? "⚖️" : "🏛️";
      String natureClass = "CIV".equals(alerte.getNature()) ? "civ" : "corr";
      String dateSignif = alerte.getDateSignification() != null ? alerte.getDateSignification().toString() : "Non définie";

      String lien = "http://localhost:4200/etat-suivi/dossier/" + alerte.getNumDos();

      sb.append("<a href='" + lien + "' style='text-decoration: none; color: inherit; display: block;'>");
      sb.append("<div class='alerte-item " + classeUrgence + "'>");
      sb.append("<span class='icon'>" + icon + "</span>");
      sb.append("<div class='info'>");
      sb.append("<div class='dossier'>📋 " + alerte.getNumDos() + "</div>");
      sb.append("<div class='meta'>");
      sb.append("<span class='nature " + natureClass + "'>" + alerte.getNature() + "</span>");
      sb.append("<span class='date'>📅 " + dateSignif + "</span>");
      sb.append("</div>");
      sb.append("</div>");
      sb.append("<div class='jours " + classeJours + "'>" + labelJours + "</div>");
      sb.append("</div>");
      sb.append("</a>");
    }

    sb.append("</div>");

    // Button
    sb.append("<div class='btn-container'>");
    sb.append("<a href='http://localhost:4200/alertes' class='btn'>");
    sb.append("📊 Voir tous les dossiers →");
    sb.append("</a>");
    sb.append("</div>");

    sb.append("</div>");

    // ===== FOOTER =====
    sb.append("<div class='footer'>");
    sb.append("<p>© 2026 <span class='brand'>Carte Assurances</span> — Tous droits réservés</p>");
    sb.append("<p>Cet email a été envoyé automatiquement par le système d'alertes.</p>");
    sb.append("</div>");

    sb.append("</div>");
    sb.append("</body>");
    sb.append("</html>");

    return sb.toString();
  }
}
