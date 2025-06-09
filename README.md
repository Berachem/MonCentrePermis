# 🚗 MonCentrePermis

https://github.com/user-attachments/assets/5ca0a320-dedd-4b18-b071-1c4738400fcc

**MonCentrePermis** est une plateforme web full‑stack pensée pour faciliter l'apprentissage et la préparation à l'examen du permis de conduire en France. Elle connecte élèves, moniteurs et visiteurs via des cartes interactives, des parcours personnalisés et une expérience mobile‑first.

---

## 🚀 Objectifs

- Offrir un outil moderne et centralisé pour les élèves, les moniteurs et les visiteurs.  
- Permettre une visualisation claire et interactive des centres d’examen.  
- Digitaliser les ressources pédagogiques pour mieux accompagner l’élève.  
- Offrir un accès rapide aux informations pratiques des centres.

---

## 👥 Équipe

- **Berachem MARKRIA** –  Tech Lead / Dev Full-Stack  
- **Abdallah M'CHIRI** – Dev Back‑end  
- **Ismaël MOSTEFA‑SBA** – Dev Front‑end / Communication  
- **Alessandro VILLA** – Développeur  
- **Joshua LEMOINE** – Chef de projet  

**Encadré par :** M. Benjamin RAYNAL & M. Romain Negrel  
**Filière :** E4FI – 4I‑RV2

---

## 👤 Utilisateurs

Trois types d'utilisateurs :

| Profil     | Accès et fonctionnalités |
|------------|--------------------------|
| **Élève**  | Parcours personnalisés, ressources pédagogiques |
| **Moniteur** | Création de parcours, gestion des élèves et des cours |
| **Visiteur** | Informations générales sur les centres |

---

## 🧰 Technologies

![image](https://github.com/user-attachments/assets/50b4fb88-8921-4f30-8e0a-5b0b4870f531)


- **Front‑end** : ReactJS, TypeScript, Tailwind
- **Back‑end** :  Symfony (API REST)  
- **Base de données** : PostgreSQL 
- **API** : RESTful  
- **Carte interactive** : LeafletJS (et système de GPS intelligent)

---

## ✨ Fonctionnalités clés

- Carte interactive des **227 centres d’examen** en France  
- Parcours d'apprentissage **personnalisés**  
- Banque de **ressources pédagogiques** accessible  
- Interface **responsive / mobile‑first**  
- Gestion des élèves et des séances pour les moniteurs  
- Vision future : visualisation des circuits (Street View, Panoramax), internationalisation

---

## 🏁 Concurrence

Un concurrent identiﬁé existe, mais est trop localisé. **MonCentrePermis** se distingue par :

- Une approche **nationale**  
- Une **accessibilité gratuite**  
- Une **fiabilité terrain**, basée sur des moniteurs  
- Une **expérience utilisateur moderne**

---

## 📈 Perspectives & Roadmap

1. **Internationalisation**, pour d’autres pays  
2. **Intégration des auto‑écoles**, gestion élèves et cours  
3. **Visualisation interactive des parcours** (Street View, Panoramax…)

---

## 🎓 Contexte du projet

- Développé dans le cadre de la **4ᵉ année d’école d’ingénieur** (ESIEE Paris)  
- Projet encadré par R. Negrel et B. Raynal  
- Interactions avec une équipe pluridisciplinaire pour couvrir les différents aspects fonctionnels et techniques

---

## 🔧 Installation 

```bash
git clone https://github.com/moncentrepermis/moncentrepermis.git
cd moncentrepermis

# Setup backend
cd backend

# Installer les dépendances PHP
composer install

# Copier et configurer les variables d'environnement
cp .env .env.local
# Modifier .env.local avec vos informations de base de données

# Créer la base de données
php bin/console doctrine:database:create

# Lancer les migrations (si existantes)
php bin/console doctrine:migrations:migrate

# (Optionnel) Charger des fixtures si disponibles
php bin/console doctrine:fixtures:load

# Lancer le serveur Symfony
symfony server:start
# ou
php -S localhost:8000 -t public


# Setup frontend
cd ../frontend
npm install
npm run dev

