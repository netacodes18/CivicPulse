import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation dictionaries
const resources = {
  en: {
    translation: {
      // Navbar
      "nav_report_issue": "Report Issue",
      "nav_community": "Community",
      "nav_dashboard": "Admin Dashboard",
      "nav_my_reports": "My Reports",
      "nav_login": "Login",
      "nav_signup": "Sign Up",
      "nav_logout": "Logout",
      "nav_all_reports": "All Reports",
      
      // Home
      "home_subtitle": "municipal response unit",
      "home_title": "civic",
      "home_title_accent": "pulse",
      "home_description": "Empowering citizens to report urban anomalies and civic grievances to their local authorities. Modernize your municipality.",
      "home_cta_report": "Log Anomaly",
      "home_cta_feed": "View Community Feed",
      
      // Signup
      "signup_title": "citizen registry",
      "signup_subtitle": "Join the civic response network",
      "signup_username": "Username",
      "signup_email": "Email Address",
      "signup_phone": "Mobile Number",
      "signup_password": "Password",
      "signup_state": "State / Union Territory",
      "signup_state_placeholder": "Select your state",
      "signup_area": "Local Area / District",
      "signup_role": "System Role",
      "signup_btn": "Register Citizen",
      "signup_loading": "Registering...",
      
      // Report
      "report_title": "Anomaly Log",
      "report_subtitle": "Document and categorize urban issues for municipal review",
      "report_form_title": "Issue Title",
      "report_form_desc": "Detailed Description",
      "report_form_category": "Classification Category",
      "report_cat_roads": "Roads & Highways (Sadak)",
      "report_cat_sanitation": "Sanitation (Swachhata)",
      "report_cat_water": "Water Supply (Jal)",
      "report_cat_electricity": "Electricity (Vidyut)",
      "report_cat_other": "Other Grievance",
      "report_evidence": "Evidence Upload",
      "report_gps": "Location Coordinates (Optional)",
      "report_btn_detect": "Detect Location",
      "report_btn_detecting": "Detecting...",
      "report_gps_hint": "Capture coordinates for accurate spatial mapping",
      "report_btn_submit": "Submit Anomaly Log",
      "report_btn_submitting": "Submitting...",
      "report_err_gps": "Geolocation is not supported by your browser.",
      "report_err_gps_fail": "Unable to retrieve your location. Please ensure location services are enabled."
    }
  },
  hi: {
    translation: {
      // Navbar
      "nav_report_issue": "शिकायत दर्ज करें",
      "nav_community": "समुदाय",
      "nav_dashboard": "व्यवस्थापक डैशबोर्ड",
      "nav_my_reports": "मेरी शिकायतें",
      "nav_login": "लॉग इन",
      "nav_signup": "साइन अप",
      "nav_logout": "लॉग आउट",
      "nav_all_reports": "सभी रिपोर्ट",
      
      // Home
      "home_subtitle": "नगर निगम प्रतिक्रिया इकाई",
      "home_title": "civicpulse.",
      "home_title_accent": "जन संवाद",
      "home_description": "नागरिकों को अपनी स्थानीय नगर निगम (Municipal Corporation) में नागरिक शिकायतों (Jan Shikayat) को दर्ज करने के लिए सशक्त बनाना।",
      "home_cta_report": "शिकायत दर्ज करें",
      "home_cta_feed": "समुदाय फीड देखें",
      
      // Signup
      "signup_title": "नागरिक पंजीकरण",
      "signup_subtitle": "नागरिक प्रतिक्रिया नेटवर्क से जुड़ें",
      "signup_username": "उपयोगकर्ता नाम",
      "signup_email": "ईमेल पता",
      "signup_phone": "मोबाइल नंबर",
      "signup_password": "पासवर्ड",
      "signup_state": "राज्य / केंद्र शासित प्रदेश",
      "signup_state_placeholder": "अपना राज्य चुनें",
      "signup_area": "स्थानीय क्षेत्र / जिला",
      "signup_role": "सिस्टम भूमिका",
      "signup_btn": "पंजीकरण करें",
      "signup_loading": "पंजीकरण हो रहा है...",
      
      // Report
      "report_title": "शिकायत दर्ज करें",
      "report_subtitle": "नगर निगम की समीक्षा के लिए शहरी समस्याओं का दस्तावेजीकरण करें",
      "report_form_title": "समस्या का शीर्षक",
      "report_form_desc": "विस्तृत विवरण",
      "report_form_category": "वर्गीकरण श्रेणी",
      "report_cat_roads": "सड़क और राजमार्ग (Sadak)",
      "report_cat_sanitation": "स्वच्छता (Swachhata)",
      "report_cat_water": "जल आपूर्ति (Jal)",
      "report_cat_electricity": "बिजली (Vidyut)",
      "report_cat_other": "अन्य शिकायत",
      "report_evidence": "प्रमाण अपलोड",
      "report_gps": "स्थान निर्देशांक (वैकल्पिक)",
      "report_btn_detect": "स्थान का पता लगाएं",
      "report_btn_detecting": "पता लगा रहे हैं...",
      "report_gps_hint": "सटीक मैपिंग के लिए निर्देशांक कैप्चर करें",
      "report_btn_submit": "शिकायत जमा करें",
      "report_btn_submitting": "जमा हो रहा है...",
      "report_err_gps": "आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता है।",
      "report_err_gps_fail": "आपका स्थान प्राप्त करने में असमर्थ। कृपया सुनिश्चित करें कि स्थान सेवाएँ सक्षम हैं।"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
