import React, { createContext, useState, useContext, useEffect } from 'react';

const ContentContext = createContext();


const defaultContent = {
  // Header
  header: {
    logoText: 'BRPL',
    logoSubText: 'Beyond Reach Premier League',
    menuItems: [
      { id: 1, label: 'HOME', link: '/' },
      { id: 2, label: 'ABOUT', link: '/about' },
      { id: 3, label: 'TOURNAMENT', link: '/tournament' },
      { id: 4, label: 'GALLERY', link: '/gallery' },
      { id: 5, label: 'CONTACT', link: '/contact' },
    ],
    // registerButtonText: 'REGISTER NOW',
    loginButtonText: 'LOGIN'
  },

  // Slider
  slider: [
    {
      id: 1,
      image: '/slider1.jpg',
      title: '#STREET2STADIUM',
      subtitle: "INDIA'S BIGGEST GRASSROOTS CRICKET CARNIVAL",
      description: 'A CELEBRATION OF CHAMPIONS'
    },
    {
      id: 2,
      image: '/slider2.jpg',
      title: '#STREET2STADIUM',
      subtitle: "INDIA'S BIGGEST GRASSROOTS CRICKET CARNIVAL",
      description: 'A CELEBRATION OF CHAMPIONS'
    }
  ],

  // Registration Form
  registration: [{
    mainHeading: "INDIA'S BIGGEST",
    subHeading1: "T10 TENNIS",
    subHeading2: "CRICKET TOURNAMENT",
    tagline1: "Your Gully Cricket Days ARE OVER",
    tagline2: "NOW PLAY IN REAL STADIUMS",
    registrationFee: "₹999"
  }],

  // Points
  points: [
    {
      id: 1,
      title: 'Professional Stadium Experience',
      description: 'Lights, Cameras, Roaring crowds. Real cricket.',
      icon: '🏟️'
    },
    {
      id: 2,
      title: '₹3 Crore Prize Pool',
      description: 'Life-changing money for the winning team',
      icon: '💰'
    },
    {
      id: 3,
      title: 'Fair Selection Process',
      description: 'Your skill is your ticket. Nothing else matters.',
      icon: '⚖️'
    },
    {
      id: 4,
      title: 'Professional Training Exposure',
      description: 'Learn from the best during the tournament',
      icon: '🎓'
    },
    {
      id: 5,
      title: 'National TV Coverage',
      description: 'Your family watches you on prime time',
      icon: '📺'
    },
    {
      id: 6,
      title: 'Talent Scout Access',
      description: 'National and state team selectors present',
      icon: '🔍'
    },
    {
      id: 7,
      title: 'Career Launch Platform',
      description: 'Players get spotted for bigger leagues',
      icon: '🚀'
    },
    {
      id: 8,
      title: 'Age-Inclusive Categories',
      description: "Whether you're 18 or 35, you compete",
      icon: '👥'
    }
  ],

  // Sponsors
  sponsors: [
    { id: 1, category: 'OFFICIAL ENERGY DRINK PARTNER', name: 'Predator', logo: '🐯' },
    { id: 2, category: 'OFFICIAL OTT PARTNER', name: 'JioHotstar', logo: '📺' },
    { id: 3, category: 'OFFICIAL BALL PARTNER', name: 'SG Ball', logo: '⚫' },
    { id: 4, category: 'OFFICIAL ENTERTAINMENT PARTNERS', name: 'Mirchi & Gaana', logo: '🎵' },
    { id: 5, category: 'OFFICIAL TICKETING PARTNER', name: 'BookMyShow', logo: '🎫' },
    { id: 6, category: 'OFFICIAL BROADCAST PARTNER', name: 'Star Sports', logo: '⭐' },
    { id: 7, category: 'OFFICIAL SHOE & APPAREL PARTNER', name: 'Tenx', logo: '👟' },
    { id: 8, category: 'OFFICIAL RESORT PARTNER', name: 'Resort', logo: '🏨' },
  ],

  // FAQ
  faqs: [
    {
      id: 1,
      question: 'WHO CAN PARTICIPATE IN BRPL?',
      answer: 'Anyone with a passion for cricket can participate in BRPL! We welcome players of all age groups (18+), skill levels, and backgrounds. Whether you are a professional or a grassroots player, you can register and compete in age-inclusive categories designed for everyone.'
    },
    {
      id: 2,
      question: 'DO I NEED TO TRAVEL FOR TRIALS OR AUDITIONS?',
      answer: 'Yes, trials and auditions are conducted at various centers across the country. We try to have events in multiple cities to minimize travel distances. However, the exact locations depend on the number of registrations and logistics. All details about trial locations will be provided after registration.'
    },
    {
      id: 3,
      question: 'HOW DOES THE SELECTION PROCESS WORK?',
      answer: 'The selection process is purely skill-based and transparent. Players participate in trials/auditions where their performance is evaluated by professional scouts and selectors. The best performers are selected for auction, where they get drafted into teams based on their performance metrics.'
    },
    {
      id: 4,
      question: 'WHAT MAKES BRPL DIFFERENT FROM OTHER CRICKET LEAGUES?',
      answer: 'BRPL stands out with its grassroots approach, professional stadium experience, and age-inclusive categories. We provide fair selection process, national TV coverage, ₹3 crore prize pool, talent scout access, and career launch opportunities. It\'s truly a celebration of champions!'
    },
    {
      id: 5,
      question: 'WHAT IS THE REGISTRATION PROCESS?',
      answer: 'Registration is simple and quick. Visit our website or app, fill in your details, select your role (Batsman, Bowler, All-rounder, Wicket Keeper), complete the payment, and you\'re registered! You\'ll receive all trial details and schedules via email and SMS.'
    },
    {
      id: 6,
      question: 'WHAT IS THE REGISTRATION FEE?',
      answer: 'The registration fee is ₹999. This fee helps us organize professional trials, manage logistics, and ensure high-quality events. The fee is a one-time payment and includes access to all trials and auditions.'
    }
  ],

  // App Download
  appDownload: {
    title: 'APP DOWNLOAD',
    description: 'Stay updated with the latest scores on the go! Access exclusive content, including match highlights, press conferences, and recaps, all at your fingertips by downloading the official app.',
    subDescription: 'Available now on both the App Store and Google Play Store.',
    googlePlayLink: 'https://play.google.com/store/apps/details?id=com.crickbroapp&hl=en_IN',
    appStoreLink: 'https://apps.apple.com/in/app/crickbro-cricket-scoring-app/id6740860359'
  }
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(() => {
  try {
    const saved = localStorage.getItem('landing-page-content');
    return saved ? JSON.parse(saved) : defaultContent;
  } catch (error) {
    console.error('Invalid JSON in localStorage, resetting...', error);
    localStorage.removeItem('landing-page-content');
    return defaultContent;
  }
});

  useEffect(() => {
    localStorage.setItem('landing-page-content', JSON.stringify(content));
  }, [content]);

  const updateContent = (section, data) => {
    setContent(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const updateItemInArray = (section, id, updates) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const addItemToArray = (section, newItem) => {
    setContent(prev => ({
      ...prev,
      [section]: [...prev[section], { ...newItem, id: Date.now() }]
    }));
  };

  const removeItemFromArray = (section, id) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const resetToDefault = () => {
    setContent(defaultContent);
  };

  return (
    <ContentContext.Provider value={{ 
      content, 
      updateContent, 
      updateItemInArray,
      addItemToArray,
      removeItemFromArray,
      resetToDefault 
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};