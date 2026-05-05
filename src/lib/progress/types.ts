export type FlashcardProgress = {
  bucket: number;
  nextDue: number;
};

export type ModuleProgress = {
  readComplete: boolean;
  lastVisitedAt?: string;
  lastQuizScore?: number;
  lastQuizAt?: string;
  quizAttempts: number;
  flashcards: Record<string, FlashcardProgress>;
};

export type ProgressState = {
  updatedAt: number;
  modules: Record<string, ModuleProgress>;
};
