# 🚗 AssuranceAuto Management System

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat-square&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Plateforme complète de gestion des sinistres et de suivi des taux IPP**  
> *Développé pour le Bureau Corporel de Carte Assurances*

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Structure du Projet](#structure-du-projet)
- [Auteur](#auteur)

---

## 🎯 Aperçu

**AssuranceAuto Management System** est une application web fullstack développée pour **Carte Assurances** visant à :

- 📊 **Centraliser** la gestion des sinistres sur 5 années (2022-2026)
- 📈 **Analyser** les tendances des taux IPP et des règlements
- 🔍 **Faciliter** la recherche et le suivi des dossiers
- 🤖 **Automatiser** la synchronisation des données
- 📁 **Générer** des rapports et exports personnalisés

---

## ✨ Fonctionnalités

### 🏠 Dashboard Interactif
- 6 graphiques dynamiques (évolution, répartition IPP, montants, règlements)
- KPI en temps réel (Total sinistres, IPP moyen, NBR JRS moyen)
- Indicateurs de tendance (Hausse / Baisse / Stable)
- Top 5 des sinistres
- Derniers sinistres ajoutés

### 📋 Gestion des Sinistres
- CRUD complet (Créer, lire, modifier, supprimer)
- Filtres avancés (SIN, tiers, année, IPP, NBR JRS)
- Recherche en temps réel
- Export Excel
- Pagination

### 🔍 Recherche Unifiée
- Recherche sur 5 tables simultanément
- Affichage en cartes colorées
- Création rapide depuis les résultats

### 🔄 Synchronisation Automatique
- Synchronisation Suivi Dossiers → Données Sinistres
- Mise à jour automatique des champs

### 📊 Statistiques & Analytics
- Statistiques par année
- Répartition IPP par tranche
- Évolution annuelle des sinistres
- Analyse des montants RCC et RCM

### 👤 Gestion des Utilisateurs
- Authentification sécurisée (JWT)
- Rôles : ADMIN / GESTIONNAIRE
- Filtrage par propriétaire
- Audit des actions

---

## 🛠️ Stack Technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | Angular | 19 |
| | TypeScript | 5.0 |
| | Chart.js | 4.4 |
| | Font Awesome | 4.7 |
| **Backend** | Spring Boot | 3.2 |
| | Spring Security | 3.2 |
| | Spring Data JPA | 3.2 |
| | JJWT | 0.11 |
| **Base de données** | MySQL | 8.0 |
| **Scripts** | Python | 3.11 |
| | Pandas | 2.2 |

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Java JDK 17+
- MySQL 8.0+
- Maven 3.8+
- Angular CLI 19+

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/bahijabaj123/AssuranceAuto-management-system.git
cd AssuranceAuto-management-system
