import Anthropic from "@anthropic-ai/sdk";

const SECTION_RULES = `Generate the following sections, using these exact headings:

1. Overall Assessment
2. Strengths
3. Areas for Improvement
4. Final Recommendation

Possible recommendations:

- Strong Hire
- Hire
- Consider / Further Evaluation
- No Hire

Be conservative. If the provided feedback is insufficient to make a strong recommendation, explicitly say so in the Final Recommendation section — do not add a separate section for it.

STRICT LENGTH LIMITS — do not exceed these:
- Overall Assessment: 2-3 sentences max.
- Strengths: up to 3 bullet points, each under 12 words.
- Areas for Improvement: up to 3 bullet points, each under 12 words.
- Final Recommendation: one line with the recommendation, plus one short sentence of justification.

Total output must stay under 120 words. Use plain text with the numbered section headings above and "•" for bullets — no markdown tables, no extra sections, no preamble or closing remarks.`;

const STRUCTURED_SYSTEM_PROMPT = `You are a technical interview feedback assistant.

Generate a SHORT, professional interview summary based ONLY on the structured interview data provided.

Do not invent candidate skills, experience, technologies, or behavior.

Do not change the interviewer's evaluation.

The interviewer has classified each answer as:
- Correct
- Partially Correct
- Incorrect

Use interviewer notes as additional context.

${SECTION_RULES}

Do not claim that the candidate demonstrated something that is not supported by the interview data.`;

const FREEHAND_SYSTEM_PROMPT = `You are a technical interview feedback assistant.

The interviewer typed these notes quickly during a live interview, technology by technology, without following a fixed question list. The notes may contain typos, shorthand, or grammar mistakes — silently correct obvious typos and grammar without changing the meaning, and without commenting on the correction.

The interviewer's notes are the only source of truth. Do not invent candidate skills, experience, or behavior beyond what is written. Do not independently judge whether an answer was technically correct — only organize and summarize what the interviewer actually recorded.

${SECTION_RULES}

If a technology's notes are empty or too sparse to say anything meaningful, state that plainly rather than inferring content.`;

export type AiSummaryTechnology = {
  name: string;
  questions: {
    question: string;
    evaluation: "correct" | "partially_correct" | "incorrect";
    note: string | null;
  }[];
};

export type AiSummaryInput = {
  candidate: string;
  interviewer: string;
  technologies: AiSummaryTechnology[];
};

export type FreehandSummaryTechnology = {
  name: string;
  notes: string;
};

export type FreehandSummaryInput = {
  candidate: string;
  interviewer: string;
  technologies: FreehandSummaryTechnology[];
};

export class AiSummaryUnavailableError extends Error {}

async function callClaude(systemPrompt: string, userPayload: unknown): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiSummaryUnavailableError(
      "AI summary generation is not configured. Set ANTHROPIC_API_KEY on the server."
    );
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

  const message = await client.messages.create({
    model,
    max_tokens: 400,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Here is the interview data:\n\n${JSON.stringify(userPayload, null, 2)}`,
      },
    ],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("AI summary generation returned an empty response.");
  }

  return text;
}

export async function generateAiSummary(input: AiSummaryInput): Promise<string> {
  return callClaude(STRUCTURED_SYSTEM_PROMPT, {
    candidate: input.candidate,
    interviewer: input.interviewer,
    technologies: input.technologies,
  });
}

export async function generateFreehandSummary(input: FreehandSummaryInput): Promise<string> {
  return callClaude(FREEHAND_SYSTEM_PROMPT, {
    candidate: input.candidate,
    interviewer: input.interviewer,
    technologies: input.technologies,
  });
}
