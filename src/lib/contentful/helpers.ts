import { getAsset } from "./client";
import { ImageAsset } from "@/types/CourseType";
import { BLOCKS, Block } from "@/types/RichText";

import {
  EmptyQuiz,
  Quiz,
  QuizCategory,
  QuizCategoryConsts,
} from "@/types/QuizType";

export async function getImageUrl(img: ImageAsset, locale: string) {
  if (locale == "en") return img.fields.file.url;
  //@ts-ignore
  const asset: ImageAsset = await getAsset(img.sys.id);
  return asset.fields.file.url;
}

export async function parseSummary(
  document: any,
  texts: any[],
  medias: any[],
  audios: any[]
) {
  for (let i = 0; i < document.content.length; i++) {
    const block = document.content[i];

    if (block.nodeType == BLOCKS.PARAGRAPH) {
      const value = getValue(block).trim();
      if (value) texts.push(value);
    } else if (block.nodeType == BLOCKS.QUOTE) {
      const value = getValue(block.content[0]).trim();
      if (value.startsWith("component?")) {
        const data = value.split("?");
        medias.push({
          type: "component",
          component: data[1],
          properties: data[2],
        });
      } else if (value.startsWith("image?")) {
        const data = value.split("?");
        medias.push({
          type: "image",
          src: data[1],
          alt: data[2],
        });
      } else if (value.startsWith("audio?")) {
        const times = value
          .split("?")[1]
          .split(",")
          .map((t: string) => {
            const limits = t.split("-");
            return {
              start: Number(limits[0]),
              end: Number(limits[1]),
            };
          });
        audios.push(times);
      }
    }
  }
}

export function parseQuizzes(doc: Block, quizzes: any[] = []): Quiz[] {
  const lines = getAllDocLines(doc);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let start = line.substring(0, 3);
    if (isQuestion(start)) {
      const quiz = EmptyQuiz();
      quiz.category = start as QuizCategory;
      quiz.question = line.replace(start + "-", "").trim();
      let j = i + 1;
      start = lines[j].substring(0, 3);
      while (lines[j] && !isQuestion(start)) {
        if (lines[j].endsWith("===")) {
          quiz.answer = lines[j].replace("===", "");
        } else {
          if (lines[j].length > 0) quiz.choices.push(lines[j]);
        }
        j++;
        if (lines[j]) start = lines[j].substring(0, 3);
      }
      i = j - 1;
      quizzes.push(quiz);
    }
  }
  return quizzes;
}

export function getAllDocLines(doc: Block) {
  let lines = [];
  for (let i = 0; i < doc.content.length; i++) {
    lines.push(getValue(doc.content[i] as any).trim());
  }
  return lines;
}

function isQuestion(start: string) {
  return start == "mcq";
  //return start in QuizCategoryConsts;
}
function getValue(block: Block) {
  if (block.content.length > 1) {
    let value = "";
    for (let i = 0; i < block.content.length; i++) {
      value += (block.content[i] as any).value;
    }
    return value;
  }
  return (block as any).content[0].value;
}
const d = {"containersNames":"triangle,square,circle,rectangle,star","containersCount":"2,4","itemComponent":"Shapes","itemComponentProps":{"shape":"","color":"","size":"","iconOnly":"true"}}