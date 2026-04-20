export const config={
  NAME:"Sellplat",
  BASE_URL:import.meta.env.VITE_API_URL,
  IMG_DELIVERY:"https://imagedelivery.net/K6bNIi4XITxUPMPcb-sFlw",
  HOSTNAME:"http://localhost:5173",
  RESERVED_TITLES:["home","blog"],
  SPLITTER:"|*|",
  SPLITTER2:"|**|",
  SITE_LANGUAGE: ["English","French"],
  TIME_ZONE:["Lagos","Toronto"],
  CURRENCY:["USD","NGR","CAD"],
  ICONS:['bi-card-image','bi-alexa','bi-asterisk','bi-award','bi-balloon-heart'],
 ACTIVE_THEME:["Default","Blue","Green","Red","Orange"],

  THEMES:{
  
  default:{
  "--sp-primary":"#2563eb",
  "--sp-primary-hover":"#1d4ed8",
  "--sp-bg":"#ffffff",
  "--sp-card":"#f9fafb",
  "--sp-text":"#111827",
  "--sp-muted":"#6b7280",
  "--sp-link":"#2563eb",
  "--sp-link-hover":"#1d4ed8",
  "--sp-border":"#e5e7eb",
  },
  blue: {
  "--sp-primary":"#2563eb",
  "--sp-primary-hover":"#1d4ed8",
  },
  green: {
  "--sp-primary":"#10b981",
  "--sp-primary-hover":"#059669",
  },
  red: {
 "--sp-primary":"#ef4444",
  "--sp-primary-hover":"#dc2626",
  },

  purple: {
  "--sp-primary":"#7c3aed",
  "--sp-primary-hover":"#6d28d9",
  },
  yellow: {

  },
  orange:{
  "--sp-primary":"#f97316",
  "--sp-primary-hover":"#ea580c",
  }
  },
  
  SIDEBAR_LAYOUT:["NONE","LEFT", "RIGHT"],
  CONTENT_STATUS :["PUBLISH","DRAFT","TRASH"],
  POST_TYPE :["POST","PAGE","PRODUCT","COURSE"],
  ROLES :["SUBSCRIBER","CONTRIBUTOR","AUTHOR","EDITOR"],
  MAX_USERS:3,
  

  //##########
  NETWORK_ERROR:"Please check your internet connection",
  SERVER_ERROR:"Something went wrong, please try again",
  EMAIL_EXISTS_ERROR:"Email Exists",
  MAX_USERS_ERROR: "User Limit Reached",

  //######
  ALERT_TYPE:["alert-success", "alert-warning", "alert-danger"],
  VALIDATION_REQUIRED_CLASS:['border','border-danger']
};