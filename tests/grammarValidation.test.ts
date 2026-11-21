import { GrammarExerciseValidator } from "../src/services/GrammarExerciseValidator";
import { GrammarDiagnosticLogger } from "../src/services/GrammarDiagnosticLogger";

// Simple test runner with assertions
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`, details || '');
  }
}

console.log("\n=======================================================");
console.log("RUNNING GRAMMAR VALIDATION & GENERATION UNIT TESTS");
console.log("=======================================================\n");

// --- 1. FILL-IN-THE-BLANK TESTS ---
console.log("--- 1. Testing 'fill-in-the-blank' format ---");

const validFillInTheBlank = {
  type: 'fill-in-the-blank',
  explanation: 'Der Dativ maskulin verlangt den Artikel "dem".',
  content: {
    sentence: 'Ich helfe [blank] Verkäufer im Baumarkt.',
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den', 'der', 'das']
  },
  vocabularyHints: [{ word: 'Verkäufer', translation: 'salesperson' }]
};

const validResult = GrammarExerciseValidator.validateExercise(validFillInTheBlank, 'fill-in-the-blank');
assert(validResult.isValid, "Valid fill-in-the-blank exercise passes validation");

// Missing placeholder
const missingPlaceholder = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich helfe dem Verkäufer im Baumarkt.',
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den', 'der']
  }
};
const missingResult = GrammarExerciseValidator.validateExercise(missingPlaceholder, 'fill-in-the-blank');
assert(!missingResult.isValid, "Missing [blank] placeholder is rejected");
assert(
  missingResult.errors.some(e => e.message.includes("Sentence must contain at least one literal '[blank]'")),
  "Detects missing [blank] error message"
);

// Malformed placeholder: Underscores
const underscorePlaceholder = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich helfe ___ Verkäufer im Baumarkt.',
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den', 'der']
  }
};
const underscoreResult = GrammarExerciseValidator.validateExercise(underscorePlaceholder, 'fill-in-the-blank');
assert(!underscoreResult.isValid, "Malformed '___' placeholder is rejected");
assert(
  underscoreResult.errors.some(e => e.message.includes("malformed placeholder '___'")),
  "Identifies '___' as malformed placeholder"
);

// Malformed placeholder: [...]
const dotsPlaceholder = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich helfe [...] Verkäufer im Baumarkt.',
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den', 'der']
  }
};
const dotsResult = GrammarExerciseValidator.validateExercise(dotsPlaceholder, 'fill-in-the-blank');
assert(!dotsResult.isValid, "Malformed '[...]' placeholder is rejected");

// Malformed placeholder: (blank)
const parenPlaceholder = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich helfe (blank) Verkäufer im Baumarkt.',
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den', 'der']
  }
};
const parenResult = GrammarExerciseValidator.validateExercise(parenPlaceholder, 'fill-in-the-blank');
assert(!parenResult.isValid, "Malformed '(blank)' placeholder is rejected");

// Placeholder count mismatch
const countMismatch = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich gebe [blank] Mann [blank] Hammer.',
    correctAnswers: ['dem'], // 2 blanks, only 1 answer!
    wordBank: ['dem', 'den']
  }
};
const countResult = GrammarExerciseValidator.validateExercise(countMismatch, 'fill-in-the-blank');
assert(!countResult.isValid, "Placeholder count mismatch (2 blanks, 1 answer) is rejected");
assert(
  countResult.errors.some(e => e.message.includes("Placeholder count mismatch")),
  "Detects placeholder count mismatch error message"
);

// Missing answer in wordBank
const missingBankAnswer = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich helfe [blank] Verkäufer.',
    correctAnswers: ['dem'],
    wordBank: ['den', 'der', 'das'] // 'dem' is missing!
  }
};
const bankResult = GrammarExerciseValidator.validateExercise(missingBankAnswer, 'fill-in-the-blank');
assert(!bankResult.isValid, "Missing correctAnswer in wordBank is rejected");
assert(
  bankResult.errors.some(e => e.message.includes("wordBank is missing required answer 'dem'")),
  "Detects missing word in wordBank"
);

// Overly long sentence (prompt echoing / runaway model hallucination)
const bloatedSentence = {
  type: 'fill-in-the-blank',
  explanation: 'Explanation text',
  content: {
    sentence: 'Ich helfe [blank] ' + 'Mann '.repeat(100),
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den']
  }
};
const bloatedSentenceResult = GrammarExerciseValidator.validateExercise(bloatedSentence, 'fill-in-the-blank');
assert(!bloatedSentenceResult.isValid, "Bloated runaway sentence (> 300 chars) is rejected");

// Overly long explanation
const bloatedExplanation = {
  type: 'fill-in-the-blank',
  explanation: 'Sehr lange Erklärung. '.repeat(50),
  content: {
    sentence: 'Ich helfe [blank] Mann.',
    correctAnswers: ['dem'],
    wordBank: ['dem', 'den']
  }
};
const bloatedExplanationResult = GrammarExerciseValidator.validateExercise(bloatedExplanation, 'fill-in-the-blank');
assert(!bloatedExplanationResult.isValid, "Bloated runaway explanation (> 500 chars) is rejected");

// --- 2. CHOOSE-CORRECT-SENTENCE TESTS ---
console.log("\n--- 2. Testing 'choose-correct-sentence' format ---");

const validChoice = {
  type: 'choose-correct-sentence',
  explanation: 'Only sentence A uses dem correctly.',
  content: {
    question: 'Welcher Satz ist grammatisch richtig im Dativ?',
    options: [
      'Ich helfe dem Mann beim Werkzeug.',
      'Ich helfe den Mann beim Werkzeug.',
      'Ich helfe das Mann beim Werkzeug.'
    ],
    correctAnswerIndex: 0
  }
};
const choiceResult = GrammarExerciseValidator.validateExercise(validChoice, 'choose-correct-sentence');
assert(choiceResult.isValid, "Valid choose-correct-sentence passes validation without needing [blank]");

// Out of bounds correctAnswerIndex
const invalidIndexChoice = {
  type: 'choose-correct-sentence',
  explanation: 'Explanation',
  content: {
    question: 'Welcher Satz?',
    options: ['Satz 1', 'Satz 2'],
    correctAnswerIndex: 5 // out of range!
  }
};
const invalidIndexResult = GrammarExerciseValidator.validateExercise(invalidIndexChoice, 'choose-correct-sentence');
assert(!invalidIndexResult.isValid, "Out of bounds correctAnswerIndex is rejected");

// Less than 2 options
const singleOptionChoice = {
  type: 'choose-correct-sentence',
  explanation: 'Explanation',
  content: {
    question: 'Welcher Satz?',
    options: ['Nur eine Option'],
    correctAnswerIndex: 0
  }
};
const singleOptionResult = GrammarExerciseValidator.validateExercise(singleOptionChoice, 'choose-correct-sentence');
assert(!singleOptionResult.isValid, "Fewer than 2 options is rejected");

// --- 3. MIX-AND-MATCH TESTS ---
console.log("\n--- 3. Testing 'mix-and-match' format ---");

const validMixMatch = {
  type: 'mix-and-match',
  explanation: 'Passende Dativformen.',
  content: {
    pairs: [
      { id: 'p1', left: 'dem Mann', right: 'Maskulin Dativ' },
      { id: 'p2', left: 'der Frau', right: 'Feminin Dativ' },
      { id: 'p3', left: 'dem Kind', right: 'Neutrum Dativ' }
    ]
  }
};
const mixResult = GrammarExerciseValidator.validateExercise(validMixMatch, 'mix-and-match');
assert(mixResult.isValid, "Valid mix-and-match passes validation");

// Duplicate pair IDs
const duplicateIdMix = {
  type: 'mix-and-match',
  explanation: 'Explanation',
  content: {
    pairs: [
      { id: 'p1', left: 'dem Mann', right: 'Maskulin' },
      { id: 'p1', left: 'der Frau', right: 'Feminin' } // Duplicate ID!
    ]
  }
};
const duplicateResult = GrammarExerciseValidator.validateExercise(duplicateIdMix, 'mix-and-match');
assert(!duplicateResult.isValid, "Duplicate pair IDs are rejected");

// --- 4. WORD-ORDER TESTS ---
console.log("\n--- 4. Testing 'word-order' format ---");

const validWordOrder = {
  type: 'word-order',
  explanation: 'Satzstellung mit Dativobjekt.',
  content: {
    question: 'I help the man in the store.',
    shuffledWords: ['Baumarkt', 'Ich', 'dem', 'helfe', 'Mann', 'im'],
    correctAnswers: ['Ich', 'helfe', 'dem', 'Mann', 'im', 'Baumarkt']
  }
};
const orderResult = GrammarExerciseValidator.validateExercise(validWordOrder, 'word-order');
assert(orderResult.isValid, "Valid word-order passes validation");

// Shuffled and correct words mismatch
const mismatchedWords = {
  type: 'word-order',
  explanation: 'Explanation',
  content: {
    question: 'I help the man.',
    shuffledWords: ['Ich', 'helfe', 'den', 'Mann'], // 'den' instead of 'dem'
    correctAnswers: ['Ich', 'helfe', 'dem', 'Mann']
  }
};
const mismatchResult = GrammarExerciseValidator.validateExercise(mismatchedWords, 'word-order');
assert(!mismatchResult.isValid, "Shuffled and correct words mismatch is rejected");

// --- 5. BATCH VALIDATION & SANITIZATION ---
console.log("\n--- 5. Testing Batch Validation & Vocabulary Hints Sanitizer ---");

const batchInput = [
  validFillInTheBlank, // valid
  missingPlaceholder,  // invalid
  validChoice,         // valid
  underscorePlaceholder // invalid
];

const batchOutcome = GrammarExerciseValidator.validateBatch(
  batchInput,
  'fill-in-the-blank',
  'topic-dative',
  'test-mod'
);

assert(batchOutcome.validExercises.length === 1, "Only valid exercises of targetType are accepted (1 valid fill-in-the-blank)");
assert(batchOutcome.invalidExercises.length === 3, "Invalid exercises are separated for targeted regeneration");

// Test vocabularyHints cleaner
const arrayHints = [{ word: 'Hammer', translation: 'hammer' }, { word: 'Nagel', translation: 'nail' }];
const cleanedObj = GrammarExerciseValidator.cleanVocabularyHints(arrayHints);
assert(cleanedObj['Hammer'] === 'hammer' && cleanedObj['Nagel'] === 'nail', "cleanVocabularyHints converts array to dictionary");

// --- 6. MALFORMED / EMPTY / NON-OBJECT RESPONSES ---
console.log("\n--- 6. Testing Malformed & Empty Inputs ---");

assert(!GrammarExerciseValidator.validateExercise(null, 'fill-in-the-blank').isValid, "Null exercise rejected");
assert(!GrammarExerciseValidator.validateExercise(undefined, 'fill-in-the-blank').isValid, "Undefined exercise rejected");
assert(!GrammarExerciseValidator.validateExercise("string", 'fill-in-the-blank').isValid, "Primitive string exercise rejected");
assert(!GrammarExerciseValidator.validateExercise({}, 'fill-in-the-blank').isValid, "Empty object exercise rejected");

const nonArrayBatch = GrammarExerciseValidator.validateBatch(
  "not-an-array" as any,
  'fill-in-the-blank',
  'topic-dative',
  'test-mod'
);
assert(!nonArrayBatch.allValid && nonArrayBatch.validExercises.length === 0, "Non-array raw input handled gracefully");

// --- 7. DIAGNOSTIC LOGGING TEST ---
console.log("\n--- 7. Testing Diagnostic Logging ---");
try {
  GrammarDiagnosticLogger.logEvent({
    model: 'gemini-3.5-flash',
    topicId: 'dative-case',
    level: 'A2',
    format: 'fill-in-the-blank',
    attempt: 1,
    totalReceived: 5,
    validCount: 3,
    invalidCount: 2,
    targetCount: 5,
    failures: batchOutcome.invalidExercises,
    action: 'requesting_regeneration',
    durationMs: 450
  });

  GrammarDiagnosticLogger.logEvent({
    model: 'gemini-3.5-flash',
    topicId: 'dative-case',
    level: 'A2',
    format: 'fill-in-the-blank',
    attempt: 2,
    totalReceived: 2,
    validCount: 5,
    invalidCount: 0,
    targetCount: 5,
    failures: [],
    action: 'accepted',
    durationMs: 320
  });

  GrammarDiagnosticLogger.logEvent({
    model: 'gemini-3.5-flash',
    topicId: 'dative-case',
    level: 'A2',
    format: 'fill-in-the-blank',
    attempt: 3,
    totalReceived: 2,
    validCount: 3,
    invalidCount: 2,
    targetCount: 5,
    failures: batchOutcome.invalidExercises,
    action: 'exhausted_attempts_aborted',
    durationMs: 890
  });
  assert(true, "Diagnostic logger emits events across all lifecycles without error");
} catch (logErr) {
  assert(false, "Diagnostic logger threw an error", logErr);
}

// --- 8. BOUNDED REGENERATION MERGE SIMULATION ---
console.log("\n--- 8. Simulating Bounded Regeneration Workflow ---");

// Attempt 1: Returns 3 valid, 2 invalid
const attempt1Raw = [
  validFillInTheBlank,
  { ...validFillInTheBlank, content: { ...validFillInTheBlank.content, sentence: 'Er gibt [blank] Frau die Schrauben.' } },
  { ...validFillInTheBlank, content: { ...validFillInTheBlank.content, sentence: 'Wir antworten [blank] Kunden.' } },
  missingPlaceholder,
  underscorePlaceholder
];

const attempt1Batch = GrammarExerciseValidator.validateBatch(attempt1Raw, 'fill-in-the-blank', 'topic-dative', 'mod1-a1');
const mergedPool = [...attempt1Batch.validExercises];
assert(mergedPool.length === 3, "Attempt 1 yields 3 valid exercises");

// Attempt 2: Targeted request for remaining 2 exercises
const attempt2Raw = [
  { ...validFillInTheBlank, content: { ...validFillInTheBlank.content, sentence: 'Sie dankt [blank] Kassierer.' } },
  { ...validFillInTheBlank, content: { ...validFillInTheBlank.content, sentence: 'Ich vertraue [blank] Meister.' } }
];

const attempt2Batch = GrammarExerciseValidator.validateBatch(attempt2Raw, 'fill-in-the-blank', 'topic-dative', 'mod1-a2');
for (const ex of attempt2Batch.validExercises) {
  if (mergedPool.length < 5) {
    mergedPool.push(ex);
  }
}

assert(mergedPool.length === 5, "Bounded regeneration successfully reaches 5 valid exercises without losing earlier valid items");

// --- SUMMARY ---
console.log("\n=======================================================");
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
