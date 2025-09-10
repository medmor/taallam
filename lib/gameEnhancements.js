// Game Enhancement System - Difficulty Progression and Visual Effects
export const difficultyLevels = {
  beginner: {
    name: 'مبتدئ',
    color: '#4caf50',
    icon: '🌱',
    scoreMultiplier: 1,
    timeBonus: 1.5,
    hintsAllowed: 3
  },
  intermediate: {
    name: 'متوسط',
    color: '#ff9800',
    icon: '🌟',
    scoreMultiplier: 1.5,
    timeBonus: 1.2,
    hintsAllowed: 2
  },
  advanced: {
    name: 'متقدم',
    color: '#f44336',
    icon: '🔥',
    scoreMultiplier: 2,
    timeBonus: 1,
    hintsAllowed: 1
  },
  expert: {
    name: 'خبير',
    color: '#9c27b0',
    icon: '💎',
    scoreMultiplier: 3,
    timeBonus: 0.8,
    hintsAllowed: 0
  }
};

export const achievementSystem = {
  firstCorrect: {
    name: 'البداية الجيدة',
    description: 'أول إجابة صحيحة!',
    icon: '🎯',
    points: 10
  },
  fiveStreak: {
    name: 'متتالية ممتازة',
    description: '5 إجابات صحيحة متتالية',
    icon: '🔥',
    points: 50
  },
  perfectRound: {
    name: 'الجولة المثالية',
    description: 'أجب على جميع الأسئلة بشكل صحيح',
    icon: '⭐',
    points: 100
  },
  speedDemon: {
    name: 'سرعة البرق',
    description: 'أجب في أقل من 3 ثوانٍ',
    icon: '⚡',
    points: 25
  },
  levelMaster: {
    name: 'أستاذ المستوى',
    description: 'اكمل 10 جولات في نفس المستوى',
    icon: '👑',
    points: 200
  }
};

export class GameProgressionManager {
  constructor(gameId) {
    this.gameId = gameId;
    this.loadProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(`game_progress_${this.gameId}`);
      this.progress = saved ? JSON.parse(saved) : {
        level: 'beginner',
        totalScore: 0,
        gamesPlayed: 0,
        achievements: [],
        bestTime: null,
        longestStreak: 0,
        difficultyUnlocked: ['beginner']
      };
    } catch (e) {
      this.progress = {
        level: 'beginner',
        totalScore: 0,
        gamesPlayed: 0,
        achievements: [],
        bestTime: null,
        longestStreak: 0,
        difficultyUnlocked: ['beginner']
      };
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(`game_progress_${this.gameId}`, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Could not save game progress');
    }
  }

  updateScore(points, timeElapsed) {
    const difficulty = difficultyLevels[this.progress.level];
    const finalScore = Math.round(points * difficulty.scoreMultiplier);
    this.progress.totalScore += finalScore;
    this.progress.gamesPlayed += 1;
    
    // Update best time
    if (!this.progress.bestTime || timeElapsed < this.progress.bestTime) {
      this.progress.bestTime = timeElapsed;
    }

    // Check for level progression
    this.checkLevelProgression();
    this.saveProgress();
    
    return finalScore;
  }

  updateStreak(currentStreak) {
    if (currentStreak > this.progress.longestStreak) {
      this.progress.longestStreak = currentStreak;
      this.saveProgress();
    }
  }

  checkLevelProgression() {
    const { totalScore, gamesPlayed } = this.progress;
    
    // Unlock intermediate after 100 points and 5 games
    if (totalScore >= 100 && gamesPlayed >= 5 && !this.progress.difficultyUnlocked.includes('intermediate')) {
      this.progress.difficultyUnlocked.push('intermediate');
      this.awardAchievement('levelUnlock');
    }
    
    // Unlock advanced after 500 points and 20 games
    if (totalScore >= 500 && gamesPlayed >= 20 && !this.progress.difficultyUnlocked.includes('advanced')) {
      this.progress.difficultyUnlocked.push('advanced');
      this.awardAchievement('levelUnlock');
    }
    
    // Unlock expert after 1500 points and 50 games
    if (totalScore >= 1500 && gamesPlayed >= 50 && !this.progress.difficultyUnlocked.includes('expert')) {
      this.progress.difficultyUnlocked.push('expert');
      this.awardAchievement('levelUnlock');
    }
  }

  awardAchievement(achievementId, customData = {}) {
    if (this.progress.achievements.includes(achievementId)) return false;
    
    this.progress.achievements.push(achievementId);
    this.saveProgress();
    return true;
  }

  getDifficultyConfig() {
    return difficultyLevels[this.progress.level];
  }

  setDifficulty(level) {
    if (this.progress.difficultyUnlocked.includes(level)) {
      this.progress.level = level;
      this.saveProgress();
      return true;
    }
    return false;
  }

  getProgress() {
    return { ...this.progress };
  }
}

// Visual enhancement utilities
export const createParticleEffect = (canvas, type = 'success') => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const particles = [];
  const particleCount = type === 'success' ? 15 : type === 'achievement' ? 25 : 10;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 8 + 4,
      color: type === 'success' ? `hsl(${120 + Math.random() * 60}, 70%, 60%)` : 
             type === 'achievement' ? `hsl(${45 + Math.random() * 30}, 80%, 60%)` :
             `hsl(${Math.random() * 360}, 70%, 60%)`,
      life: 1,
      decay: 0.02
    });
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.3; // gravity
      particle.life -= particle.decay;
      particle.size *= 0.98;
      
      if (particle.life > 0) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        particles.splice(index, 1);
      }
    });
    
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

export const animateNumber = (element, from, to, duration = 1000) => {
  const start = performance.now();
  const range = to - from;
  
  const update = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (range * easeOut));
    
    if (element) {
      element.textContent = current.toString();
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  
  requestAnimationFrame(update);
};

export const createPulseAnimation = () => ({
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
  animation: 'pulse 0.3s ease-in-out',
});

export const createBounceAnimation = () => ({
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
  animation: 'bounce 0.5s ease-in-out',
});

export const createShakeAnimation = () => ({
  '@keyframes shake': {
    '0%, 100%': {
      transform: 'translateX(0)',
    },
    '25%': {
      transform: 'translateX(-5px)',
    },
    '75%': {
      transform: 'translateX(5px)',
    },
  },
  animation: 'shake 0.5s ease-in-out',
});

// Adaptive difficulty system
export const adaptiveDifficulty = {
  calculateOptimalDifficulty(recentScores, recentTimes, targetSuccessRate = 0.75) {
    if (recentScores.length < 3) return 'maintain';
    
    const successRate = recentScores.filter(score => score > 0.7).length / recentScores.length;
    const avgTime = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
    
    if (successRate > 0.9 && avgTime < 3000) {
      return 'increase'; // Too easy
    } else if (successRate < 0.5) {
      return 'decrease'; // Too hard
    } else {
      return 'maintain'; // Just right
    }
  },
  
  adjustGameParameters(gameType, adjustment, currentParams) {
    const adjustments = {
      math: {
        increase: { 
          maxNumber: Math.min(currentParams.maxNumber * 1.2, 1000),
          timeLimit: Math.max(currentParams.timeLimit * 0.9, 5000)
        },
        decrease: { 
          maxNumber: Math.max(currentParams.maxNumber * 0.8, 10),
          timeLimit: Math.min(currentParams.timeLimit * 1.1, 30000)
        }
      },
      memory: {
        increase: { 
          gridSize: Math.min(currentParams.gridSize + 1, 8),
          displayTime: Math.max(currentParams.displayTime * 0.9, 1000)
        },
        decrease: { 
          gridSize: Math.max(currentParams.gridSize - 1, 3),
          displayTime: Math.min(currentParams.displayTime * 1.1, 5000)
        }
      }
    };
    
    if (adjustment === 'maintain') return currentParams;
    
    return {
      ...currentParams,
      ...(adjustments[gameType]?.[adjustment] || {})
    };
  }
};
