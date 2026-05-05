export const MODULE_IDS = ["1", "2", "3", "4", "5", "6"] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export type ModuleSource = {
  label: string;
  url: string;
};

export type ModuleFrontmatter = {
  title: string;
  description?: string;
  lastReviewed: string;
  objectives: string[];
  sources?: ModuleSource[];
};

export type ModuleSummary = {
  id: ModuleId;
  slug: string;
  title: string;
  description: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  sourceUrl: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  sourceUrl?: string;
};

export type TocItem = {
  level: 2 | 3;
  text: string;
  slug: string;
};
