import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AIAnalysisOutputSchema, type AIAnalysisOutput } from "./schemas";

// ─── Client ───────────────────────────────────────────────────────────────────
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_MODEL = "claude-sonnet-4-5-20250929";
export const PROMPT_VERSION = "v1";

// ─── Prompt ───────────────────────────────────────────────────────────────────
// Defensive prompting principles applied:
//   1. Role assignment — the model understands the clinical context
//   2. Structured rubric — scores are grounded in specific observable behaviours
//   3. Conservative risk flagging — false positives are safer than false negatives
//   4. Output contract — explicit JSON shape with field descriptions
//   5. Grounding instruction — every score must cite transcript evidence

function buildAnalysisPrompt(transcript: string): string {
  return `You are an expert clinical supervisor for Shamiri, a Kenyan mental health organisation that delivers evidence-based group therapy to young people using a Tiered Care Model. You are reviewing a session conducted by a Shamiri Fellow (a trained lay provider, typically 18–22 years old).

Your task is to analyse the session transcript below and produce a structured quality assessment. Your output will be read by a human Supervisor who will validate or correct your findings — so be precise, cite evidence from the transcript, and flag uncertainty when it exists.

════════════════════════════════════════
SESSION TRANSCRIPT
════════════════════════════════════════
${transcript}
════════════════════════════════════════

GRADING RUBRIC — 3-Point Quality Index
────────────────────────────────────────

METRIC 1: Content Coverage (Did the Fellow teach the Growth Mindset material?)
  Score 1 – Missed:   Fellow failed to mention "Growth Mindset" OR defined it incorrectly
                      (e.g., claimed intelligence is fixed or innate).
  Score 2 – Partial:  Fellow mentioned the concept but moved on quickly without checking
                      for understanding or giving a concrete example.
  Score 3 – Complete: Fellow clearly explained the concept, gave a relatable example,
                      AND invited the group to share their thoughts or experiences.
  Look for: phrases like "brain is a muscle", "learning from failure", "effort matters more
  than talent", explicit questions checking comprehension.

METRIC 2: Facilitation Quality (Was the delivery empathetic, clear, and engaging?)
  Score 1 – Poor:      Fellow dominated the conversation (monologue), interrupted
                       participants, or used confusing jargon.
  Score 2 – Adequate:  Fellow was polite but transactional; stuck to the script without
                       deeper engagement or responsiveness to the group's emotional state.
  Score 3 – Excellent: Fellow was warm, encouraged quiet members to speak, and validated
                       feelings (e.g., "It sounds like that was really hard for you").
  Look for: open-ended questions ("What do you think?"), validation ("Thank you for sharing"),
  name-checking quieter participants, pausing for emotional responses.

METRIC 3: Protocol Safety (Did the Fellow stay within the Shamiri curriculum boundaries?)
  Score 1 – Violation:    Fellow gave unauthorised advice (medical, relationship, psychiatric)
                          OR strayed significantly off-topic in ways that could harm a participant.
  Score 2 – Minor Drift:  Fellow got distracted by a side conversation but eventually returned
                          to the Growth Mindset curriculum.
  Score 3 – Adherent:     Fellow stayed focused on the Shamiri curriculum and handled
                          distractions gracefully by redirecting to the topic.
  Look for: advice about medication, clinical diagnoses, romantic relationship counselling,
  or any content that falls outside a lay provider's training scope.

RISK DETECTION (Critical)
  Flag as RISK if ANY of the following appear in the transcript:
    • A participant expresses thoughts of self-harm, suicide, or harming others
    • A participant discloses active abuse (physical, sexual, emotional)
    • The Fellow responds to a crisis in a way that could escalate harm
      (e.g., minimising, dismissing, or giving harmful advice about a disclosed crisis)
    • The Fellow discloses their own mental health crisis inappropriately
  IMPORTANT: When in doubt, flag as RISK. A false positive is safer than a missed crisis.
  If RISK, extract the EXACT verbatim quote from the transcript that triggered the flag.
  If multiple triggers exist, quote the first one and describe the others in riskExplanation.

════════════════════════════════════════
OUTPUT INSTRUCTIONS
════════════════════════════════════════
Return ONLY a valid JSON object with this exact structure. Do not include markdown, code
fences, or any text outside the JSON object. Each justification field has a hard 500-character
limit — write concisely and stop before that limit.

Score-to-rating mapping — these pairs MUST be consistent:
  contentScore 1 → "Missed"     | 2 → "Partial"      | 3 → "Complete"
  facilitationScore 1 → "Poor"  | 2 → "Adequate"     | 3 → "Excellent"
  safetyScore 1 → "Violation"   | 2 → "Minor Drift"  | 3 → "Adherent"

For riskQuote and riskExplanation: use JSON null (not the string "null") when riskFlag is
"SAFE". These fields MUST be null whenever riskFlag is "SAFE".

{
  "summary": "<3 sentences: what the Fellow taught, how the group responded, and one standout moment>",

  "contentScore": <1 | 2 | 3>,
  "contentRating": "<Missed | Partial | Complete>",
  "contentJustification": "<1–3 sentences citing specific transcript evidence. HARD LIMIT: 500 characters total.>",

  "facilitationScore": <1 | 2 | 3>,
  "facilitationRating": "<Poor | Adequate | Excellent>",
  "facilitationJustification": "<1–3 sentences citing specific transcript evidence. HARD LIMIT: 500 characters total.>",

  "safetyScore": <1 | 2 | 3>,
  "safetyRating": "<Violation | Minor Drift | Adherent>",
  "safetyJustification": "<1–3 sentences citing specific transcript evidence. HARD LIMIT: 500 characters total.>",

  "riskFlag": "<SAFE | RISK>",
  "riskQuote": <verbatim transcript quote if RISK, or JSON null>,
  "riskExplanation": <brief explanation of the risk concern if RISK, or JSON null>
}`;
}

// ─── Retry Logic ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on validation errors — they won't fix themselves
      if (err instanceof z.ZodError) throw err;

      // Don't retry on auth errors
      if (lastError.message.includes("401") || lastError.message.includes("403")) {
        throw lastError;
      }

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // exponential back-off
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error("Unknown error after retries");
}

// ─── JSON Extraction ──────────────────────────────────────────────────────────
// Claude occasionally wraps JSON in markdown fences. This strips them.

function extractJSON(text: string): string {
  // Try to find a JSON object in the response
  const fenceMatch = new RegExp(/```(?:json)?\s*([\s\S]*?)```/).exec(text);
  if (fenceMatch) return fenceMatch[1].trim();

  const objectMatch = new RegExp(/\{[\s\S]*\}/).exec(text);
  if (objectMatch) return objectMatch[0];

  throw new Error("No JSON object found in AI response");
}

// ─── Main Analysis Function ───────────────────────────────────────────────────

export interface AnalysisResult extends AIAnalysisOutput {
  aiModel: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
}

export async function analyzeSession(transcript: string): Promise<AnalysisResult> {
  if (!transcript || transcript.trim().length < 100) {
    throw new Error("Transcript is too short to analyse meaningfully");
  }

  const prompt = buildAnalysisPrompt(transcript);

  const result = await withRetry(async () => {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      temperature: 0.2, // low temperature for consistent, deterministic scoring
      system:
        "You are a precise clinical quality assurance system. You output only valid JSON, never markdown or prose outside the JSON object.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (!rawText) {
      throw new Error("Empty response from AI model");
    }

    // Extract and parse JSON
    const jsonString = extractJSON(rawText);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${jsonString.slice(0, 200)}`);
    }

    // Validate against our Zod schema — this is the hard contract
    console.log("[AI] Raw response:", JSON.stringify(parsed, null, 2));
    const validated = AIAnalysisOutputSchema.parse(parsed);

    return {
      ...validated,
      aiModel: AI_MODEL,
      promptVersion: PROMPT_VERSION,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  });

  return result;
}
