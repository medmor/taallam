import { CourseType } from "@/types/CourseType";
import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
});

export const getEntries = async (
  locale: string,
  tag?: string
): Promise<CourseType[]> => {
  const query: any = {
    content_type: "course",
    locale,
    select: "sys.id, fields.title, fields.cardImage",
  };
  console.log(tag);
  if (tag) {
    query["metadata.tags.sys.id[all]"] = tag;
  }

  const { items } = await client.getEntries(query);

  //@ts-ignore
  return items;
};

export const getEntryById = async (
  id: string,
  locale: string
): Promise<CourseType> => {
  //@ts-ignore
  return await client.getEntry(id, { locale });
};

export const getAsset = async (id: string) => {
  return await client.getAsset(id);
};

export async function getImageUrl(id: string) {
  const asset = await getAsset(id);
  return asset.fields.file?.url;
}
