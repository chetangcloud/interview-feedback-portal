import type {
  Evaluation,
  InterviewDto,
  InterviewMode,
  NextQuestionDto,
  NoteSuggestionDto,
  QuestionDto,
  SummaryDto,
  TechnologyDto,
  TechSummaryDto,
} from "@/types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  stats: () =>
    request<{
      totalInterviews: number;
      totalQuestions: number;
      technologiesCovered: number;
      avgCorrectPercent: number;
    }>("/api/stats"),

  technologies: (q?: string) =>
    request<TechnologyDto[]>(`/api/technologies${q ? `?q=${encodeURIComponent(q)}` : ""}`),

  createInterview: (data: {
    candidateName: string;
    interviewerName: string;
    interviewType?: string;
    questionsPerTech?: number;
    totalItExperience?: number;
    relevantExperience?: number;
    primaryCloud?: string;
    secondaryCloud?: string;
    mode?: InterviewMode;
  }) =>
    request<InterviewDto>("/api/interviews", { method: "POST", body: JSON.stringify(data) }),

  listInterviews: (status?: string) =>
    request<InterviewDto[]>(`/api/interviews${status ? `?status=${status}` : ""}`),

  getInterview: (id: string) => request<InterviewDto>(`/api/interviews/${id}`),

  addTechnology: (interviewId: string, technologyName: string) =>
    request<InterviewDto>(`/api/interviews/${interviewId}/technologies`, {
      method: "POST",
      body: JSON.stringify({ technologyName }),
    }),

  nextQuestion: (interviewId: string) =>
    request<NextQuestionDto & { reason?: string }>(`/api/interviews/${interviewId}/questions/next`),

  submitFeedback: (
    interviewId: string,
    interviewQuestionId: string,
    data: { evaluation: Evaluation; note?: string }
  ) =>
    request<{
      technologyComplete: boolean;
      techStats: InterviewDto["technologies"][number];
      overall: InterviewDto["overall"];
    }>(`/api/interviews/${interviewId}/questions/${interviewQuestionId}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  completeInterview: (interviewId: string) =>
    request<InterviewDto>(`/api/interviews/${interviewId}/complete`, { method: "POST" }),

  generateSummary: (interviewId: string) =>
    request<SummaryDto>(`/api/interviews/${interviewId}/generate-summary`, { method: "POST" }),

  getSummary: (interviewId: string) => request<SummaryDto>(`/api/interviews/${interviewId}/summary`),

  generateTechSummary: (interviewId: string, technologyId: string) =>
    request<TechSummaryDto>(`/api/interviews/${interviewId}/technologies/${technologyId}/generate-summary`, {
      method: "POST",
    }),

  getTechSummary: (interviewId: string, technologyId: string) =>
    request<TechSummaryDto>(`/api/interviews/${interviewId}/technologies/${technologyId}/summary`),

  listNoteSuggestions: (technologyId: string, category?: string) =>
    request<NoteSuggestionDto[]>(
      `/api/note-suggestions?technologyId=${encodeURIComponent(technologyId)}${
        category ? `&category=${encodeURIComponent(category)}` : ""
      }`
    ),

  updateTechNotes: (interviewId: string, technologyId: string, notes: string) =>
    request<{ technologyId: string; freehandNotes: string | null }>(
      `/api/interviews/${interviewId}/technologies/${technologyId}/notes`,
      { method: "PATCH", body: JSON.stringify({ notes }) }
    ),

  // Question bank admin
  listQuestions: (params: {
    technologyId?: string;
    difficulty?: string;
    category?: string;
    search?: string;
    includeInactive?: boolean;
  }) => {
    const sp = new URLSearchParams();
    if (params.technologyId) sp.set("technologyId", params.technologyId);
    if (params.difficulty) sp.set("difficulty", params.difficulty);
    if (params.category) sp.set("category", params.category);
    if (params.search) sp.set("search", params.search);
    if (params.includeInactive) sp.set("includeInactive", "true");
    return request<(QuestionDto & { technology: TechnologyDto })[]>(`/api/questions?${sp.toString()}`);
  },

  createQuestion: (data: {
    technologyId: string;
    category: string;
    difficulty: string;
    questionText: string;
  }) => request<QuestionDto>("/api/questions", { method: "POST", body: JSON.stringify(data) }),

  updateQuestion: (id: string, data: Partial<{ category: string; difficulty: string; questionText: string; active: boolean }>) =>
    request<QuestionDto>(`/api/questions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteQuestion: (id: string) => request<{ deleted?: boolean }>(`/api/questions/${id}`, { method: "DELETE" }),

  createTechnology: (data: { name: string; description?: string }) =>
    request<TechnologyDto>("/api/technologies", { method: "POST", body: JSON.stringify(data) }),
};
