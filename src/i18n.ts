import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Emergency Aid South Kivu",
      "slogan": "Connecting people in need with those who can help.",
      "ask_help": "Ask for Help",
      "help_someone": "Help Someone",
      "recent_requests": "Recent Requests",
      "urgent": "Urgent",
      "medical": "Medical",
      "food": "Food",
      "financial": "Financial",
      "emergency": "Emergency",
      "open": "Open",
      "in_progress": "In Progress",
      "resolved": "Resolved",
      "title": "Title",
      "description": "Description",
      "category": "Category",
      "location": "Location (City/Area)",
      "contact": "Contact (Phone)",
      "submit": "Submit Request",
      "login_google": "Login with Google",
      "logout": "Logout",
      "i_can_help": "I can help",
      "call": "Call",
      "message": "Message",
      "no_requests": "No requests found.",
      "loading": "Loading...",
      "my_requests": "My Requests",
      "profile": "Profile",
      "name": "Name",
      "phone": "Phone",
      "role": "I am a...",
      "volunteer": "Volunteer",
      "user": "Citizen",
      "ngo": "NGO/Organization",
      "save": "Save",
      "status": "Status",
      "created_at": "Posted on",
      "switch_lang": "Français",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode"
    }
  },
  fr: {
    translation: {
      "app_name": "Aide Urgente Sud-Kivu",
      "slogan": "Connecter ceux qui ont besoin d'aide avec ceux qui peuvent aider.",
      "ask_help": "Demander de l'aide",
      "help_someone": "Aider quelqu'un",
      "recent_requests": "Demandes Récentes",
      "urgent": "Urgent",
      "medical": "Médical",
      "food": "Nourriture",
      "financial": "Financier",
      "emergency": "Urgence",
      "open": "Ouvert",
      "in_progress": "En cours",
      "resolved": "Résolu",
      "title": "Titre",
      "description": "Description",
      "category": "Catégorie",
      "location": "Localisation (Ville/Zone)",
      "contact": "Contact (Téléphone)",
      "submit": "Publier la demande",
      "login_google": "Connexion avec Google",
      "logout": "Déconnexion",
      "i_can_help": "Je peux aider",
      "call": "Appeler",
      "message": "Message",
      "no_requests": "Aucune demande trouvée.",
      "loading": "Chargement...",
      "my_requests": "Mes demandes",
      "profile": "Profil",
      "name": "Nom",
      "phone": "Téléphone",
      "role": "Je suis un...",
      "volunteer": "Bénévole",
      "user": "Citoyen",
      "ngo": "ONG/Organisation",
      "save": "Enregistrer",
      "status": "Statut",
      "created_at": "Publié le",
      "switch_lang": "English",
      "dark_mode": "Mode Sombre",
      "light_mode": "Mode Clair"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
