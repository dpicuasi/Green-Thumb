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
      "nav.logout": "Log Out",
      "dashboard.welcome": "Good Morning, {{name}}",
      "dashboard.todayIs": "Today is {{date}}",
      "dashboard.totalPlantsSub": "In your collection",
      "dashboard.healthySub": "{{percent}}% of garden",
      "dashboard.needsCareSub": "Requires attention",
      "dashboard.viewAll": "View All Garden",
      "dashboard.happyPlants": "All plants are happy!",
      "dashboard.happyPlantsSub": "Great job keeping up with your garden.",
      "dashboard.waterNow": "Water Now",
      "plants.subtitle": "Manage and track your plant collection.",
      "plants.search": "Search your plants...",
      "plants.noneFound": "No plants found",
      "plants.noneFoundSub": "Start your digital garden by adding your first plant.",
      "chat.welcome": "Hello! I am your AI Plant Advisor. Ask me anything about plant care, diagnosing issues, or local growing tips.",
      "chat.subtitle": "Your expert botanist in your pocket."
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
      "nav.logout": "Cerrar Sesión",
      "dashboard.welcome": "¡Buenos días, {{name}}!",
      "dashboard.todayIs": "Hoy es {{date}}",
      "dashboard.totalPlantsSub": "En tu colección",
      "dashboard.healthySub": "{{percent}}% del jardín",
      "dashboard.needsCareSub": "Requiere atención",
      "dashboard.viewAll": "Ver Todo el Jardín",
      "dashboard.happyPlants": "¡Todas las plantas están felices!",
      "dashboard.happyPlantsSub": "Excelente trabajo cuidando tu jardín.",
      "dashboard.waterNow": "Regar Ahora",
      "plants.subtitle": "Gestiona y sigue tu colección de plantas.",
      "plants.search": "Busca tus plantas...",
      "plants.noneFound": "No se encontraron plantas",
      "plants.noneFoundSub": "Empieza tu jardín digital añadiendo tu primera planta.",
      "chat.welcome": "¡Hola! Soy tu Asesor de Plantas IA. Pregúntame lo que quieras sobre el cuidado de plantas, diagnóstico de problemas o consejos de cultivo local.",
      "chat.subtitle": "Tu experto botánico en el bolsillo."
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
