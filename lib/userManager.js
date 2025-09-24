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
          user.progress[lesson.id].unlocked = true;
        }
      }
    });
  }

  // Update current lesson to next available
  updateCurrentLesson(user) {
    // Find next uncompleted, unlocked lesson
    const nextLesson = LEARNING_PATH.find(lesson => 
      user.progress[lesson.id].unlocked && !user.progress[lesson.id].completed
    );
    
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