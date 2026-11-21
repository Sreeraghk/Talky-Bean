import { GrammarExerciseType } from "../types";
import { ExerciseValidationError } from "./GrammarExerciseValidator";

export interface GenerationDiagnosticEvent {
  model: string;
  topicId: string;
  level: string;
  format: GrammarExerciseType;
  attempt: number;
  totalReceived: number;
  validCount: number;
  invalidCount: number;
  targetCount: number;
  failures: {
    rawIndex: number;
    errors: ExerciseValidationError[];
  }[];
  action: 'accepted' | 'requesting_regeneration' | 'exhausted_attempts_aborted';
  durationMs?: number;
}

/**
 * Diagnostic logger for grammar generation and validation lifecycles.
 * Outputs structured diagnostics to track model performance, failure modes,
 * and targeted regeneration without logging sensitive personal data.
 */
export class GrammarDiagnosticLogger {
  static logEvent(event: GenerationDiagnosticEvent): void {
    const summary = {
      tag: '[GrammarDiagnostic]',
      timestamp: new Date().toISOString(),
      model: event.model,
      topicId: event.topicId,
      level: event.level,
      format: event.format,
      attempt: event.attempt,
      counts: `${event.validCount}/${event.targetCount} valid (${event.invalidCount} invalid, ${event.totalReceived} raw received)`,
      action: event.action,
      durationMs: event.durationMs
    };

    if (event.action === 'accepted') {
      console.log(
        `%c[GrammarDiagnostic] Generation SUCCESS (${event.format}) Attempt #${event.attempt} — ${event.validCount}/${event.targetCount} valid exercises.`,
        'color: #10b981; font-weight: bold;',
        summary
      );
    } else if (event.action === 'requesting_regeneration') {
      console.warn(
        `[GrammarDiagnostic] Validation FAILED (${event.format}) Attempt #${event.attempt} — Only ${event.validCount}/${event.targetCount} valid. Requesting targeted regeneration for ${event.targetCount - event.validCount} exercise(s).`,
        {
          ...summary,
          failureDetails: event.failures.map(f => ({
            index: f.rawIndex,
            errors: f.errors.map(e => `${e.field}: ${e.message}`)
          }))
        }
      );
    } else {
      console.error(
        `[GrammarDiagnostic] Generation ABORTED (${event.format}) — All regeneration attempts exhausted. Missing ${event.targetCount - event.validCount} valid exercise(s). Module will NOT be saved.`,
        {
          ...summary,
          failureDetails: event.failures.map(f => ({
            index: f.rawIndex,
            errors: f.errors.map(e => `${e.field}: ${e.message}`)
          }))
        }
      );
    }
  }
}
