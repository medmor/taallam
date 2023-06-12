import { Document } from "./RichText";

export interface CourseType {
  fields: {
    title: string;
    objectifs: string[];
    summary: Document;
    activities: Document;
  };
  sys: {
    id: string;
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
