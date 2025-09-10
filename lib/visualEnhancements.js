// Enhanced Visual Theme for Games
export const gameThemes = {
  math: {
    primary: '#2196f3',
    secondary: '#ff9800',
    accent: '#4caf50',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 8px 32px rgba(33, 150, 243, 0.3)'
  },
  memory: {
    primary: '#9c27b0',
    secondary: '#e91e63',
    accent: '#ff5722',
    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 8px 32px rgba(156, 39, 176, 0.3)'
  },
  geometry: {
    primary: '#ff5722',
    secondary: '#3f51b5',
    accent: '#009688',
    background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 8px 32px rgba(255, 87, 34, 0.3)'
  },
  fractions: {
    primary: '#795548',
    secondary: '#ff9800',
    accent: '#4caf50',
    background: 'linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 8px 32px rgba(121, 85, 72, 0.3)'
  }
};

export const enhancedButtonStyles = {
  primary: (theme) => ({
    background: `linear-gradient(45deg, ${theme.primary} 30%, ${theme.secondary} 90%)`,
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      background: `linear-gradient(45deg, ${theme.secondary} 30%, ${theme.primary} 90%)`,
    },
    '&:active': {
      transform: 'translateY(0px)',
    }
  }),
  
  choice: (theme, isSelected, isCorrect, isWrong) => ({
    background: isSelected 
      ? (isCorrect ? '#4caf50' : isWrong ? '#f44336' : theme.primary)
      : 'white',
    borderRadius: '16px',
    padding: '16px 24px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: isSelected ? 'white' : '#333',
    border: `3px solid ${isSelected ? 'transparent' : '#e0e0e0'}`,
    minHeight: '64px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      border: `3px solid ${theme.primary}`,
      background: isSelected ? undefined : theme.primary,
      color: isSelected ? undefined : 'white'
    },
    '&:active': {
      transform: 'translateY(-2px)',
    }
  })
};

export const cardAnimations = {
  flipIn: {
    '@keyframes flipIn': {
      '0%': {
        transform: 'perspective(400px) rotateY(-90deg)',
        opacity: 0,
      },
      '40%': {
        transform: 'perspective(400px) rotateY(-10deg)',
      },
      '70%': {
        transform: 'perspective(400px) rotateY(10deg)',
      },
      '100%': {
        transform: 'perspective(400px) rotateY(0deg)',
        opacity: 1,
      },
    },
    animation: 'flipIn 0.6s ease-out',
  },
  
  slideUp: {
    '@keyframes slideUp': {
      '0%': {
        transform: 'translateY(30px)',
        opacity: 0,
      },
      '100%': {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
    animation: 'slideUp 0.4s ease-out',
  },
  
  bounce: {
    '@keyframes bounce': {
      '0%, 20%, 53%, 80%, 100%': {
        transform: 'translate3d(0,0,0)',
      },
      '40%, 43%': {
        transform: 'translate3d(0,-30px,0)',
      },
      '70%': {
        transform: 'translate3d(0,-15px,0)',
      },
      '90%': {
        transform: 'translate3d(0,-4px,0)',
      },
    },
    animation: 'bounce 1s ease-in-out',
  },
  
  pulse: {
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
    animation: 'pulse 0.6s ease-in-out',
  },
  
  shake: {
    '@keyframes shake': {
      '0%, 100%': {
        transform: 'translateX(0)',
      },
      '10%, 30%, 50%, 70%, 90%': {
        transform: 'translateX(-10px)',
      },
      '20%, 40%, 60%, 80%': {
        transform: 'translateX(10px)',
      },
    },
    animation: 'shake 0.6s ease-in-out',
  }
};

// Enhanced particle effects
export const createFireworksEffect = (canvas, count = 30) => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      size: Math.random() * 6 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      gravity: Math.random() * 0.5 + 0.1
    });
  }
  
  const animate = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'lighter';
    
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.life -= particle.decay;
      particle.size *= 0.99;
      
      if (particle.life > 0) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
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

export const createStarsEffect = (canvas, count = 20) => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const stars = [];
  
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * 0.02 + 0.01
    });
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
      star.opacity += star.twinkle;
      if (star.opacity > 1 || star.opacity < 0.2) {
        star.twinkle = -star.twinkle;
      }
      
      ctx.save();
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffeb3b';
      
      // Draw star shape
      const spikes = 5;
      const outerRadius = star.size;
      const innerRadius = star.size / 2;
      
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2;
        const x = star.x + Math.cos(angle) * radius;
        const y = star.y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

// Enhanced sound feedback
export const enhancedSoundFeedback = {
  playSuccess: (streak = 0) => {
    if (streak >= 5) {
      playSfx('bonus');
    } else if (streak >= 3) {
      playSfx('streak');
    } else {
      playSfx('correct');
    }
  },
  
  playError: () => {
    playSfx('wrong');
  },
  
  playAchievement: () => {
    playSfx('achievement');
  },
  
  playLevelUp: () => {
    playSfx('levelup');
  }
};

// Progress indicators
export const createProgressRing = (progress, size = 120, strokeWidth = 8, color = '#4caf50') => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    children: [
      // Background circle
      {
        tag: 'circle',
        props: {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: '#e0e0e0',
          strokeWidth,
          fill: 'transparent'
        }
      },
      // Progress circle
      {
        tag: 'circle',
        props: {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: color,
          strokeWidth,
          fill: 'transparent',
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          strokeLinecap: 'round',
          style: {
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }
        }
      }
    ]
  };
};
