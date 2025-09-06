import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Alert,
  TextField,
} from "@mui/material";
import { playSfx } from "@/lib/sfx";

const StoryMath = () => {
  const canvasRef = useRef(null);
  const [currentStory, setCurrentStory] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(8);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const storyColors = {
    background: "#f8f9fa",
    primary: "#2196f3",
    secondary: "#4caf50",
    accent: "#ff9800",
    correct: "#4caf50",
    incorrect: "#f44336",
    sky: "#87ceeb",
    grass: "#90ee90",
    apple: "#ff6347",
    banana: "#ffd700",
    orange: "#ffa500",
    car: "#ff4444",
    person: "#ffdbac",
    bird: "#4169e1",
    coin: "#ffd700",
  };

  // Character names with gender information
  const characters = {
    male: [
      { name: "أحمد", gender: "male" },
      { name: "محمد", gender: "male" },
      { name: "علي", gender: "male" },
      { name: "حمزة", gender: "male" },
      { name: "يوسف", gender: "male" },
      { name: "عمر", gender: "male" },
      { name: "خالد", gender: "male" },
      { name: "طارق", gender: "male" }
    ],
    female: [
      { name: "فاطمة", gender: "female" },
      { name: "عائشة", gender: "female" },
      { name: "مريم", gender: "female" },
      { name: "زينب", gender: "female" },
      { name: "نور", gender: "female" },
      { name: "هند", gender: "female" },
      { name: "سارة", gender: "female" },
      { name: "ريم", gender: "female" }
    ]
  };

  // Helper function to get gender-appropriate verb and pronoun forms
  const getGenderForms = (gender) => {
    return {
      was: gender === "male" ? "كان" : "كانت",
      gave: gender === "male" ? "أعطى" : "أعطت",
      hisHer: gender === "male" ? "له" : "لها",
      withHim: gender === "male" ? "معه" : "معها",
      heFriend: gender === "male" ? "صديقه" : "صديقتها",
      hisHerSibling: gender === "male" ? "لأخته" : "لأختها"
    };
  };

  // Story templates for different types of problems
  const storyTemplates = [
    {
      type: "addition",
      category: "fruits",
      template: "{was} لدى {name} {num1} {item1}. أعطا{gave_suffix} {heFriend} {num2} {item2} أخرى. كم  أصبح {hisHer} الآن؟",
      visual: "fruits_adding",
      operation: "+",
      items: [
        { singular: "تفاحة", plural: "تفاحات" },
        { singular: "موزة", plural: "موزات" },
        { singular: "برتقالة", plural: "برتقالات" },
        { singular: "كمثرى", plural: "كمثريات" }
      ],
      emoji: ["🍎", "🍌", "🍊", "🍐"],
    },
    {
      type: "subtraction", 
      category: "toys",
      template: "{was} لدى {name} {num1} {item1}. {gave} {num2} منها {hisHerSibling}. كم {item_result} بقي {withHim}؟",
      visual: "toys_removing",
      operation: "-",
      items: [
        { singular: "كرة", plural: "كرات" },
        { singular: "دمية", plural: "دمى" },
        { singular: "سيارة", plural: "سيارات" },
        { singular: "كتاب", plural: "كتب" }
      ],
      emoji: ["⚽", "🎎", "🚗", "📚"],
    },
    {
      type: "addition",
      category: "animals", 
      template: "في المزرعة {num1} {item1}. جاءت {num2} {item2} أخرى. كم {item_result} في المزرعة الآن؟",
      visual: "animals_gathering",
      operation: "+",
      isNeutral: true, // No character needed
      items: [
        { singular: "دجاجة", plural: "دجاجات" },
        { singular: "خروف", plural: "خراف" },
        { singular: "بقرة", plural: "بقرات" },
        { singular: "حصان", plural: "أحصنة" }
      ],
      emoji: ["🐔", "🐑", "🐄", "🐴"],
    },
    {
      type: "subtraction",
      category: "birds",
      template: "كان على الشجرة {num1} {item1}. طار منها {num2}. كم  بقي على الشجرة؟",
      visual: "birds_flying",
      operation: "-",
      isNeutral: true, // No character needed
      items: [
        { singular: "عصفور", plural: "عصافير" },
        { singular: "حمامة", plural: "حمامات" },
        { singular: "طائر", plural: "طيور" },
      ],
      emoji: ["🐦", "🕊️", "🐤", "🐥"],
    },
    {
      type: "multiplication",
      category: "groups",
      template: "لدى {name} {num1} صناديق، في كل صندوق {num2} {item2}. كم لديه في المجموع؟",
      visual: "groups_counting",
      operation: "×",
      items: [
        { singular: "قلم", plural: "أقلام" },
        { singular: "كتاب", plural: "كتب" },
        { singular: "تفاحة", plural: "تفاحات" },
        { singular: "كرة", plural: "كرات" }
      ],
      emoji: ["✏️", "📚", "🍎", "⚽"],
    },
    {
      type: "division",
      category: "sharing",
      template: "لدى {name} {num1} {item1} و{wants} توزيعها على {num2} أطفال بالتساوي. ما العدد الذي سيحصل عليه كل طفل؟",
      visual: "sharing_equally",
      operation: "÷",
      parentCharacters: true, // Special case for parent/teacher characters
      items: [
        { singular: "حلوى", plural: "حلويات" },
        { singular: "قلم", plural: "أقلام" },
        { singular: "كتاب", plural: "كتب" },
        { singular: "لعبة", plural: "ألعاب" }
      ],
      emoji: ["🍭", "✏️", "📚", "🧸"],
    },
  ];

  // Helper function to get correct Arabic singular/plural form
  const getCorrectForm = (number, itemObject) => {
    if (number === 1) {
      return itemObject.singular;
    } else {
      return itemObject.plural;
    }
  };

  const generateStory = () => {
    const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
    const itemIndex = Math.floor(Math.random() * template.items.length);
    const itemObject = template.items[itemIndex];
    const emoji = template.emoji[itemIndex];

    let selectedCharacter = null;
    let name = "";
    let genderForms = {};

    // Handle different character types
    if (template.isNeutral) {
      // No character needed (animals, birds stories)
      name = "";
    } else if (template.parentCharacters) {
      // Special parent/teacher characters with their own grammar
      const parentCharacters = [
        { name: "الأم", gender: "female" },
        { name: "المعلمة", gender: "female" },
        { name: "الأب", gender: "male" },
        { name: "المعلم", gender: "male" }
      ];
      selectedCharacter = parentCharacters[Math.floor(Math.random() * parentCharacters.length)];
      name = selectedCharacter.name;
      genderForms = {
        wants: selectedCharacter.gender === "male" ? "يريد" : "تريد"
      };
    } else {
      // Regular character stories - randomly pick male or female
      const genderChoice = Math.random() < 0.5 ? "male" : "female";
      const characterList = characters[genderChoice];
      selectedCharacter = characterList[Math.floor(Math.random() * characterList.length)];
      name = selectedCharacter.name;
      genderForms = getGenderForms(selectedCharacter.gender);
    }

    let num1, num2, answer;

    if (level <= 2) {
      // Simple numbers for beginners
      if (template.type === "addition") {
        num1 = Math.floor(Math.random() * 5) + 1; // 1-5
        num2 = Math.floor(Math.random() * 5) + 1; // 1-5
        answer = num1 + num2;
      } else if (template.type === "subtraction") {
        num1 = Math.floor(Math.random() * 8) + 3; // 3-10
        num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
        answer = num1 - num2;
      } else if (template.type === "multiplication") {
        num1 = Math.floor(Math.random() * 3) + 2; // 2-4
        num2 = Math.floor(Math.random() * 3) + 2; // 2-4
        answer = num1 * num2;
      } else if (template.type === "division") {
        answer = Math.floor(Math.random() * 4) + 2; // 2-5
        num2 = Math.floor(Math.random() * 3) + 2; // 2-4
        num1 = answer * num2;
        // answer stays the same
      }
    } else if (level <= 4) {
      // Medium difficulty
      if (template.type === "addition") {
        num1 = Math.floor(Math.random() * 15) + 5; // 5-19
        num2 = Math.floor(Math.random() * 15) + 5; // 5-19
        answer = num1 + num2;
      } else if (template.type === "subtraction") {
        num1 = Math.floor(Math.random() * 20) + 10; // 10-29
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      } else if (template.type === "multiplication") {
        num1 = Math.floor(Math.random() * 6) + 3; // 3-8
        num2 = Math.floor(Math.random() * 6) + 3; // 3-8
        answer = num1 * num2;
      } else if (template.type === "division") {
        answer = Math.floor(Math.random() * 8) + 3; // 3-10
        num2 = Math.floor(Math.random() * 5) + 3; // 3-7
        num1 = answer * num2;
      }
    } else {
      // Advanced difficulty
      if (template.type === "addition") {
        num1 = Math.floor(Math.random() * 30) + 10; // 10-39
        num2 = Math.floor(Math.random() * 30) + 10; // 10-39
        answer = num1 + num2;
      } else if (template.type === "subtraction") {
        num1 = Math.floor(Math.random() * 50) + 20; // 20-69
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      } else if (template.type === "multiplication") {
        num1 = Math.floor(Math.random() * 8) + 5; // 5-12
        num2 = Math.floor(Math.random() * 8) + 5; // 5-12
        answer = num1 * num2;
      } else if (template.type === "division") {
        answer = Math.floor(Math.random() * 12) + 5; // 5-16
        num2 = Math.floor(Math.random() * 7) + 4; // 4-10
        num1 = answer * num2;
      }
    }

    // Get correct forms based on numbers
    const item1 = getCorrectForm(num1, itemObject);
    const item2 = getCorrectForm(num2, itemObject);
    const item_result = getCorrectForm(answer, itemObject);

    // Build the story with gender-appropriate grammar
    let story = template.template
      .replace("{name}", name)
      .replace("{num1}", num1)
      .replace("{num2}", num2)
      .replace("{item1}", item1)
      .replace("{item2}", item2)
      .replace("{item_result}", item_result);

    // Apply gender-specific replacements
    if (selectedCharacter && !template.isNeutral && !template.parentCharacters) {
      story = story
        .replace("{was}", genderForms.was)
        .replace("{gave}", genderForms.gave)
        .replace("{gave_suffix}", selectedCharacter.gender === "male" ? "ه" : "تها")
        .replace("{hisHer}", genderForms.hisHer)
        .replace("{withHim}", genderForms.withHim)
        .replace("{heFriend}", genderForms.heFriend)
        .replace("{hisHerSibling}", genderForms.hisHerSibling);
    } else if (template.parentCharacters) {
      story = story.replace("{wants}", genderForms.wants);
    }

    setCurrentStory({
      ...template,
      story,
      name,
      character: selectedCharacter,
      num1,
      num2,
      item: item_result, // For compatibility with drawing functions
      itemObject,
      emoji,
      answer,
      question: `${num1} ${template.operation} ${num2} = ؟`,
    });

    setUserAnswer("");
    setShowResult(false);
    setAnimationStep(0);
    setIsAnimating(false);
  };

  const startAnimation = () => {
    if (!currentStory) return;
    
    setIsAnimating(true);
    setAnimationStep(0);
    
    const animationInterval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= 3) {
          setIsAnimating(false);
          clearInterval(animationInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const drawStoryAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentStory) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, storyColors.sky);
    gradient.addColorStop(1, storyColors.grass);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw ground
    ctx.fillStyle = storyColors.grass;
    ctx.fillRect(0, height - 60, width, 60);

    // Draw story-specific animations
    if (currentStory.visual === "fruits_adding") {
      drawFruitsAdding(ctx, width, height);
    } else if (currentStory.visual === "toys_removing") {
      drawToysRemoving(ctx, width, height);
    } else if (currentStory.visual === "animals_gathering") {
      drawAnimalsGathering(ctx, width, height);
    } else if (currentStory.visual === "birds_flying") {
      drawBirdsFlying(ctx, width, height);
    } else if (currentStory.visual === "groups_counting") {
      drawGroupsCounting(ctx, width, height);
    } else if (currentStory.visual === "sharing_equally") {
      drawSharingEqually(ctx, width, height);
    }

    // Draw numbers
    ctx.fillStyle = "#333";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(currentStory.question, width / 2, 40);
  };

  const drawFruitsAdding = (ctx, width, height) => {
    const { num1, num2, emoji } = currentStory;
    const fruitSize = 30;
    const spacing = 40;
    
    // Draw first group
    for (let i = 0; i < num1; i++) {
      const x = 50 + (i % 5) * spacing;
      const y = 120 + Math.floor(i / 5) * spacing;
      ctx.font = `${fruitSize}px Arial`;
      ctx.fillText(emoji, x, y);
    }

    // Draw plus sign
    if (animationStep >= 1) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 30px Arial";
      ctx.fillText("+", width / 2, 150);
    }

    // Draw second group (animated)
    if (animationStep >= 2) {
      for (let i = 0; i < num2; i++) {
        const x = width - 200 + (i % 5) * spacing;
        const y = 120 + Math.floor(i / 5) * spacing;
        ctx.font = `${fruitSize}px Arial`;
        ctx.fillText(emoji, x, y);
      }
    }

    // Draw equals and result
    if (animationStep >= 3) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 30px Arial";
      ctx.fillText("=", width / 2, 200);
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = storyColors.correct;
      ctx.fillText(currentStory.answer.toString(), width / 2, 250);
    }
  };

  const drawToysRemoving = (ctx, width, height) => {
    const { num1, num2, emoji } = currentStory;
    const toySize = 30;
    const spacing = 40;
    
    // Draw all toys initially
    for (let i = 0; i < num1; i++) {
      const x = 80 + (i % 6) * spacing;
      const y = 120 + Math.floor(i / 6) * spacing;
      
      // Fade out toys that are being removed
      if (animationStep >= 2 && i >= (num1 - num2)) {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1;
      }
      
      ctx.font = `${toySize}px Arial`;
      ctx.fillText(emoji, x, y);
    }
    
    ctx.globalAlpha = 1;

    // Draw minus sign
    if (animationStep >= 1) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 30px Arial";
      ctx.fillText("-", width / 2, 100);
      ctx.fillText(num2.toString(), width / 2 + 40, 100);
    }

    // Draw result
    if (animationStep >= 3) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 30px Arial";
      ctx.fillText("=", width / 2, 250);
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = storyColors.correct;
      ctx.fillText(currentStory.answer.toString(), width / 2 + 40, 250);
    }
  };

  const drawAnimalsGathering = (ctx, width, height) => {
    const { num1, num2, emoji } = currentStory;
    const animalSize = 35;
    const spacing = 45;
    
    // Draw first group of animals
    for (let i = 0; i < num1; i++) {
      const x = 60 + (i % 4) * spacing;
      const y = 140 + Math.floor(i / 4) * spacing;
      ctx.font = `${animalSize}px Arial`;
      ctx.fillText(emoji, x, y);
    }

    // Draw second group arriving (animated)
    if (animationStep >= 1) {
      for (let i = 0; i < num2; i++) {
        const targetX = 250 + (i % 4) * spacing;
        const targetY = 140 + Math.floor(i / 4) * spacing;
        
        // Animate movement
        const moveProgress = Math.min(animationStep - 1, 1);
        const startX = width + 50;
        const x = startX + (targetX - startX) * moveProgress;
        
        ctx.font = `${animalSize}px Arial`;
        ctx.fillText(emoji, x, targetY);
      }
    }

    // Show total count
    if (animationStep >= 3) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`المجموع: ${currentStory.answer}`, width / 2, height - 20);
    }
  };

  const drawBirdsFlying = (ctx, width, height) => {
    const { num1, num2, emoji } = currentStory;
    const birdSize = 25;
    const spacing = 35;
    
    // Draw tree
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(width / 2 - 10, height - 150, 20, 100);
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(width / 2, height - 150, 50, 0, 2 * Math.PI);
    ctx.fill();

    // Draw birds on tree
    for (let i = 0; i < num1; i++) {
      if (animationStep >= 2 && i < num2) {
        // Flying away birds
        const flyProgress = Math.min((animationStep - 2) * 2, 1);
        const x = width / 2 + (i - 2) * 20 + flyProgress * 200;
        const y = height - 150 - flyProgress * 50;
        ctx.font = `${birdSize}px Arial`;
        ctx.fillText(emoji, x, y);
      } else if (!(animationStep >= 2 && i < num2)) {
        // Birds remaining on tree
        const angle = (i / num1) * Math.PI * 2;
        const x = width / 2 + Math.cos(angle) * 35;
        const y = height - 150 + Math.sin(angle) * 15;
        ctx.font = `${birdSize}px Arial`;
        ctx.fillText(emoji, x, y);
      }
    }

    // Show remaining count
    if (animationStep >= 3) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`البقايا: ${currentStory.answer}`, width / 2, 80);
    }
  };

  const drawGroupsCounting = (ctx, width, height) => {
    const { num1, num2, emoji } = currentStory;
    const itemSize = 20;
    const boxWidth = 80;
    const boxHeight = 60;
    const spacing = 100;
    
    // Draw boxes with items
    for (let box = 0; box < num1; box++) {
      const boxX = 50 + box * spacing;
      const boxY = 120;
      
      // Draw box
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Draw items in box (if animation step allows)
      if (animationStep >= box + 1) {
        for (let item = 0; item < num2; item++) {
          const itemX = boxX + 15 + (item % 3) * 20;
          const itemY = boxY + 25 + Math.floor(item / 3) * 20;
          ctx.font = `${itemSize}px Arial`;
          ctx.fillText(emoji, itemX, itemY);
        }
      }
    }

    // Show calculation
    if (animationStep >= 3) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${num1} × ${num2} = ${currentStory.answer}`, width / 2, height - 30);
    }
  };

  const drawSharingEqually = (ctx, width, height) => {
    const { num1, num2, emoji, answer, itemObject } = currentStory;
    const itemSize = 25;
    const personSize = 40;
    const spacing = 80;
    
    // Draw people
    for (let i = 0; i < num2; i++) {
      const x = 100 + i * spacing;
      const y = height - 100;
      ctx.font = `${personSize}px Arial`;
      ctx.fillText("👤", x, y);
      
      // Draw items for each person (animated)
      if (animationStep >= 2) {
        const itemsPerPerson = answer;
        for (let j = 0; j < itemsPerPerson; j++) {
          const itemX = x + (j - itemsPerPerson / 2 + 0.5) * 30;
          const itemY = y - 50;
          ctx.font = `${itemSize}px Arial`;
          ctx.fillText(emoji, itemX, itemY);
        }
      }
    }

    // Show total items at top initially
    if (animationStep <= 1) {
      const totalItemText = getCorrectForm(num1, itemObject);
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.fillText(`${num1} ${totalItemText}`, width / 2, 80);
      
      // Draw all items in a pile
      for (let i = 0; i < num1; i++) {
        const x = width / 2 - 50 + (i % 10) * 10;
        const y = 100 + Math.floor(i / 10) * 25;
        ctx.font = `${itemSize}px Arial`;
        ctx.fillText(emoji, x, y);
      }
    }

    // Show result
    if (animationStep >= 3) {
      const resultItemText = getCorrectForm(answer, itemObject);
      ctx.fillStyle = storyColors.correct;
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`كل طفل يحصل على ${answer} ${resultItemText}`, width / 2, 50);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const userValue = parseInt(userAnswer);
    const correct = userValue === currentStory.answer;

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSfx("correct");
      let points = level * 2 + (streak >= 3 ? 5 : 2);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      playSfx("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        generateStory();
      }
    }, 3000);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setUserAnswer("");
    setCurrentStory(null);
    setAnimationStep(0);
    setIsAnimating(false);
    generateStory();
  };

  const getLevelDescription = () => {
    const descriptions = {
      1: "مبتدئ - أرقام صغيرة وقصص بسيطة",
      2: "مبتدئ متقدم - جمع وطرح بسيط",
      3: "متوسط - عمليات متنوعة",
      4: "متوسط متقدم - أرقام أكبر",
      5: "متقدم - جميع العمليات مع أرقام كبيرة",
    };
    return descriptions[level] || `متقدم - المستوى ${level}`;
  };

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 30 === 0 && level < 6) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 500;
      canvas.height = 300;
      drawStoryAnimation();
    }
  }, [currentStory, animationStep]);

  // Initialize first story
  useEffect(() => {
    generateStory();
  }, [level]);

  const isGameComplete = currentQuestionIndex >= totalQuestions;

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: 3,
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "20px",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: storyColors.primary, fontWeight: "bold" }}
      >
        📚 قصص الرياضيات
      </Typography>

      {/* Game Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Chip label={`النقاط: ${score}`} color="primary" size="large" />
        <Chip label={`المستوى: ${level}`} color="secondary" size="large" />
        <Chip
          label={`السؤال: ${currentQuestionIndex + 1}/${totalQuestions}`}
          color="info"
          size="large"
        />
        <Chip label={`المتتالية: ${streak}🔥`} color="success" size="large" />
      </Box>

      {/* Level Description */}
      <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>
        {getLevelDescription()}
      </Typography>

      {!isGameComplete && currentStory && (
        <>
          {/* Story Display */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
              📖 القصة:
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.8 }}>
              {currentStory.story}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 اقرأ القصة بعناية وتابع الرسوم المتحركة لفهم المسألة
              </Alert>
            </Box>

            {/* Animation Canvas */}
            {/* <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            /> */}

            <Box sx={{ mb: 3, p: 2, backgroundColor: "#fff3e0", borderRadius: 2 }}>
                الرسوم المتحركة قيد التطوير حالياً 🚧
            </Box>

            {/* Animation Control */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={startAnimation}
                disabled={isAnimating}
                sx={{ mr: 2 }}
              >
                {isAnimating ? "جاري العرض..." : "🎬 شاهد الرسوم المتحركة"}
              </Button>
              
              <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                اضغط لمشاهدة حل المسألة خطوة بخطوة
              </Typography>
            </Box>

            {/* Answer Input */}
            {!showResult && (
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h6">الإجابة:</Typography>
                <TextField
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="أدخل الإجابة"
                  type="number"
                  sx={{ minWidth: 120 }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      checkAnswer();
                    }
                  }}
                />
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  sx={{ fontSize: "1.1rem", px: 4 }}
                >
                  تحقق
                </Button>
              </Box>
            )}
          </Paper>

          {/* Result Message */}
          {showResult && (
            <Alert
              severity={isCorrect ? "success" : "error"}
              sx={{ mb: 3, fontSize: "1.1rem" }}
            >
              {isCorrect
                ? "🎉 ممتاز! لقد حللت المسألة بشكل صحيح!"
                : `❌ إجابة خاطئة. الإجابة الصحيحة: ${currentStory.answer}`}
              {isCorrect && streak >= 3 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  🔥 متتالية رائعة! نقاط إضافية!
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                {currentStory.question} = {currentStory.answer}
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* Game Complete */}
      {isGameComplete && (
        <Paper
          sx={{
            p: 4,
            mb: 3,
            backgroundColor: "#e8f5e8",
            border: "2px solid #4caf50",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#2e7d32", mb: 2, fontWeight: "bold" }}
          >
            🏆 تهانينا! لقد أنهيت قصص الرياضيات!
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            النتيجة النهائية: {score} نقطة
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            المستوى النهائي: {level} | أفضل متتالية: {streak}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={resetGame}
            sx={{ mt: 2 }}
          >
            لعب مرة أخرى
          </Button>
        </Paper>
      )}

      {/* Control Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          onClick={resetGame}
          size="large"
          color="secondary"
        >
          إعادة تشغيل
        </Button>

        {currentStory && !isGameComplete && (
          <Button
            variant="outlined"
            onClick={generateStory}
            size="large"
          >
            قصة جديدة
          </Button>
        )}
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          📚 تعلم حل المسائل الكلامية
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          📖 <strong>اقرأ بعناية:</strong> افهم القصة وحدد المعلومات المهمة
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🔍 <strong>ابحث عن الأرقام:</strong> حدد الأرقام والعمليات المطلوبة
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          🎬 <strong>تابع الرسوم:</strong> استخدم الرسوم المتحركة لفهم المسألة
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ✏️ <strong>احسب الإجابة:</strong> طبق العملية الحسابية المناسبة
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          💡 نصيحة: تخيل القصة في ذهنك وارسم الأشياء إذا احتجت!
        </Typography>
      </Box>
    </Box>
  );
};

export default StoryMath;
