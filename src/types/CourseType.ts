import { Document } from "./RichText";

export interface CourseType {
  fields: {
    title: string;
    cardImage: {
      sys: {
        id: string;
      };
    };
    objectifs: string[];
    summary: Document;
    activities: Document;
  };
}
