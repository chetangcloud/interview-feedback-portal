export type Evaluation = "correct" | "partially_correct" | "incorrect" | "skipped";
export type Difficulty = "easy" | "medium" | "hard";
export type InterviewStatus = "in_progress" | "completed" | "cancelled";
export type InterviewMode = "structured" | "freehand";

export type TechnologyDto = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type QuestionDto = {
  id: string;
  technologyId: string;
  category: string;
  difficulty: Difficulty;
  questionText: string;
  active: boolean;
};

export type TechStatsDto = {
  technologyId: string;
  name: string;
  questionCount: number;
  resolved: number;
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  skipped: number;
  score: number;
  completed: boolean;
  freehandNotes: string | null;
};

export type OverallStatsDto = {
  totalQuestions: number;
  resolved: number;
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  skipped: number;
  score: number;
};

export type TranscriptItemDto = {
  id: string;
  technologyId: string;
  technologyName: string;
  questionOrder: number;
  questionText: string;
  category: string;
  difficulty: Difficulty;
  evaluation: Evaluation | null;
  note: string | null;
  answeredAt: string | null;
};

export type InterviewDto = {
  id: string;
  candidateName: string;
  interviewerName: string;
  interviewType: string;
  questionsPerTech: number;
  totalItExperience: number | null;
  relevantExperience: number | null;
  primaryCloud: string | null;
  secondaryCloud: string | null;
  currentTechnologyId: string | null;
  mode: InterviewMode;
  status: InterviewStatus;
  startedAt: string;
  completedAt: string | null;
  technologies: TechStatsDto[];
  overall: OverallStatsDto;
  durationMinutes: number;
  transcript: TranscriptItemDto[];
};

export type NextQuestionDto = {
  done: true;
} | {
  done: false;
  interviewQuestionId: string;
  technologyId: string;
  technologyName: string;
  questionOrder: number;
  totalForTech: number;
  question: string;
  category: string;
  difficulty: Difficulty;
};

export type SummaryDto = {
  interviewId: string;
  summaryText: string;
  generatedBy: string;
  generatedAt: string;
};

export type NoteSuggestionDto = {
  id: string;
  technologyId: string;
  category: string;
  sentiment: "positive" | "negative";
  text: string;
};

export type TechSummaryDto = {
  interviewId: string;
  technologyId: string;
  technologyName: string;
  summaryText: string;
  generatedBy: string;
  generatedAt: string;
};
