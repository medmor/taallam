// Basic dataset for science learning path (animals, plants, weather, body, senses, physics, water cycle)
export const animals = [
  // Only include animals we are confident have images/sounds; add others later as assets are confirmed
  { id: 'cat', name: 'قطة', soundLabel: 'مواء', imageFolder: 'farm-animals', file: 'cat.png', soundFile: 'cat.mp3' },
  { id: 'dog', name: 'كلب', soundLabel: 'نباح', imageFolder: 'farm-animals', file: 'dog.png', soundFile: 'dog.mp3' },
  { id: 'cow', name: 'بقرة', soundLabel: 'خوار', imageFolder: 'farm-animals', file: 'cow.png', soundFile: 'cow.mp3' },
  { id: 'sheep', name: 'خروف', soundLabel: 'ثغاء', imageFolder: 'farm-animals', file: 'sheep.png', soundFile: 'sheep.mp3' },
  { id: 'chicken', name: 'دجاجة', soundLabel: 'صوت الدجاج', imageFolder: 'farm-animals', file: 'chicken.png', soundFile: 'chicken.mp3' },
  { id: 'donkey', name: 'حمار', soundLabel: 'نهيق', imageFolder: 'farm-animals', file: 'donkey.png', soundFile: 'donkey.mp3' }
  // Future: lion, horse, fox, etc (wild-animals)
];

export const plantParts = [
  { id: 'root', name: 'جذر', function: 'امتصاص الماء' },
  { id: 'stem', name: 'ساق', function: 'دعم ونقل العصارة' },
  { id: 'leaf', name: 'ورقة', function: 'صنع الغذاء (تمثيل ضوئي)' },
  { id: 'flower', name: 'زهرة', function: 'إنتاج البذور' }
];

export const weatherStates = [
  { id: 'sunny', name: 'مشمس', clothing: 'قبعة ونظارة شمسية' },
  { id: 'rainy', name: 'ممطر', clothing: 'معطف مطر ومظلة' },
  { id: 'cloudy', name: 'غائم', clothing: 'ملابس عادية' },
  { id: 'snowy', name: 'مثلج', clothing: 'معطف ثقيل وقفازات' }
];

export const bodyParts = [
  { id: 'head', name: 'رأس', function: 'مركز التحكم (الدماغ)' },
  { id: 'hand', name: 'يد', function: 'اللمس والإمساك' },
  { id: 'eye', name: 'عين', function: 'الرؤية' },
  { id: 'ear', name: 'أذن', function: 'السمع' },
  { id: 'leg', name: 'رجل', function: 'الحركة والمشي' }
];

export const senses = [
  { id: 'sight', name: 'البصر', organ: 'العين' },
  { id: 'hearing', name: 'السمع', organ: 'الأذن' },
  { id: 'smell', name: 'الشم', organ: 'الأنف' },
  { id: 'taste', name: 'التذوق', organ: 'اللسان' },
  { id: 'touch', name: 'اللمس', organ: 'الجلد' }
];

export const magnetism = [
  { id: 'nail', name: 'مسمار', magnetic: true },
  { id: 'coin', name: 'عملة', magnetic: false },
  { id: 'paperclip', name: 'مشبك', magnetic: true },
  { id: 'plastic', name: 'بلاستيك', magnetic: false }
];

export const waterCycle = [
  { id: 'evaporation', name: 'التبخر', order: 1 },
  { id: 'condensation', name: 'التكاثف', order: 2 },
  { id: 'precipitation', name: 'هطول', order: 3 },
  { id: 'collection', name: 'تجمع', order: 4 }
];
