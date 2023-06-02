import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
});

export const getEntries = async (tag?: string) => {
  const query: any = {
    content_type: "course",
  };

  if (tag) {
    query["metadata.tags.sys.id[all]"] = tag;
  }

  const { items } = await client.getEntries(query);
  return items;
};

export const getEntryById = async (id: string) => {
  const { items } = await client.getEntries({
    "sys.id": id,
  });
  return items[0];
};
