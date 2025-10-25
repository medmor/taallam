/**
 * User Management System for Taallam Learning Platform
 * Handles multiple users, progress tracking, and learning paths
 */

// Learning Path Definition
export const LEARNING_PATH = [
  {
    id: 'addition-beginner',
    name: 'الجمع للمبتدئين',
    description: 'تعلم أساسيات الجمع (1-10)',
    component: 'AdditionGame',
    level: 'beginner',
    icon: '➕',
    prerequisites: [],
    estimatedTime: '15 دقيقة',
    skills: ['جمع الأرقام الصغيرة', 'العد البسيط']
  },
  {
    id: 'addition-intermediate',
    name: 'الجمع المتوسط',
    description: 'جمع أرقام أكبر (1-50)',
    component: 'AdditionGame',
    level: 'intermediate',
    icon: '➕➕',
    prerequisites: ['addition-beginner'],
    estimatedTime: '20 دقيقة',
    skills: ['جمع الأرقام المتوسطة', 'الحمل في الجمع']
  },
  {
    id: 'multiplication-beginner',
    name: 'الضرب للمبتدئين',
    description: 'تعلم أساسيات الضرب (جدول الضرب 1-5)',
    component: 'MultiplicationGame',
    level: 'beginner',
    icon: '✖️',
    prerequisites: ['addition-intermediate'],
    estimatedTime: '25 دقيقة',
    skills: ['جداول الضرب الأساسية', 'مفهوم الضرب']
  },
  {
    id: 'addition-advanced',
    name: 'الجمع المتقدم',
    description: 'جمع أرقام كبيرة ومعقدة (50-100)',
    component: 'AdditionGame',
    level: 'advanced',
    icon: '➕🔥',
    prerequisites: ['multiplication-beginner'],
    estimatedTime: '30 دقيقة',
    skills: ['جمع الأرقام الكبيرة', 'الحساب السريع']
  },
  {
    id: 'fractions-beginner',
    name: 'الكسور للمبتدئين',
    description: 'فهم الكسور البسيطة باستخدام البيتزا',
    component: 'PizzaFractionsGame',
    level: 'beginner',
    icon: '🍕',
    prerequisites: ['addition-advanced'],
    estimatedTime: '35 دقيقة',
    skills: ['مفهوم الكسور', 'الكسور البصرية', 'أجزاء الكل']
  },
  {
    id: 'multiplication-intermediate',
    name: 'الضرب المتوسط',
    description: 'جداول الضرب المتقدمة (6-10)',
    component: 'MultiplicationGame',
    level: 'intermediate',
    icon: '✖️✖️',
    prerequisites: ['fractions-beginner'],
    estimatedTime: '30 دقيقة',
    skills: ['جداول الضرب المتقدمة', 'الضرب السريع']
  },
  {
    id: 'subtraction-beginner',
    name: 'الطرح للمبتدئين',
    description: 'تعلم أساسيات الطرح (1-20)',
    component: 'SubtractionGame',
    level: 'beginner',
    icon: '➖',
    prerequisites: ['multiplication-intermediate'],
    estimatedTime: '20 دقيقة',
    skills: ['الطرح البسيط', 'العد التنازلي']
  },
  {
    id: 'division-beginner',
    name: 'القسمة للمبتدئين',
    description: 'تعلم أساسيات القسمة البسيطة',
    component: 'DivisionGame',
    level: 'beginner',
    icon: '➗',
    prerequisites: ['subtraction-beginner'],
    estimatedTime: '25 دقيقة',
    skills: ['القسمة البسيطة', 'التوزيع المتساوي']
  },
  {
    id: 'fractions-intermediate',
    name: 'الكسور المتوسطة',
    description: 'مقارنة وترتيب الكسور',
    component: 'FractionsComparison',
    level: 'intermediate',
    icon: '🍕📊',
    prerequisites: ['division-beginner'],
    estimatedTime: '40 دقيقة',
    skills: ['مقارنة الكسور', 'ترتيب الكسور', 'الكسور المتكافئة']
  },
  {
    id: 'number-patterns',
    name: 'أنماط الأرقام',
    description: 'اكتشاف واستكمال الأنماط الرقمية',
    component: 'NumberPatternsGame',
    level: 'intermediate',
    icon: '🔢',
    prerequisites: ['fractions-intermediate'],
    estimatedTime: '30 دقيقة',
    skills: ['الأنماط الرقمية', 'التسلسل', 'التنبؤ']
  },
  {
    id: 'arabic-letters',
    name: 'تعلم الحروف',
    description: 'التعرف على الحروف العربية بالصور والأصوات',
    component: 'ArabicLettersGame',
    path: 'language',
    level: 'beginner',
    icon: '📝',
    prerequisites: [],
    estimatedTime: '20 دقيقة',
    skills: ['التعرف على الحروف', 'ربط الحروف بالكلمات', 'النطق الصحيح']
  }
  ,
  // Arabic language path (from README)
  {
    id: 'arabic-letter-picture',
    name: 'التعرف على الحروف بالصور',
    description: 'اختر الصورة التي تبدأ بالحرف المطلوب',
    component: 'LetterPictureMatchGame',
    path: 'language',
    level: 'beginner',
    icon: '🖼️',
    prerequisites: ['arabic-letters'],
    estimatedTime: '25 دقيقة',
    skills: ['الوعي الصوتي', 'الربط بين الحرف والصورة']
  },
  {
    id: 'arabic-letter-word',
    name: 'ربط الحروف بالكلمات',
    description: 'اختر الكلمة الصحيحة التي تبدأ بالحرف',
    component: 'LetterWordMatchGame',
    path: 'language',
    level: 'beginner',
    icon: '🔗',
    prerequisites: ['arabic-letter-picture'],
    estimatedTime: '25 دقيقة',
    skills: ['المفردات الأساسية', 'تمييز الحرف الأول']
  },
  {
    id: 'arabic-word-from-picture',
    name: 'قراءة الكلمات',
    description: 'اختر الكلمة المطابقة للصورة المعروضة',
    component: 'WordFromPictureGame',
    path: 'language',
    level: 'intermediate',
    icon: '👀',
    prerequisites: ['arabic-letter-word'],
    estimatedTime: '25 دقيقة',
    skills: ['القراءة البصرية', 'توسيع المفردات']
  },
  {
    id: 'arabic-word-builder',
    name: 'تكوين الكلمات البسيطة',
    description: 'رتّب الحروف لتكوين كلمة صحيحة (3-4 حروف)',
    component: 'WordBuilderGame',
    path: 'language',
    level: 'intermediate',
    icon: '🧩',
    prerequisites: ['arabic-word-from-picture'],
    estimatedTime: '30 دقيقة',
    skills: ['التهجئة', 'بناء الكلمات']
  },
  {
    id: 'arabic-sentence-builder',
    name: 'الجمل البسيطة',
    description: 'رتّب الكلمات لتكوين جملة عربية صحيحة',
    component: 'SentenceBuilderGame',
    path: 'language',
    level: 'advanced',
    icon: '📖',
    prerequisites: ['arabic-word-builder'],
    estimatedTime: '35 دقيقة',
    skills: ['تركيب الجمل', 'ترتيب الكلمات']
  }
  ,
  // Science learning path (Natural Sciences)
  {
    id: 'science-animals-sounds',
    name: 'الحيوانات وأصواتها',
    description: 'التعرف على الحيوانات وربطها بأصواتها',
    component: 'AnimalsSoundsGame',
    path: 'science',
    level: 'beginner',
    icon: '🐾',
    prerequisites: [],
    estimatedTime: '20 دقيقة',
    skills: ['التعرف على الحيوانات', 'تمييز الأصوات']
  },
  {
    id: 'science-plants-parts',
    name: 'النباتات وأجزاؤها',
    description: 'أجزاء النبات ووظائفها ودورة النمو',
    component: 'PlantsPartsGame',
    path: 'science',
    level: 'beginner',
    icon: '🌱',
    prerequisites: ['science-animals-sounds'],
    estimatedTime: '25 دقيقة',
    skills: ['أجزاء النبات', 'دورة النمو']
  },
  {
    id: 'science-weather-seasons',
    name: 'الطقس والفصول',
    description: 'التعرف على حالات الطقس وربط الملابس بالفصول',
    component: 'WeatherSeasonsGame',
    path: 'science',
    level: 'beginner',
    icon: '🌤️',
    prerequisites: ['science-plants-parts'],
    estimatedTime: '30 دقيقة',
    skills: ['حالات الطقس', 'الفصول الأربعة']
  },
  {
    id: 'science-body-parts',
    name: 'أعضاء الجسم',
    description: 'التعرف على أجزاء الجسم ووظائفها الأساسية',
    component: 'BodyPartsGame',
    path: 'science',
    level: 'intermediate',
    icon: '👤',
    prerequisites: ['science-weather-seasons'],
    estimatedTime: '35 دقيقة',
    skills: ['أجزاء الجسم', 'وظائف الأعضاء']
  },
  {
    id: 'science-five-senses',
    name: 'الحواس الخمس',
    description: 'ربط كل حاسة بوظيفتها وتمارين تفاعلية',
    component: 'FiveSensesGame',
    path: 'science',
    level: 'intermediate',
    icon: '👁️',
    prerequisites: ['science-body-parts'],
    estimatedTime: '30 دقيقة',
    skills: ['الحواس الخمس', 'الوظائف الحسية']
  },
  {
    id: 'science-magnetism-electricity',
    name: 'المغناطيس والكهرباء',
    description: 'مفاهيم أساسية وتجارب افتراضية بسيطة',
    component: 'MagnetismElectricityGame',
    path: 'science',
    level: 'advanced',
    icon: '⚡',
    prerequisites: ['science-five-senses'],
    estimatedTime: '40 دقيقة',
    skills: ['المواد المغناطيسية', 'المغناطيسية والكهرباء']
  },
  {
    id: 'science-water-cycle',
    name: 'الماء ودورته',
    description: 'حالات الماء ودورة الماء في الطبيعة',
    component: 'WaterCycleGame',
    path: 'science',
    level: 'advanced',
    icon: '💧',
    prerequisites: ['science-magnetism-electricity'],
    estimatedTime: '45 دقيقة',
    skills: ['حالات المادة', 'دورة الماء']
  }
  ,
  // Geography & History learning path
  {
    id: 'geo-home-neighborhood',
    name: 'منزلي وحيي',
    description: 'أجزاء المنزل وغرفه وأماكن في الحي',
    component: 'HomeNeighborhoodGame',
    path: 'geo',
    level: 'beginner',
    icon: '🏠',
    prerequisites: [],
    estimatedTime: '20 دقيقة',
    skills: ['أجزاء المنزل', 'أماكن الحي']
  },
  {
    id: 'geo-city-country',
    name: 'مدينتي وبلدي',
    description: 'معالم مشهورة وخريطة بسيطة',
    component: 'CityCountryGame',
    path: 'geo',
    level: 'beginner',
    icon: '🏙️',
    prerequisites: ['geo-home-neighborhood'],
    estimatedTime: '30 دقيقة',
    skills: ['المعالم', 'قراءة خريطة بسيطة']
  },
  {
    id: 'geo-continents',
    name: 'قارات العالم',
    description: 'التعرف على القارات السبع وحيواناتها',
    component: 'ContinentsGame',
    path: 'geo',
    level: 'intermediate',
    icon: '🌍',
    prerequisites: ['geo-city-country'],
    estimatedTime: '35 دقيقة',
    skills: ['القارات', 'الحيوانات المميزة']
  },
  {
    id: 'history-old-times',
    name: 'الأزمنة القديمة',
    description: 'الماضي والحاضر والمستقبل، وأدوات قديمة وحديثة',
    component: 'OldTimesGame',
    path: 'geo',
    level: 'intermediate',
    icon: '⏰',
    prerequisites: ['geo-continents'],
    estimatedTime: '30 دقيقة',
    skills: ['تسلسل زمني', 'تصنيف أدوات قديمة/حديثة']
  },
  {
    id: 'history-ancient-civilizations',
    name: 'الحضارات القديمة',
    description: 'الأهرامات والحضارة المصرية وقصص مبسطة',
    component: 'AncientCivilizationsGame',
    path: 'geo',
    level: 'advanced',
    icon: '🏺',
    prerequisites: ['history-old-times'],
    estimatedTime: '40 دقيقة',
    skills: ['معلومات عن الحضارات', 'تعلم قصصي مبسط']
  }
  ,
  // Arts & Creativity learning path
  {
    id: 'arts-colors-primary',
    name: 'الألوان الأساسية',
    description: 'التعرّف على الأحمر والأزرق والأصفر واستخداماتهم',
    component: 'ColorsBasicsGame',
    path: 'arts',
    level: 'beginner',
    icon: '🎨',
    prerequisites: [],
    estimatedTime: '25 دقيقة',
    skills: ['تمييز الألوان الأساسية', 'استخدام اللون']
  },
  {
    id: 'arts-color-mixing',
    name: 'خلط الألوان',
    description: 'إنشاء ألوان جديدة من الألوان الأساسية (أخضر، بنفسجي، برتقالي)',
    component: 'ColorMixingGame',
    path: 'arts',
    level: 'beginner',
    icon: '🧪',
    prerequisites: ['arts-colors-primary'],
    estimatedTime: '25 دقيقة',
    skills: ['مزج الألوان', 'التجريب اللوني']
  },
  {
    id: 'arts-shapes-geometry',
    name: 'الأشكال الهندسية',
    description: 'مربع، مثلث، دائرة مع تطبيقات بسيطة',
    component: 'GeometryShapesGame',
    path: 'arts',
    level: 'beginner',
    icon: '📐',
    prerequisites: ['arts-color-mixing'],
    estimatedTime: '20 دقيقة',
    skills: ['تمييز الأشكال', 'الملاحظة البصرية']
  },
  {
    id: 'arts-shapes-environment',
    name: 'أشكال في البيئة المحيطة',
    description: 'البحث عن الأشكال في الأشياء اليومية',
    component: 'ShapesInEnvironmentGame',
    path: 'arts',
    level: 'beginner',
    icon: '🔍',
    prerequisites: ['arts-shapes-geometry'],
    estimatedTime: '20 دقيقة',
    skills: ['الربط بالحياة اليومية', 'التصنيف البصري']
  },
  {
    id: 'arts-drawing-interactive',
    name: 'الرسم التفاعلي',
    description: 'لوحة رسم رقمية بأدوات رسم متنوعة',
    component: 'InteractiveDrawingGame',
    path: 'arts',
    level: 'intermediate',
    icon: '✏️',
    prerequisites: ['arts-shapes-environment'],
    estimatedTime: '35 دقيقة',
    skills: ['التحكم بالأدوات', 'الإبداع الفني']
  },
  {
    id: 'arts-musical-instruments',
    name: 'الآلات الموسيقية',
    description: 'التعرّف على أصوات الآلات وتصنيفها',
    component: 'MusicalInstrumentsGame',
    path: 'arts',
    level: 'intermediate',
    icon: '🎵',
    prerequisites: ['arts-drawing-interactive'],
    estimatedTime: '30 دقيقة',
    skills: ['تمييز الأصوات', 'تصنيف الآلات']
  },
  {
    id: 'arts-rhythm-melody',
    name: 'الإيقاع والنغم',
    description: 'لعبة تقليد الإيقاع وتأليف أنغام بسيطة',
    component: 'RhythmMelodyGame',
    path: 'arts',
    level: 'advanced',
    icon: '🥁',
    prerequisites: ['arts-musical-instruments'],
    estimatedTime: '35 دقيقة',
    skills: ['الإيقاع', 'السمع الموسيقي', 'الإبداع الموسيقي']
  },
  // Technology & Programming learning path (Simplified)
  {
    id: 'tech-computer-parts',
    name: 'أجزاء الحاسوب',
    description: 'التعرف على الشاشة، لوحة المفاتيح، الفأرة ووظيفة كل جزء',
    component: 'ComputerPartsGame',
    path: 'technology',
    level: 'beginner',
    icon: '💻',
    prerequisites: [],
    estimatedTime: '20 دقيقة',
    skills: ['أجزاء الحاسوب', 'وظائف الأجهزة']
  },
  {
    id: 'tech-mouse-control',
    name: 'التحكم بالفأرة',
    description: 'النقر والسحب والإفلات - ألعاب مهارة استخدام الفأرة',
    component: 'MouseControlGame',
    path: 'technology',
    level: 'beginner',
    icon: '🖱️',
    prerequisites: ['tech-computer-parts'],
    estimatedTime: '25 دقيقة',
    skills: ['مهارات الفأرة', 'التحكم الدقيق']
  },
  {
    id: 'tech-sequence-steps',
    name: 'التسلسل والخطوات',
    description: 'ترتيب خطوات مهمة - منطق "أولاً ثم"',
    component: 'SequenceStepsGame',
    path: 'technology',
    level: 'intermediate',
    icon: '📋',
    prerequisites: ['tech-mouse-control'],
    estimatedTime: '30 دقيقة',
    skills: ['التفكير المنطقي', 'الترتيب المتسلسل']
  },
  {
    id: 'tech-loops-patterns',
    name: 'الحلقات البسيطة',
    description: 'تكرار الأعمال - التعرف على الأنماط المتكررة',
    component: 'LoopsPatternGame',
    path: 'technology',
    level: 'intermediate',
    icon: '🔄',
    prerequisites: ['tech-sequence-steps'],
    estimatedTime: '35 دقيقة',
    skills: ['الأنماط', 'التكرار', 'منطق البرمجة']
  }
];

// User Management Functions
export class UserManager {
  constructor() {
    this.storageKey = 'taallam_users';
    this.currentUserKey = 'taallam_current_user';
  }

  // Get all users from localStorage
  getAllUsers() {
    try {
      const users = localStorage.getItem(this.storageKey);
      return users ? JSON.parse(users) : {};
    } catch (error) {
      console.error('Error loading users:', error);
      return {};
    }
  }

  // Get current user
  getCurrentUser() {
    try {
      const currentUserId = localStorage.getItem(this.currentUserKey);
      if (!currentUserId) return null;
      
      const users = this.getAllUsers();
      return users[currentUserId] || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Create new user
  createUser(name) {
    if (!name || name.trim() === '') {
      throw new Error('اسم المستخدم مطلوب');
    }

    const users = this.getAllUsers();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser = {
      id: userId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      progress: {},
      completedLessons: [],
      currentLesson: LEARNING_PATH[0].id,
      totalScore: 0,
      totalTime: 0,
      achievements: [],
      streak: 0,
      maxStreak: 0
    };

    // Initialize progress for all lessons
    LEARNING_PATH.forEach(lesson => {
      newUser.progress[lesson.id] = {
        attempts: 0,
        bestScore: 0,
        bestTime: null,
        completed: false,
        unlocked: lesson.prerequisites.length === 0
      };
    });

    users[userId] = newUser;
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    localStorage.setItem(this.currentUserKey, userId);
    
    return newUser;
  }

  // Switch to existing user
  switchUser(userId) {
    const users = this.getAllUsers();
    if (!users[userId]) {
      throw new Error('المستخدم غير موجود');
    }

    users[userId].lastLoginAt = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    localStorage.setItem(this.currentUserKey, userId);
    
    return users[userId];
  }

  // Update user progress
  updateProgress(lessonId, score, time, completed = false) {
    const user = this.getCurrentUser();
    if (!user) return null;

    const users = this.getAllUsers();
    // Ensure progress entries exist for all lessons (handles users created before new lessons were added)
    LEARNING_PATH.forEach(lesson => {
      if (!user.progress[lesson.id]) {
        user.progress[lesson.id] = {
          attempts: 0,
          bestScore: 0,
          bestTime: null,
          completed: false,
          unlocked: lesson.prerequisites.length === 0
        };
      }
    });
    
    // Update lesson progress
    if (!user.progress[lessonId]) {
      user.progress[lessonId] = {
        attempts: 0,
        bestScore: 0,
        bestTime: null,
        completed: false,
        unlocked: true
      };
    }

    const lessonProgress = user.progress[lessonId];
    lessonProgress.attempts += 1;
    lessonProgress.bestScore = Math.max(lessonProgress.bestScore, score);
    
    if (lessonProgress.bestTime === null || time < lessonProgress.bestTime) {
      lessonProgress.bestTime = time;
    }
    
    if (completed && !lessonProgress.completed) {
      lessonProgress.completed = true;
      user.completedLessons.push(lessonId);
      user.totalScore += score;
      user.totalTime += time;
      
      // Unlock next lessons
      this.unlockNextLessons(user, lessonId);
      
      // Update current lesson to next available
      this.updateCurrentLesson(user);
      
      // Check for achievements
      this.checkAchievements(user);
    }

    users[user.id] = user;
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    
    return user;
  }

  // Unlock lessons that have this lesson as prerequisite
  unlockNextLessons(user, completedLessonId) {
    LEARNING_PATH.forEach(lesson => {
      if (lesson.prerequisites.includes(completedLessonId)) {
        // Check if all prerequisites are completed
        const allPrereqsCompleted = lesson.prerequisites.every(prereq => 
          user.completedLessons.includes(prereq)
        );
        
        if (allPrereqsCompleted) {
          // Ensure progress entry exists before unlocking (defensive)
          if (!user.progress[lesson.id]) {
            user.progress[lesson.id] = {
              attempts: 0,
              bestScore: 0,
              bestTime: null,
              completed: false,
              unlocked: false
            };
          }
          user.progress[lesson.id].unlocked = true;
        }
      }
    });
  }

  // Update current lesson to next available
  updateCurrentLesson(user) {
    // Find next uncompleted, unlocked lesson
    const nextLesson = LEARNING_PATH.find(lesson => {
      const prog = user.progress[lesson.id] || {
        attempts: 0,
        bestScore: 0,
        bestTime: null,
        completed: false,
        unlocked: lesson.prerequisites.length === 0
      };
      return prog.unlocked && !prog.completed;
    });
    
    if (nextLesson) {
      user.currentLesson = nextLesson.id;
    }
  }

  // Check and award achievements
  checkAchievements(user) {
    const achievements = [];
    
    // First lesson completed
    if (user.completedLessons.length === 1) {
      achievements.push({
        id: 'first_lesson',
        name: 'البداية الجيدة',
        description: 'أكملت درسك الأول!',
        icon: '🎯',
        earnedAt: new Date().toISOString()
      });
    }
    
    // Five lessons completed
    if (user.completedLessons.length === 5) {
      achievements.push({
        id: 'five_lessons',
        name: 'متعلم نشط',
        description: 'أكملت 5 دروس!',
        icon: '⭐',
        earnedAt: new Date().toISOString()
      });
    }
    
    // All lessons completed
    if (user.completedLessons.length === LEARNING_PATH.length) {
      achievements.push({
        id: 'all_lessons',
        name: 'بطل الرياضيات',
        description: 'أكملت جميع الدروس!',
        icon: '🏆',
        earnedAt: new Date().toISOString()
      });
    }
    
    // Add new achievements
    achievements.forEach(achievement => {
      if (!user.achievements.find(a => a.id === achievement.id)) {
        user.achievements.push(achievement);
      }
    });
  }

  // Get learning path with user progress; can be filtered by selectedPath
  // selectedPath examples: 'math', 'language', 'science' (future)
  getLearningPathWithProgress(selectedPath = null) {
    const user = this.getCurrentUser();
    // Helper to infer a path when not explicitly defined on the lesson
    const inferPath = (lesson) => {
      if (lesson.path) return lesson.path;
      // Simple heuristic: Arabic letters lives under 'language', everything else defaults to 'math'
      return lesson.component === 'ArabicLettersGame' ? 'language' : 'math';
    };

    const base = selectedPath
      ? LEARNING_PATH.filter(lesson => inferPath(lesson) === selectedPath)
      : LEARNING_PATH;

    if (!user) return base;

    return base.map(lesson => ({
      ...lesson,
      progress: user.progress[lesson.id] || {
        attempts: 0,
        bestScore: 0,
        bestTime: null,
        completed: false,
        unlocked: lesson.prerequisites.length === 0
      }
    }));
  }

  // Get user statistics
  getUserStats() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const totalLessons = LEARNING_PATH.length;
    const completedLessons = user.completedLessons.length;
    const unlockedLessons = LEARNING_PATH.filter(lesson => 
      user.progress[lesson.id]?.unlocked
    ).length;

    return {
      name: user.name,
      totalLessons,
      completedLessons,
      unlockedLessons,
      completionRate: Math.round((completedLessons / totalLessons) * 100),
      totalScore: user.totalScore,
      totalTime: user.totalTime,
      achievements: user.achievements,
      currentLesson: user.currentLesson,
      streak: user.streak,
      maxStreak: user.maxStreak
    };
  }

  // Delete user
  deleteUser(userId) {
    const users = this.getAllUsers();
    delete users[userId];
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    
    // If deleted user was current user, clear current user
    const currentUserId = localStorage.getItem(this.currentUserKey);
    if (currentUserId === userId) {
      localStorage.removeItem(this.currentUserKey);
    }
  }
}

// Singleton instance
export const userManager = new UserManager();