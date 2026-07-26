'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Headers
    'nav.home': 'Home',
    'nav.homework': 'Homework',
    'nav.attendance': 'Attendance',
    'nav.bus': 'Bus',
    'nav.calendar': 'Calendar',
    'nav.messages': 'Messages',
    'greeting.morning': 'Good Morning',
    'greeting.safe_status': 'reached school safely & is on track today.',
    'hero.subtext': 'Everything is on track today · 100% Safety Synced',
    'hero.gate': '📍 Campus Gate #2',
    'hero.bus': '🚌 Bus #4 (Ramesh Kumar)',
    'hero.score': 'Safety Score: 98%',
    
    // Current Status
    'status.current_title': 'Current Status',
    'status.live_telemetry': 'Live Telemetry',
    'status.math_quiz': 'Classroom 8A · Math Quiz Completed',
    'status.math_desc': 'Scored 92% in Algebra Quiz · Participating actively in class',
    'status.track_bus': 'Track Bus Live →',

    // Today's Journey Timeline
    'today.title': 'Today',
    'today.journey': "Today's Journey",
    'today.journey_sub': "Chronological timeline of Aarav's day",
    'today.live_timeline': 'Live Timeline',
    'timeline.bus_boarded': 'Boarded School Bus #4',
    'timeline.bus_desc': 'Picked up at Saket Stop #3. Driver Ramesh Kumar confirmed seating.',
    'timeline.school_reached': 'Reached School Campus',
    'timeline.school_desc': 'Security Gate #2 dynamic QR scan verified with 100% ID photo match.',
    'timeline.quiz': 'Completed Mathematics Quiz',
    'timeline.quiz_desc': 'Scored 92% in Algebra Quiz. Classroom participation was excellent.',
    'timeline.hw': 'Homework Assigned',
    'timeline.hw_desc': 'Science Chapter 4 Exercise (Due tomorrow by 8:00 AM).',
    'timeline.why': "Why you're seeing this",

    // Needs Attention & Actions
    'attention.title': 'Needs Your Attention',
    'attention.items': 'Action Items',
    'attention.all_caught_up': "You're all caught up today. Zero pending alerts.",
    'attention.reply': 'Reply →',
    'attention.manage': 'Manage',
    'action.gate_pass': '🎫 Request Gate Pass',
    'action.morning_note': '☀️ Morning Heads-up',
    'action.message_teacher': '💬 Message Teacher',

    // Today screen old keys
    'today.morning.heads_up': 'Morning Heads-up',
    'today.homework.due': 'Homework Due',
    'today.attendance': 'Attendance',
    'today.gate.pass': 'Gate Pickup Pass',
    'today.request.pass': 'Request Gate Pass',
    'today.cancel.request': 'Cancel Request',
    'today.pass.history': 'Pass History',
    'today.verified_safe': 'Verified Safe (98%)',
    'today.timeline_title': 'Chronological Timeline',
    'today.ask_schoolgpt': 'Ask SchoolGPT: "Was my child safe today?"',
    'today.direct_message': 'Direct Message Teacher',

    // Status
    'status.present': 'Present',
    'status.absent': 'Absent',
    'status.late': 'Late',
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.used': 'Used',
    'status.expired': 'Expired',
    'status.cancelled': 'Cancelled',
    
    // Gate pass
    'gate.pass.reason': 'Reason',
    'gate.pass.pickup.time': 'Pickup Time',
    'gate.pass.verification.code': 'Verification Code',
    'gate.pass.secondary.qr': 'Secondary QR Scan',
    'gate.pass.no.active': 'No active pickup pass requested for today.',
    
    // Chat
    'chat.send': 'Send',
    'chat.placeholder': 'Type message to teacher...',
    'chat.no.messages': 'No messages yet. Send a message to start the conversation.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.submit': 'Submit',
  },
  hi: {
    // Navigation & Headers
    'nav.home': 'होम',
    'nav.homework': 'होमवर्क',
    'nav.attendance': 'उपस्थिति',
    'nav.bus': 'बस',
    'nav.calendar': 'कैलेंडर',
    'nav.messages': 'संदेश',
    'greeting.morning': 'शुभ प्रभात',
    'greeting.safe_status': 'आज सुरक्षित रूप से स्कूल पहुंचे और सही ट्रैक पर हैं।',
    'hero.subtext': 'आज सब कुछ सही ट्रैक पर है · 100% सुरक्षा सिंक',
    'hero.gate': '📍 कैंपस गेट #2',
    'hero.bus': '🚌 बस #4 (रमेश कुमार)',
    'hero.score': 'सुरक्षा स्कोर: 98%',

    // Current Status
    'status.current_title': 'वर्तमान स्थिति',
    'status.live_telemetry': 'लाइव टेलीमेट्री',
    'status.math_quiz': 'कक्षा 8A · गणित प्रश्नोत्तरी पूर्ण',
    'status.math_desc': 'बीजगणित प्रश्नोत्तरी में 92% अंक प्राप्त किए · कक्षा में सक्रिय भागीदारी',
    'status.track_bus': 'बस लाइव ट्रैक करें →',

    // Today's Journey Timeline
    'today.title': 'आज',
    'today.journey': 'आज की यात्रा',
    'today.journey_sub': 'आरव के दिन का समयक्रम घटनाक्रम',
    'today.live_timeline': 'लाइव समयरेखा',
    'timeline.bus_boarded': 'स्कूल बस #4 में सवार हुए',
    'timeline.bus_desc': 'साकेत स्टॉप #3 पर पिकअप। ड्राइवर रमेश कुमार ने सीट की पुष्टि की।',
    'timeline.school_reached': 'स्कूल परिसर पहुंचे',
    'timeline.school_desc': 'सुरक्षा गेट #2 डायनामिक क्यूआर स्कैन 100% आईडी फोटो मैच के साथ सत्यापित।',
    'timeline.quiz': 'गणित प्रश्नोत्तरी पूरी की',
    'timeline.quiz_desc': 'बीजगणित प्रश्नोत्तरी में 92% अंक। कक्षा में भागीदारी उत्कृष्ट थी।',
    'timeline.hw': 'होमवर्क आवंटित',
    'timeline.hw_desc': 'विज्ञान अध्याय 4 अभ्यास (कल सुबह 8:00 बजे तक देय)।',
    'timeline.why': 'आप यह क्यों देख रहे हैं',

    // Needs Attention & Actions
    'attention.title': 'आपके ध्यान की आवश्यकता है',
    'attention.items': 'कार्य मदें',
    'attention.all_caught_up': 'आज आप पूरी तरह अपडेट हैं। शून्य लंबित अलर्ट।',
    'attention.reply': 'उत्तर दें →',
    'attention.manage': 'प्रबंधित करें',
    'action.gate_pass': '🎫 गेट पास का अनुरोध करें',
    'action.morning_note': '☀️ सुबह की जानकारी',
    'action.message_teacher': '💬 शिक्षक को संदेश भेजें',

    // Today screen old keys
    'today.morning.heads_up': 'सुबह की जानकारी',
    'today.homework.due': 'होमवर्क देय',
    'today.attendance': 'उपस्थिति',
    'today.gate.pass': 'गेट पिकअप पास',
    'today.request.pass': 'गेट पास का अनुरोध करें',
    'today.cancel.request': 'अनुरोध रद्द करें',
    'today.pass.history': 'पास इतिहास',
    'today.verified_safe': 'सत्यापित सुरक्षित (98%)',
    'today.timeline_title': 'समयक्रम घटनाक्रम',
    'today.ask_schoolgpt': 'SchoolGPT से पूछें: "क्या मेरा बच्चा आज सुरक्षित था?"',
    'today.direct_message': 'शिक्षक को सीधा संदेश भेजें',

    // Status
    'status.present': 'उपस्थित',
    'status.absent': 'अनुपस्थित',
    'status.late': 'देर से',
    'status.pending': 'लंबित',
    'status.approved': 'स्वीकृत',
    'status.rejected': 'अस्वीकृत',
    'status.used': 'उपयोग किया गया',
    'status.expired': 'समाप्त',
    'status.cancelled': 'रद्द',
    
    // Gate pass
    'gate.pass.reason': 'कारण',
    'gate.pass.pickup.time': 'पिकअप समय',
    'gate.pass.verification.code': 'सत्यापन कोड',
    'gate.pass.secondary.qr': 'द्वितीयक QR स्कैन',
    'gate.pass.no.active': 'आज के लिए कोई सक्रिय पिकअप पास अनुरोधित नहीं है।',
    
    // Chat
    'chat.send': 'भेजें',
    'chat.placeholder': 'शिक्षक को संदेश टाइप करें...',
    'chat.no.messages': 'अभी तक कोई संदेश नहीं। बातचीत शुरू करने के लिए एक संदेश भेजें।',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.submit': 'जमा करें',
  },
  mr: {
    // Navigation & Headers
    'nav.home': 'होम',
    'nav.homework': 'गृहपाठ',
    'nav.attendance': 'उपस्थिती',
    'nav.bus': 'बस',
    'nav.calendar': 'कैलेंडर',
    'nav.messages': 'संदेश',
    'greeting.morning': 'शुभ सकाळ',
    'greeting.safe_status': 'आज सुरक्षितपणे शाळेत पोहोचले आणि योग्य मार्गावर आहेत.',
    'hero.subtext': 'आज सर्व काही योग्य मार्गावर आहे · 100% सुरक्षा सिंक',
    'hero.gate': '📍 कॅम्पस गेट #2',
    'hero.bus': '🚌 बस #4 (रमेश कुमार)',
    'hero.score': 'सुरक्षा गुण: 98%',

    // Current Status
    'status.current_title': 'सध्याची स्थिती',
    'status.live_telemetry': 'लाइव्ह टेलीमेट्री',
    'status.math_quiz': 'वर्ग 8A · गणित क्विझ पूर्ण',
    'status.math_desc': 'बीजगणित क्विझमध्ये 92% गुण मिळवले · वर्गात सक्रिय सहभाग',
    'status.track_bus': 'बस लाइव्ह ट्रॅक करा →',

    // Today's Journey Timeline
    'today.title': 'आज',
    'today.journey': 'आजचा प्रवास',
    'today.journey_sub': 'आरवच्या दिवसाची वेळरेषा',
    'today.live_timeline': 'लाइव्ह वेळरेषा',
    'timeline.bus_boarded': 'शाळा बस #4 मध्ये बसले',
    'timeline.bus_desc': 'साकेत थांबा #3 वर पिकअप. ड्रायव्हर रमेश कुमार यांनी जागेची पुष्टी केली.',
    'timeline.school_reached': 'शाळा कॅम्पसमध्ये पोहोचले',
    'timeline.school_desc': 'सुरक्षा गेट #2 डायनॅमिक QR स्कॅन 100% आयडी फोटो जुळणीसह सत्यापित.',
    'timeline.quiz': 'गणित क्विझ पूर्ण केली',
    'timeline.quiz_desc': 'बीजगणित क्विझमध्ये 92% गुण. वर्गातील सहभाग उत्कृष्ट होता.',
    'timeline.hw': 'गृहपाठ देण्यात आला',
    'timeline.hw_desc': 'विज्ञान अध्याय 4 सराव (उद्या सकाळी 8:00 पर्यंत देय).',
    'timeline.why': 'तुम्ही हे का पाहत आहात',

    // Needs Attention & Actions
    'attention.title': 'तुमच्या लक्ष्याची गरज आहे',
    'attention.items': 'कृती वस्तू',
    'attention.all_caught_up': 'आज तुम्ही पूर्णपणे अद्ययावत आहात. शून्य प्रलंबित सूचना.',
    'attention.reply': 'उत्तर द्या →',
    'attention.manage': 'व्यवस्थापित करा',
    'action.gate_pass': '🎫 गेट पासची विनंती करा',
    'action.morning_note': '☀️ सकाळची माहिती',
    'action.message_teacher': '💬 शिक्षकाला संदेश पाठवा',

    // Today screen old keys
    'today.morning.heads_up': 'सकाळची माहिती',
    'today.homework.due': 'गृहपाठ देय',
    'today.attendance': 'उपस्थिती',
    'today.gate.pass': 'गेट पिकअप पास',
    'today.request.pass': 'गेट पास विनंती करा',
    'today.cancel.request': 'विनंती रद्द करा',
    'today.pass.history': 'पास इतिहास',
    'today.verified_safe': 'सत्यापित सुरक्षित (98%)',
    'today.timeline_title': 'वेळापत्रक घटनाक्रम',
    'today.ask_schoolgpt': 'SchoolGPT ला विचार: "माझे मूल आज सुरक्षित होते का?"',
    'today.direct_message': 'शिक्षकाला थेट संदेश पाठवा',

    // Status
    'status.present': 'उपस्थित',
    'status.absent': 'अनुपस्थित',
    'status.late': 'उशीर',
    'status.pending': 'प्रलंबित',
    'status.approved': 'मंजूर',
    'status.rejected': 'नाकारले',
    'status.used': 'वापरले',
    'status.expired': 'कालबाह्य',
    'status.cancelled': 'रद्द',
    
    // Gate pass
    'gate.pass.reason': 'कारण',
    'gate.pass.pickup.time': 'पिकअप वेळ',
    'gate.pass.verification.code': 'सत्यापन कोड',
    'gate.pass.secondary.qr': 'द्वितीयक QR स्कॅन',
    'gate.pass.no.active': 'आज साठी कोणतेही सक्रिय पिकअप पास विनंती केलेले नाहीत.',
    
    // Chat
    'chat.send': 'पाठवा',
    'chat.placeholder': 'शिक्षकाला संदेश टाइप करा...',
    'chat.no.messages': 'अजून कोणतेही संदेश नाहीत. चर्चा सुरू करण्यासाठी एक संदेश पाठवा.',
    
    // Common
    'common.loading': 'लोड होत आहे...',
    'common.error': 'त्रुटी',
    'common.success': 'यशस्वी',
    'common.cancel': 'रद्द करा',
    'common.confirm': 'पुष्टी करा',
    'common.submit': 'सादर करा',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Sync with localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shikshasetu-lang') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        setLanguageState(saved);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('shikshasetu-lang', lang);
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
