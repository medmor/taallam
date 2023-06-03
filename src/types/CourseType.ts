import { Document } from "./RichText";

export interface CourseType {
  fields: {
    title: string;
    cardImage: ImageAsset;
    objectifs: string[];
    summary: Document;
    activities: Document;
  };
}
export interface ImageAsset {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    file: {
      url: string;
    };
  };
}
