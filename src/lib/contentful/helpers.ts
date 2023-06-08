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
  images: any[],
  audios: any[]
) {
  for (let i = 0; i < document.content.length; i++) {
    const content = document.content[i];
    if (content.nodeType == BLOCKS.PARAGRAPH) {
      texts.push(content.content[0].value);
    } else if (content.nodeType == BLOCKS.EMBEDDED_ASSET) {
      const asset = await getAsset(content.data.target.sys.id);
      if (asset.fields.file?.details.image) {
        images.push({
          src: asset.fields.file?.url!,
          alt: asset.fields.title!,
        });
      } else {
        audios.push(asset.fields.file?.url);
        audios.push(asset.fields.description?.split(" "));
      }
    } else {
      await parseSummary(content, texts, images, audios);
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
          quiz.choices.push(lines[j]);
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

export function getAllDocLines(doc: Block, lines: string[] = []) {
  for (let i = 0; i < doc.content.length; i++) {
    let node = doc.content[i];
    if (node.nodeType == "text") {
      const text = node.value.trim();
      if (text.length) lines.push(text);
    } else {
      getAllDocLines(node as any, lines);
    }
  }
  return lines;
}

export function isQuestion(start: string) {
  return start in QuizCategoryConsts;
}
