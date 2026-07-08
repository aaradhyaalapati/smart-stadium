import { IntentName, SupportedLanguage } from './intents';
import { Need } from '../types/domain';

export type TemplateData = Record<string, string | number>;

export const templates: Record<SupportedLanguage, Record<IntentName | 'missing_venue' | 'error', string>> = {
  en: {
    greeting: "Welcome to the FIFA World Cup 2026. How can I assist you with your stadium visit today?",
    accessibility: "Here is the accessibility information for {venue}. You requested help with {need}. {note} {services}",
    services: "Here are the general services available at {venue}: {services}.",
    food_water: "Food and water stations at {venue} are located throughout the concourse. Water fountains are {water_status}.",
    schedule: "The match at {venue} is {match}. Gates open at {gatesOpen} and kickoff is at {kickoffTime}.",
    navigation: "At {venue}, the crowd level is currently {crowdLevel} with an estimated wait of {waitMinutes} minutes. Recommended gates are: {gates}.",
    unknown: "I am not sure how to help with that. Could you ask about accessibility, services, or live status?",
    missing_venue: "Please select a venue to get specific information. For example, you can ask about {exampleVenues}.",
    error: "I encountered an error trying to process your request: {error}."
  },
  es: {
    greeting: "Bienvenido a la Copa Mundial de la FIFA 2026. ¿Cómo puedo ayudarle con su visita al estadio hoy?",
    accessibility: "Aquí tiene la información de accesibilidad para {venue}. Solicitó ayuda con {need}. {note} {services}",
    services: "Aquí están los servicios generales disponibles en {venue}: {services}.",
    food_water: "Los puestos de comida y agua en {venue} se encuentran en todo el vestíbulo. Las fuentes de agua están {water_status}.",
    schedule: "El partido en {venue} es {match}. Las puertas abren a las {gatesOpen} y el inicio es a las {kickoffTime}.",
    navigation: "En {venue}, el nivel de afluencia es actualmente {crowdLevel} con un tiempo de espera estimado de {waitMinutes} minutos. Las puertas recomendadas son: {gates}.",
    unknown: "No estoy seguro de cómo ayudar con eso. ¿Podría preguntar sobre accesibilidad, servicios o estado en vivo?",
    missing_venue: "Por favor seleccione un estadio para obtener información específica. Por ejemplo, puede preguntar sobre {exampleVenues}.",
    error: "Encontré un error al intentar procesar su solicitud: {error}."
  },
  fr: {
    greeting: "Bienvenue à la Coupe du Monde de la FIFA 2026. Comment puis-je vous aider pour votre visite au stade aujourd'hui?",
    accessibility: "Voici les informations d'accessibilité pour {venue}. Vous avez demandé de l'aide pour {need}. {note} {services}",
    services: "Voici les services généraux disponibles à {venue}: {services}.",
    food_water: "Les stands de nourriture et d'eau à {venue} sont situés tout au long du hall. Les fontaines à eau sont {water_status}.",
    schedule: "Le match à {venue} est {match}. Les portes ouvrent à {gatesOpen} et le coup d'envoi est à {kickoffTime}.",
    navigation: "À {venue}, l'affluence est actuellement {crowdLevel} avec un temps d'attente estimé de {waitMinutes} minutes. Les portes recommandées sont: {gates}.",
    unknown: "Je ne suis pas sûr de savoir comment vous aider avec cela. Pourriez-vous poser des questions sur l'accessibilité, les services ou le statut en direct?",
    missing_venue: "Veuillez sélectionner un stade pour obtenir des informations spécifiques. Par exemple, vous pouvez demander pour {exampleVenues}.",
    error: "J'ai rencontré une erreur en essayant de traiter votre demande: {error}."
  }
};

export function renderTemplate(language: SupportedLanguage, key: IntentName | 'missing_venue' | 'error', data: TemplateData = {}): string {
  let template = templates[language]?.[key] || templates['en'][key];
  if (!template) {
    return "Error: Template not found.";
  }

  for (const [k, v] of Object.entries(data)) {
    template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }

  // Ensure no unrendered placeholders remain
  if (/\{[a-zA-Z_]+\}/.test(template)) {
    throw new Error(`Unrendered template placeholder in output: ${template}`);
  }

  return template;
}
