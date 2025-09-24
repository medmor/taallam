// Basic Arabic vocabulary dataset with available images in /public/images/learn-names
export const vocabItems = [
  // Farm animals (have images)
  { id: 'cat', category: 'animals', word: 'قِطّ', letter: 'ق', image: '/images/learn-names/farm-animals/cat.png' },
  { id: 'chicken', category: 'animals', word: 'دَجاجَة', letter: 'د', image: '/images/learn-names/farm-animals/chicken.png' },
  { id: 'cow', category: 'animals', word: 'بَقَرَة', letter: 'ب', image: '/images/learn-names/farm-animals/cow.png' },
  { id: 'dog', category: 'animals', word: 'كَلْب', letter: 'ك', image: '/images/learn-names/farm-animals/dog.png' },
  { id: 'donkey', category: 'animals', word: 'حِمار', letter: 'ح', image: '/images/learn-names/farm-animals/donkey.png' },
  { id: 'duck', category: 'animals', word: 'بَطَّة', letter: 'ب', image: '/images/learn-names/farm-animals/duck.png' },
  { id: 'goat', category: 'animals', word: 'ماعِز', letter: 'م', image: '/images/learn-names/farm-animals/goat.png' },
  { id: 'horse', category: 'animals', word: 'حِصان', letter: 'ح', image: '/images/learn-names/farm-animals/horse.png' },
  { id: 'rabbit', category: 'animals', word: 'أرْنَب', letter: 'أ', image: '/images/learn-names/farm-animals/rabbit.png' },
  { id: 'sheep', category: 'animals', word: 'خَرُوف', letter: 'خ', image: '/images/learn-names/farm-animals/sheep.png' },

  // Fruits (have images)
  { id: 'apple', category: 'fruits', word: 'تُفّاحَة', letter: 'ت', image: '/images/learn-names/fruits/apple.png' },
  { id: 'banana', category: 'fruits', word: 'مَوْز', letter: 'م', image: '/images/learn-names/fruits/banana.png' },
  { id: 'cherry', category: 'fruits', word: 'كَرَز', letter: 'ك', image: '/images/learn-names/fruits/cherry.png' },
  { id: 'grapes', category: 'fruits', word: 'عِنَب', letter: 'ع', image: '/images/learn-names/fruits/grapes.png' },
  { id: 'orange', category: 'fruits', word: 'بُرْتُقال', letter: 'ب', image: '/images/learn-names/fruits/orange.png' },
  { id: 'peach', category: 'fruits', word: 'خَوْخ', letter: 'خ', image: '/images/learn-names/fruits/peach.png' },
  { id: 'pear', category: 'fruits', word: 'كُمَّثْرَى', letter: 'ك', image: '/images/learn-names/fruits/pear.png' },
  { id: 'pineapple', category: 'fruits', word: 'أَنَاناس', letter: 'أ', image: '/images/learn-names/fruits/pineapple.png' },
  { id: 'strawberry', category: 'fruits', word: 'فِراوِلَة', letter: 'ف', image: '/images/learn-names/fruits/strawberry.png' },
  { id: 'watermelon', category: 'fruits', word: 'بِطِّيخ', letter: 'ب', image: '/images/learn-names/fruits/watermelon.png' },
];

export const sentences = [
  { id: 's1', words: ['أَكَلَ', 'الْوَلَدُ', 'تُفّاحَةً'], translation: 'The boy ate an apple' },
  { id: 's2', words: ['ذَهَبْتُ', 'إِلَى', 'الْمَدْرَسَةِ'], translation: 'I went to school' },
  { id: 's3', words: ['الْقِطُّ', 'عَلى', 'الْكُرْسِيِّ'], translation: 'The cat is on the chair' },
  { id: 's4', words: ['يَلْعَبُ', 'الطِّفْلُ', 'بِالْكُرَةِ'], translation: 'The child plays with the ball' },
];

export const letters = Array.from(new Set(vocabItems.map(i => i.letter)));
