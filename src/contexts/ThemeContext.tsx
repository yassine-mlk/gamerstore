import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getSettings, updateSettings, uploadLogo } from '@/services/supabase/parametres';
import { SupabaseUser } from '@/lib/supabase';

type Theme = 'light' | 'dark';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  logo: string;
  businessName: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setLogo: (logo: string | File) => Promise<void>;
  setBusinessName: (name: string) => void;
  isLoading: boolean;
  logoLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [logo, setLogoState] = useState<string>('/logo.png');
  const [logoLoading, setLogoLoading] = useState<boolean>(false);
  const [businessName, setBusinessNameState] = useState<string>('BizzMax');
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Surveiller les changements d'authentification
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user || null);
    });

    // Vérifier l'utilisateur actuel au démarrage
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Charger les paramètres depuis Supabase lorsque l'utilisateur change
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      if (currentUser) {
        try {
          const settings = await getSettings(currentUser.id);
          if (settings) {
            setThemeState(settings.theme);
            setAccentColorState(settings.accent_color);
            setBusinessNameState(settings.business_name);
            if (settings.logo_url) {
              // Précharger l'image avant de l'afficher
              const img = new Image();
              img.onload = () => {
                setLogoState(settings.logo_url!);
                setLogoLoading(false);
              };
              img.onerror = () => {
                setLogoState('/logo.png');
                setLogoLoading(false);
              };
              setLogoLoading(true);
              img.src = settings.logo_url;
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
          // Utiliser les valeurs par défaut en cas d'erreur
        }
      } else {
        // Si non authentifié, utiliser les valeurs par défaut ou localStorage
        const savedTheme = localStorage.getItem('theme');
        const savedColor = localStorage.getItem('accentColor');
        const savedLogo = localStorage.getItem('logo');
        const savedName = localStorage.getItem('businessName');
        
        setThemeState((savedTheme as Theme) || 'light');
        setAccentColorState((savedColor as AccentColor) || 'blue');
        
        if (savedLogo) {
          const img = new Image();
          img.onload = () => {
            setLogoState(savedLogo);
            setLogoLoading(false);
          };
          img.onerror = () => {
            setLogoState('/logo.png');
            setLogoLoading(false);
          };
          setLogoLoading(true);
          img.src = savedLogo;
        } else {
          setLogoState('/logo.png');
        }
        
        setBusinessNameState(savedName || 'BizzMax');
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, [currentUser]);

  // Appliquer les changements de thème et d'accent
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-accent', accentColor);
    
    // Sauvegarder dans localStorage pour les utilisateurs non authentifiés
    if (!currentUser) {
      localStorage.setItem('theme', theme);
      localStorage.setItem('accentColor', accentColor);
      localStorage.setItem('logo', logo);
      localStorage.setItem('businessName', businessName);
    }
  }, [theme, accentColor, logo, businessName, currentUser]);

  // Fonctions pour mettre à jour les paramètres
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (currentUser) {
      await updateSettings(currentUser.id, { theme: newTheme });
    }
  };

  const setAccentColor = async (newColor: AccentColor) => {
    setAccentColorState(newColor);
    
    if (currentUser) {
      await updateSettings(currentUser.id, { accent_color: newColor });
    }
  };

  const setBusinessName = async (newName: string) => {
    setBusinessNameState(newName);
    
    if (currentUser) {
      await updateSettings(currentUser.id, { business_name: newName });
    }
  };

  const setLogo = async (newLogo: string | File) => {
    setLogoLoading(true);
    
    if (typeof newLogo === 'string') {
      // Si c'est une URL de chaîne
      const img = new Image();
      img.onload = () => {
        setLogoState(newLogo);
        setLogoLoading(false);
        
        if (currentUser) {
          updateSettings(currentUser.id, { logo_url: newLogo });
        } else {
          localStorage.setItem('logo', newLogo);
        }
      };
      img.onerror = () => {
        setLogoState('/logo.png');
        setLogoLoading(false);
      };
      img.src = newLogo;
    } else if (newLogo instanceof File) {
      // Si c'est un fichier, téléverser dans Supabase Storage
      if (currentUser) {
        const logoUrl = await uploadLogo(currentUser.id, newLogo);
        if (logoUrl) {
          const img = new Image();
          img.onload = () => {
            setLogoState(logoUrl);
            setLogoLoading(false);
          };
          img.onerror = () => {
            setLogoState('/logo.png');
            setLogoLoading(false);
          };
          img.src = logoUrl;
        } else {
          setLogoLoading(false);
        }
      } else {
        // Pour les utilisateurs non authentifiés, créer une URL temporaire
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            setLogoState(result);
            setLogoLoading(false);
            localStorage.setItem('logo', result);
          };
          img.onerror = () => {
            setLogoState('/logo.png');
            setLogoLoading(false);
          };
          img.src = result;
        };
        reader.readAsDataURL(newLogo);
      }
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    accentColor,
    logo,
    businessName,
    setTheme,
    setAccentColor,
    setLogo,
    setBusinessName,
    isLoading,
    logoLoading
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
