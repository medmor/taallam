import { CourseType } from "@/types/CourseType";
import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
});

export const getEntries = async (
  contentId: string,
  locale: string,
  tag?: string,
): Promise<CourseType[]> => {
  const query: any = {
    content_type: contentId,
    locale,
    select: "sys.id, sys.createdAt, fields.title, fields.cardImage",
    order: "sys.createdAt",
  };

  if (tag) {
    query["metadata.tags.sys.id[all]"] = tag;
  }
  const { items } = await client.getEntries(query);

  return items as any;
};

export const getEntryById = async (
  id: string,
  locale: string,
): Promise<CourseType> => {
  //@ts-ignore
  return await client.getEntry(id, { locale });
};

export const getGames = async (locale: string) => {
  const query: any = {
    content_type: "game",
    locale,
    order: "sys.createdAt",
  };
  const { items } = await client.getEntries(query);

  return items as any;
};
