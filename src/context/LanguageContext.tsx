import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// הרחבת השפות הנתמכות
export type SupportedLanguage = 'he' | 'en' | 'es' | 'ru' | 'zh' | 'ar';

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

// יצירת קונטקסט לניהול השפה
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// הוק לשימוש בקונטקסט השפה
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// ספק השפה
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // זיהוי שפת הדפדפן כברירת מחדל
  const getBrowserLanguage = (): SupportedLanguage => {
    const browserLang = navigator.language.split('-')[0];
    // מיפוי שפות הדפדפן לשפות הנתמכות
    const langMap: { [key: string]: SupportedLanguage } = {
      he: 'he',
      en: 'en',
      es: 'es',
      ru: 'ru',
      zh: 'zh',
      ar: 'ar'
    };
    return langMap[browserLang] || 'he'; // ברירת מחדל לעברית
  };

  // שמירת השפה בלוקל סטורג'
  const getSavedLanguage = (): SupportedLanguage => {
    const savedLang = localStorage.getItem('language') as SupportedLanguage;
    return savedLang || getBrowserLanguage();
  };

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getSavedLanguage());

  // פונקציה לשינוי השפה
  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
    // הגדרת כיוון הטקסט בהתאם לשפה
    document.documentElement.dir = ['he', 'ar'].includes(lang) ? 'rtl' : 'ltr';
  };

  // הגדרת כיוון טקסט בטעינה ראשונית
  useEffect(() => {
    document.documentElement.dir = ['he', 'ar'].includes(currentLanguage) ? 'rtl' : 'ltr';
  }, []);

  // פונקציה לקבלת טקסט לפי מפתח מתרגום
  const t = (key: string): string => {
    // אם המפתח לא קיים, החזר את המפתח עצמו
    if (!translations[currentLanguage][key]) {
      console.warn(`Missing translation for key: ${key} in language: ${currentLanguage}`);
      return translations['en'][key] || key; // fallback לאנגלית אם קיים, אחרת למפתח עצמו
    }
    return translations[currentLanguage][key];
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// תרגומים
const translations: Record<SupportedLanguage, Record<string, string>> = {
  he: {
    // כללי
    'settings': 'הגדרות',
    'gameSelection': 'בחירת משחקים',
    'gameSelectionDesc': 'הפעל או בטל משחקים למפגש המשחק שלך. השינויים נשמרים אוטומטית.',
    'language': 'שפה',
    'languageSettings': 'הגדרות שפה',
    'seconds': 'שניות',
    'backToHome': 'חזרה לדף הבית',
    'startGame': 'התחל משחק',
    'player1': 'שחקן 1',
    'player2': 'שחקן 2',
    'tapWhen': 'לחץ כאשר',
    'timeUp': 'נגמר הזמן!',
    'noOnePressed': 'אף אחד לא לחץ בזמן.',
    'playerWins': 'שחקן {player} ניצח!',
    'otherPlayerWins': 'השחקן השני ניצח!',
    'draw': 'תיקו!',
    'playAgain': 'שחק שוב',
    'continueText': 'המשך',
    'gamesSelected': 'משחקים נבחרו',
    'noGamesSelected': 'לא נבחרו משחקים. בחר משחקים בהגדרות.',
    'languageSupport': 'המשחק תומך בעברית ואנגלית',
    
    // משחק מצא את הכלב
    'findDog': 'מצא את הכלב',
    'findDogDesc': 'כלב יופיע בין הפנדות. היה הראשון ללחוץ עליו!',
    'foundDogFirst': 'מצאת את הכלב ראשון!',
    'tappedTooEarly': 'לחצת מוקדם מדי! היריב מנצח!',
    'noOneDog': 'נגמר הזמן! אף אחד לא מצא את הכלב.',
    
    // משחק מצא את הפרצוף העצוב
    'findSad': 'מצא את הפרצוף העצוב',
    'findSadDesc': 'פרצוף עצוב יופיע בין הפרצופים השמחים. היה הראשון ללחוץ עליו!',
    'foundSadFirst': 'מצאת את הפרצוף העצוב ראשון!',
    'noOneSad': 'נגמר הזמן! אף אחד לא מצא את הפרצוף העצוב.',
    
    // משחק טפיחות מהירות
    'tapFast': 'לחיצות מהירות',
    'tapFastDesc': 'לחץ כמה שיותר מהר למשך 5 שניות! השחקן עם הכי הרבה לחיצות מנצח.',
    'tapsVs': '{player1} vs {player2} לחיצות',
    'tapsTie': 'תיקו! {taps} לחיצות לכל אחד',
    'taps': 'לחיצות',
    
    // משחק מספרים מתחלפים
    'changingNumbers': 'מספרים מתחלפים',
    'changingNumbersDesc': 'לחץ כאשר המספר גדול מ-50!',
    'correctNumber': 'לחצת ראשון על המספר הנכון!',
    'wrongNumber': 'היריב מנצח! לחצת על מספר קטן מדי!',
    'noOneNumber': 'נגמר הזמן! אף אחד לא לחץ בזמן.',
    'tapNow': 'לחץ עכשיו!',
    'wait': 'המתן...',
    
    // משחק צבע נכון
    'correctColor': 'צבע נכון',
    'correctColorDesc': 'לחץ כאשר שם הצבע מתאים לצבע עצמו!',
    'colorMatchSuccess': 'לחצת ראשון כשהצבע התאים לשם!',
    'colorMatchFail': 'לחצת כשהצבע לא תאם לשם! היריב מנצח!',
    'colorMatchTimeout': 'נגמר הזמן! אף אחד לא לחץ בזמן.',
    'tapWhenMatch': 'לחץ כשהשם והצבע תואמים!',
    
    // שמות צבעים
    'red': 'אדום',
    'blue': 'כחול',
    'green': 'ירוק',
    'yellow': 'צהוב',
    'purple': 'סגול',
    
    // משחק פלוס מינוס
    'plusMinus': 'פלוס מינוס',
    'plusMinusDesc': 'לחץ כאשר יש יותר סימני פלוס מאשר סימני מינוס!',
    'plusMinusSuccess': 'לחצת ראשון כשהיו יותר סימני פלוס!',
    'plusMinusFail': 'לחצת מוקדם מדי! היריב מנצח!',
    'plusMinusTimeout': 'נגמר הזמן! אף אחד לא לחץ בזמן.',
    
    // הגדרות
    'settingsSaved': 'ההגדרות נשמרו אוטומטית',
    'gameDuration': 'זמן משחק עודכן ל-{seconds} שניות',
    'hebrew': 'עברית',
    'english': 'אנגלית',
    'selectLanguage': 'בחר שפה',
    'selectLanguageDesc': 'בחר את שפת הממשק של המשחק',
    
    // סיום משחק
    'gameSessionComplete': 'סבב המשחקים הסתיים!',
  },
  en: {
    // General
    'settings': 'Settings',
    'gameSelection': 'Game Selection',
    'gameSelectionDesc': 'Enable or disable games for your gaming sessions. Changes are saved automatically.',
    'language': 'Language',
    'languageSettings': 'Language Settings',
    'seconds': 'seconds',
    'backToHome': 'Back to Home',
    'startGame': 'Start Game',
    'player1': 'Player 1',
    'player2': 'Player 2',
    'tapWhen': 'Tap when',
    'timeUp': 'Time\'s up!',
    'noOnePressed': 'No one pressed in time.',
    'playerWins': 'Player {player} Wins!',
    'otherPlayerWins': 'The other player wins!',
    'draw': 'It\'s a Draw!',
    'playAgain': 'Play Again',
    'continueText': 'Continue',
    'gamesSelected': 'games selected',
    'noGamesSelected': 'No games selected. Choose games in settings.',
    'languageSupport': 'Game supports English and Hebrew',
    
    // Find Dog game
    'findDog': 'Find the Dog',
    'findDogDesc': 'A dog will appear among the pandas. Be the first to tap it!',
    'foundDogFirst': 'Found the dog first!',
    'tappedTooEarly': 'You tapped too early! Your opponent wins!',
    'noOneDog': 'Time\'s up! No one found the dog.',
    'dogAppeared': 'Dog has appeared', // תרגום חדש למפתח החסר
    
    // Find Sad Face game
    'findSad': 'Find the Sad Face',
    'findSadDesc': 'A sad face will appear among the happy ones. Be the first to tap it!',
    'foundSadFirst': 'Found the sad face first!',
    'noOneSad': 'Time\'s up! No one found the sad face.',
    'sadAppeared': 'Sad face has appeared', // תרגום חדש למפתח החסר
    
    // Tap Fast game
    'tapFast': 'Tap Fast',
    'tapFastDesc': 'Tap as fast as you can for 5 seconds! The player with the most taps wins.',
    'tapsVs': '{player1} vs {player2} taps',
    'tapsTie': 'It\'s a tie! {taps} taps each',
    'taps': 'Taps',
    
    // Changing Numbers game
    'changingNumbers': 'Changing Numbers',
    'changingNumbersDesc': 'Tap when the number is greater than 50!',
    'correctNumber': 'Tapped first on the correct number!',
    'wrongNumber': 'Your opponent wins! You tapped on a number that was too small!',
    'noOneNumber': 'Time\'s up! No one tapped in time.',
    'tapNow': 'TAP NOW!',
    'wait': 'WAIT...',
    
    // Correct Color game
    'correctColor': 'Correct Color',
    'correctColorDesc': 'Tap when the color name matches its actual color!',
    'colorMatchSuccess': 'Tapped first when the color matched its name!',
    'colorMatchFail': 'You tapped when the color didn\'t match! Your opponent wins!',
    'colorMatchTimeout': 'Time\'s up! No one tapped in time.',
    'tapWhenMatch': 'Tap when the name and color match!',
    
    // Color names
    'red': 'Red',
    'blue': 'Blue',
    'green': 'Green',
    'yellow': 'Yellow',
    'purple': 'Purple',
    
    // Plus Minus game
    'plusMinus': 'Plus Minus',
    'plusMinusDesc': 'Tap when there are more plus signs than minus signs!',
    'plusMinusSuccess': 'Tapped first when there were more plus signs!',
    'plusMinusFail': 'You tapped too early! Your opponent wins!',
    'plusMinusTimeout': 'Time\'s up! No one tapped in time.',
    'plusesAppeared': 'Plus signs have appeared', // תרגום חדש למפתח החסר
    'foundMorePluses': 'You found more plus signs!', // תרגום חדש למפתח החסר
    'noOneFoundPluses': 'No one found the plus signs in time', // תרגום חדש למפתח החסר
    
    // Special items
    'specialItemAppeared': 'Special item has appeared', // תרגום חדש למפתח החסר
  },
  es: {
    'settings': 'Configuración',
    'gameSelection': 'Selección de juegos',
    'gameSelectionDesc': 'Activa o desactiva juegos para tu sesión. Los cambios se guardan automáticamente.',
    'language': 'Idioma',
    'languageSettings': 'Configuración de idioma',
    'seconds': 'segundos',
    'backToHome': 'Volver al inicio',
    'startGame': 'Comenzar juego',
    'player1': 'Jugador 1',
    'player2': 'Jugador 2',
    'tapWhen': 'Toca cuando',
    'timeUp': '¡Se acabó el tiempo!',
    'noOnePressed': 'Nadie presionó a tiempo.',
    'playerWins': '¡Jugador {player} gana!',
    'otherPlayerWins': '¡El otro jugador gana!',
    'draw': '¡Empate!',
    'playAgain': 'Jugar de nuevo',
    'continueText': 'Continuar',
    // ... (יש להוסיף את כל המפתחות הנדרשים)
  },
  ru: {
    'settings': 'Настройки',
    'gameSelection': 'Выбор игр',
    'gameSelectionDesc': 'Включите или отключите игры для вашей сессии. Изменения сохраняются автоматически.',
    'language': 'Язык',
    'languageSettings': 'Настройки языка',
    'seconds': 'секунд',
    'backToHome': 'Вернуться на главную',
    'startGame': 'Начать игру',
    'player1': 'Игрок 1',
    'player2': 'Игрок 2',
    'tapWhen': 'Нажмите, когда',
    'timeUp': 'Время вышло!',
    'noOnePressed': 'Никто не нажал вовремя.',
    'playerWins': 'Игрок {player} победил!',
    'otherPlayerWins': 'Другой игрок победил!',
    'draw': 'Ничья!',
    'playAgain': 'Играть снова',
    'continueText': 'Продолжить',
    // ... (יש להוסיף את כל המפתחות הנדרשים)
  },
  zh: {
    'settings': '设置',
    'gameSelection': '游戏选择',
    'gameSelectionDesc': '启用或禁用游戏会话。更改将自动保存。',
    'language': '语言',
    'languageSettings': '语言设置',
    'seconds': '秒',
    'backToHome': '返回首页',
    'startGame': '开始游戏',
    'player1': '玩家1',
    'player2': '玩家2',
    'tapWhen': '点击当',
    'timeUp': '时间到！',
    'noOnePressed': '没有人及时按下。',
    'playerWins': '玩家 {player} 获胜！',
    'otherPlayerWins': '另一位玩家获胜！',
    'draw': '平局！',
    'playAgain': '再玩一次',
    'continueText': '继续',
    // ... (יש להוסיף את כל המפתחות הנדרשים)
  },
  ar: {
    'settings': 'الإعدادات',
    'gameSelection': 'اختيار الألعاب',
    'gameSelectionDesc': 'تفعيل أو تعطيل الألعاب لجلسة اللعب. يتم حفظ التغييرات تلقائياً.',
    'language': 'اللغة',
    'languageSettings': 'إعدادات اللغة',
    'seconds': 'ثواني',
    'backToHome': 'العودة للرئيسية',
    'startGame': 'ابدأ اللعبة',
    'player1': 'اللاعب 1',
    'player2': 'اللاعب 2',
    'tapWhen': 'انقر عندما',
    'timeUp': 'انتهى الوقت!',
    'noOnePressed': 'لم يضغط أحد في الوقت المحدد.',
    'playerWins': 'فاز اللاعب {player}!',
    'otherPlayerWins': 'فاز اللاعب الآخر!',
    'draw': 'تعادل!',
    'playAgain': 'العب مرة أخرى',
    'continueText': 'استمرار',
    // ... (יש להוסיף את כל המפתחות הנדרשים)
  }
};

export default LanguageProvider;