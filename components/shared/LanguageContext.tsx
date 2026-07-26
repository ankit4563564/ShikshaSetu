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
    
    // Today screen
    'today.title': 'Today',
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

    // Today screen
    'today.title': 'आज',
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

    // Today screen
    'today.title': 'आज',
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
