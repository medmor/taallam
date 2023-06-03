import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
});

export const getEntries = async (locale: string, tag?: string) => {
  const query: any = {
    content_type: "course",
    locale,
  };

  if (tag) {
    query["metadata.tags.sys.id[all]"] = tag;
  }

  const { items } = await client.getEntries(query);
  return items;
};

export const getEntryById = async (id: string) => {
  return await client.getEntry(id);
};

export const getAsset = async (id: string) => {
  return await client.getAsset(id);
};
