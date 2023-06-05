export type QuizCategory = "mcq" | "tof" | "order";
export const QuizCategoryConsts = {
  mcq: "mcq",
  tof: "tof",
  order: "order",
};
export interface Quiz {
  question: string;
  choices: string[];
  answer: string;
}
export function EmptyQuiz(): Quiz {
  return {
    question: "",
    choices: [],
    answer: "",
  };
}
