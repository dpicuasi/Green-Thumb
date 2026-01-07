import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app.name": "Geranium Journal",
      "nav.dashboard": "Dashboard",
      "nav.myPlants": "My Plants",
      "nav.calendar": "Calendar",
      "nav.chat": "AI Advisor",
      "nav.subscription": "Subscription",
      "dashboard.title": "Dashboard",
      "dashboard.needsAttention": "Needs Attention",
      "dashboard.totalPlants": "Total Plants",
      "plants.title": "My Plants",
      "plants.add": "Add Plant",
      "plants.location.indoor": "Indoor",
      "plants.location.outdoor": "Outdoor",
      "plants.health.healthy": "Healthy",
      "plants.health.needs_attention": "Needs Attention",
      "plants.health.sick": "Sick",
      "chat.title": "Plant AI Advisor",
      "chat.placeholder": "Ask about your plants...",
      "common.loading": "Loading...",
      "common.error": "An error occurred",
      "auth.login": "Log In with Replit"
    }
  },
  es: {
    translation: {
      "app.name": "Geranium Journal",
      "nav.dashboard": "Panel de Control",
      "nav.myPlants": "Mis Plantas",
      "nav.calendar": "Calendario",
      "nav.chat": "Asesor IA",
      "nav.subscription": "Suscripción",
      "dashboard.title": "Panel de Control",
      "dashboard.needsAttention": "Necesitan Atención",
      "dashboard.totalPlants": "Total de Plantas",
      "plants.title": "Mis Plantas",
      "plants.add": "Añadir Planta",
      "plants.location.indoor": "Interior",
      "plants.location.outdoor": "Exterior",
      "plants.health.healthy": "Saludable",
      "plants.health.needs_attention": "Necesita Atención",
      "plants.health.sick": "Enferma",
      "chat.title": "Asesor IA de Plantas",
      "chat.placeholder": "Pregunta sobre tus plantas...",
      "common.loading": "Cargando...",
      "common.error": "Ocurrió un error",
      "auth.login": "Iniciar sesión con Replit"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
