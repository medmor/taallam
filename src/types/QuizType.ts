export type QuizCategory = "mcq" | "tof" | "ord"; // needs t0 be 3 length string for parsing puspose
export const QuizCategoryConsts = {
  mcq: "mcq",
  tof: "tof",
  ord: "ord",
};
export interface Quiz {
  question: string;
  choices: string[];
  answer: string;
  category: QuizCategory;
}
export function EmptyQuiz(): Quiz {
  return {
    question: "",
    choices: [],
    answer: "",
    category: "mcq",
  };
}
