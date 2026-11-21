import { ReadingService } from '../src/services/ReadingService';
import { getPremadeFallbackPassage, PREMADE_PASSAGES } from '../src/data/readingPassages';
import { AiService } from '../src/services/AiService';
import { ReadingModule } from '../src/types';

// Mock localStorage for Node.js test environment
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  details?: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests() {
  console.log("=== TALKY BEAN: READING MODULE RELIABILITY TEST SUITE ===");

  // Test 1: Successful AI module generation with valid mock
  try {
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async (params: any) => {
          const prompt = params.contents[0].parts[0].text;
          if (prompt.includes("feature article") || prompt.includes("OUTPUT SCHEMA: { \"title\"") || prompt.includes("retrieve_passage")) {
            return {
              text: JSON.stringify({
                title: "Der Solarenergie-Boom",
                text: "Deutschland verzeichnet ein beachtliches Wachstum bei der Installation von Solarmodulen. Auf vielen Daechern im ganzen Land entstehen neue Photovoltaikanlagen, die saubere Energie liefern und den CO2-Ausstoss nachhaltig senken."
              })
            };
          }
          if (prompt.includes("Vocabulary Extraction") || prompt.includes("extract_and_translate")) {
            return {
              text: JSON.stringify({
                items: [
                  { original: "Solarmodulen", translation: "solar panels" },
                  { original: "Wachstum", translation: "growth" },
                  { original: "Photovoltaikanlagen", translation: "photovoltaic systems" }
                ]
              })
            };
          }
          if (prompt.includes("Question Generation") || prompt.includes("generate_all_questions")) {
            return {
              text: JSON.stringify({
                mcqQuestions: [
                  { question: "Was verzeichnet Deutschland?", options: ["Wachstum bei Solarenergie", "Rueckgang", "Stagnation", "Nichts"], correctAnswerIndex: 0, explanation: "Text sagt beachtliches Wachstum." },
                  { question: "Wo entstehen neue Anlagen?", options: ["Auf Daechern", "Unter der Erde", "Im Weltall", "In Hoehlen"], correctAnswerIndex: 0, explanation: "Auf vielen Daechern." },
                  { question: "Was liefern die Anlagen?", options: ["Saubere Energie", "Oel", "Kohle", "Gas"], correctAnswerIndex: 0, explanation: "Liefern saubere Energie." },
                  { question: "Was senken die Anlagen?", options: ["CO2-Ausstoss", "Einnahmen", "Bevoelkerung", "Wassertemperatur"], correctAnswerIndex: 0, explanation: "Senken den CO2-Ausstoss." },
                  { question: "Wie ist das Wachstum?", options: ["Beachtlich", "Gering", "Negativ", "Null"], correctAnswerIndex: 0, explanation: "Ein beachtliches Wachstum." }
                ],
                tfQuestions: [
                  { question: "Solarmodule liefern saubere Energie.", options: ["Richtig", "Falsch"], correctAnswerIndex: 0, explanation: "Bestaetigt im Text." },
                  { question: "Deutschland baut keine Photovoltaikanlagen mehr.", options: ["Richtig", "Falsch"], correctAnswerIndex: 1, explanation: "Im Gegenteil, es gibt Wachstum." },
                  { question: "Der Ausstoss von CO2 wird gesenkt.", options: ["Richtig", "Falsch"], correctAnswerIndex: 0, explanation: "Laut Text nachhaltig gesenkt." },
                  { question: "Anlagen entstehen auf Daechern.", options: ["Richtig", "Falsch"], correctAnswerIndex: 0, explanation: "Explizit im Text erwaehnt." },
                  { question: "Die Energieerzeugung ist fossil.", options: ["Richtig", "Falsch"], correctAnswerIndex: 1, explanation: "Es ist saubere Sonnenenergie." }
                ]
              })
            };
          }
          return { text: "{}" };
        }
      }
    } as any);

    const module = await ReadingService.generateReadingModule('B1', 'de', 1);
    assert(module.level === 'B1', 'Level should be B1');
    assert(module.exercises.length === 2, 'Should have 2 exercises (MCQ and TF)');
    assert(module.exercises[0].questions.length === 5, 'Exercise 1 should have 5 questions');
    assert(module.exercises[1].questions.length === 5, 'Exercise 2 should have 5 questions');
    assert(Object.keys(module.exercises[0].vocabularyHints).length > 0, 'Vocabulary hints should be populated');
    assert(module.isFallback !== true, 'Should be generated content, not fallback');

    testResults.push({ id: 1, name: "Successful AI module generation", passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 1, name: "Successful AI module generation", passed: false, details: err.message });
  }

  // Test 2: Gemini 503 followed by successful retry
  try {
    const originalGetClient = AiService.getClient;
    let callCount = 0;
    AiService.getClient = () => ({
      models: {
        generateContent: async (params: any) => {
          callCount++;
          if (callCount === 1) {
            // First call fails with 503
            const err: any = new Error("503 Service Unavailable: High model demand");
            throw err;
          }
          // Subsequent calls succeed
          const prompt = params.contents[0].parts[0].text;
          if (prompt.includes("feature article") || prompt.includes("OUTPUT SCHEMA: { \"title\"") || prompt.includes("retrieve_passage")) {
            return {
              text: JSON.stringify({
                title: "Wiederholungstest",
                text: "Ein Text ueber erfolgreiche Wiederholungsmechanismen und Resilienz."
              })
            };
          }
          if (prompt.includes("Vocabulary Extraction") || prompt.includes("extract_and_translate")) {
            return { text: JSON.stringify({ items: [{ original: "Wiederholung", translation: "repetition" }] }) };
          }
          return {
            text: JSON.stringify({
              mcqQuestions: Array(5).fill({ question: "Frage", options: ["A", "B", "C", "D"], correctAnswerIndex: 0, explanation: "Text" }),
              tfQuestions: Array(5).fill({ question: "Aussage", options: ["Richtig", "Falsch"], correctAnswerIndex: 0, explanation: "Text" })
            })
          };
        }
      }
    } as any);

    const module = await ReadingService.generateReadingModule('A2', 'de', 2);
    assert(callCount > 1, `Should have retried after 503 (calls: ${callCount})`);
    assert(module.theme === "Wiederholungstest", "Module should be generated from retry");

    testResults.push({ id: 2, name: 'Gemini "503" followed by successful retry', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 2, name: 'Gemini "503" followed by successful retry', passed: false, details: err.message });
  }

  // Test 3: Gemini 429 and retry-budget exhaustion
  try {
    const originalGetClient = AiService.getClient;
    let callAttempts = 0;
    AiService.getClient = () => ({
      models: {
        generateContent: async () => {
          callAttempts++;
          const err: any = new Error("429 Too Many Requests: Resource has been exhausted");
          throw err;
        }
      }
    } as any);

    // Should exhaust retries and fall back to precompiled passage
    const module = await ReadingService.generateReadingModule('A1', 'de', 3);
    assert(callAttempts >= 3, `Should have attempted bounded retries before fallback (attempts: ${callAttempts})`);
    assert(module.isFallback === true, 'Should activate precompiled fallback after retry exhaustion');
    assert(module.level === 'A1', 'Fallback module should match A1 level');

    testResults.push({ id: 3, name: 'Gemini "429" and retry-budget exhaustion -> Fallback', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 3, name: 'Gemini "429" and retry-budget exhaustion -> Fallback', passed: false, details: err.message });
  }

  // Test 4: Network timeout
  try {
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async () => {
          const err: any = new Error("NetworkError: fetch timeout after 15000ms");
          err.code = "NETWORK_TIMEOUT";
          throw err;
        }
      }
    } as any);

    const module = await ReadingService.generateReadingModule('A2', 'de', 4);
    assert(module.isFallback === true, 'Network timeout should activate safe precompiled fallback');
    assert(module.level === 'A2', 'Fallback matches requested level');

    testResults.push({ id: 4, name: 'Network timeout handling', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 4, name: 'Network timeout handling', passed: false, details: err.message });
  }

  // Test 5: Invalid or truncated vocabulary JSON
  try {
    // 5a. Safe JSON parse repair of truncated JSON
    const truncated1 = '{"items": [{"original": "Kaffee", "translation": "coffee"}, {"original": "Tee", "translation": "tea"';
    const parsed1 = ReadingService.safeParseJson(truncated1);
    assert(Array.isArray(parsed1.items), 'Safe parser should repair truncated JSON array');
    assert(parsed1.items[0].original === 'Kaffee', 'First item should be preserved');

    // 5b. Safe JSON parse of markdown fenced JSON with trailing commas
    const fenced = '```json\n{"title": "Muster", "count": 10, }\n```';
    const parsed2 = ReadingService.safeParseJson(fenced);
    assert(parsed2.title === "Muster", 'Safe parser handles markdown fences and trailing commas');

    // 5c. Broken vocab extraction does not fail reading module
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async (params: any) => {
          const prompt = params.contents[0].parts[0].text;
          if (prompt.includes("feature article") || prompt.includes("OUTPUT SCHEMA: { \"title\"") || prompt.includes("retrieve_passage")) {
            return {
              text: JSON.stringify({
                title: "Robuste Passagen",
                text: "Dies ist ein vollstaendiger Text fuer Leseverstaendnis, der erhalten bleibt, selbst wenn Vokabeln fehlschlagen."
              })
            };
          }
          if (prompt.includes("Vocabulary Extraction") || prompt.includes("extract_and_translate")) {
            // Return completely invalid non-JSON output
            return { text: "MALFORMED_NON_JSON_CORRUPT" };
          }
          return {
            text: JSON.stringify({
              mcqQuestions: Array(5).fill({ question: "Frage?", options: ["A", "B", "C", "D"], correctAnswerIndex: 0, explanation: "Text" }),
              tfQuestions: Array(5).fill({ question: "Wahr?", options: ["Richtig", "Falsch"], correctAnswerIndex: 0, explanation: "Text" })
            })
          };
        }
      }
    } as any);

    const module = await ReadingService.generateReadingModule('B1', 'de', 5);
    assert(module.theme === "Robuste Passagen", 'Module should succeed even if vocabulary fails');
    assert(module.exercises[0].questions.length === 5, 'Questions should still be generated');

    testResults.push({ id: 5, name: 'Invalid or truncated vocabulary JSON resilience', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 5, name: 'Invalid or truncated vocabulary JSON resilience', passed: false, details: err.message });
  }

  // Test 6: Successful fallback using a passage matching requested CEFR level
  try {
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async () => {
          throw new Error("503 Service Unavailable");
        }
      }
    } as any);

    const fallbackDeA1 = await ReadingService.generateReadingModule('A1', 'de', 1);
    assert(fallbackDeA1.isFallback === true, 'Should be marked as fallback');
    assert(fallbackDeA1.level === 'A1', 'Fallback should strictly match A1');
    assert(fallbackDeA1.exercises.length === 2, 'Fallback should have 2 exercises');
    assert(fallbackDeA1.exercises[0].questions.length >= 3, 'Fallback has precompiled questions');

    const fallbackEsA1 = await ReadingService.generateReadingModule('A1', 'es', 1);
    assert(fallbackEsA1.isFallback === true, 'Spanish fallback should be marked');
    assert(fallbackEsA1.level === 'A1', 'Spanish fallback should match A1');
    assert(fallbackEsA1.theme.includes("Mi Día"), 'Spanish A1 fallback should match title');

    testResults.push({ id: 6, name: 'Successful fallback using matching CEFR level', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 6, name: 'Successful fallback using matching CEFR level', passed: false, details: err.message });
  }

  // Test 7: No matching fallback passage -> throws descriptive recoverable error
  try {
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async () => {
          throw new Error("429 Quota exhausted");
        }
      }
    } as any);

    let errorThrown: any = null;
    try {
      // Gaelic ('ga') or Japanese ('ja') has no precompiled passages in PREMADE_PASSAGES
      await ReadingService.generateReadingModule('C1', 'ga' as any, 1);
    } catch (e: any) {
      errorThrown = e;
    }

    assert(errorThrown !== null, 'Should throw when no fallback passage is available');
    assert(errorThrown.code === 'NO_FALLBACK', `Error code should be NO_FALLBACK, got: ${errorThrown?.code}`);
    assert(errorThrown.message.includes("no precompiled fallback passage is available"), 'Should provide helpful recoverable error');

    testResults.push({ id: 7, name: 'No matching fallback passage recoverable error', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 7, name: 'No matching fallback passage recoverable error', passed: false, details: err.message });
  }

  // Test 8: "401" unauthenticated request -> must NOT bypass or fallback
  try {
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async () => {
          const authError: any = new Error("Authentication required. Please sign in.");
          authError.status = 401;
          authError.code = 'UNAUTHORIZED';
          throw authError;
        }
      }
    } as any);

    let authCaught = false;
    try {
      await ReadingService.generateReadingModule('A1', 'de', 1);
    } catch (err: any) {
      authCaught = (err.status === 401 || err.code === 'UNAUTHORIZED');
    }

    assert(authCaught, '401 Unauthorized must be strictly propagated and never bypassed by fallback');

    testResults.push({ id: 8, name: '"401" unauthenticated request rejection', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 8, name: '"401" unauthenticated request rejection', passed: false, details: err.message });
  }

  // Test 9: "403" age-unconfirmed request -> must NOT bypass or fallback
  try {
    const originalGetClient = AiService.getClient;
    AiService.getClient = () => ({
      models: {
        generateContent: async () => {
          const ageError: any = new Error("18+ Adult eligibility required.");
          ageError.status = 403;
          ageError.code = 'AGE_CONFIRMATION_REQUIRED';
          ageError.requiresAgeConfirmation = true;
          throw ageError;
        }
      }
    } as any);

    let ageCaught = false;
    try {
      await ReadingService.generateReadingModule('A1', 'de', 1);
    } catch (err: any) {
      ageCaught = (err.status === 403 || err.code === 'AGE_CONFIRMATION_REQUIRED' || err.requiresAgeConfirmation === true);
    }

    assert(ageCaught, '403 Age eligibility requirement must be strictly enforced and never bypassed by fallback');

    testResults.push({ id: 9, name: '"403" age-unconfirmed request rejection', passed: true });
    AiService.getClient = originalGetClient;
  } catch (err: any) {
    testResults.push({ id: 9, name: '"403" age-unconfirmed request rejection', passed: false, details: err.message });
  }

  // Test 10: Duplicate retry prevention and preservation of reading progress
  try {
    // 10a. Save a completed module with score 90%
    const moduleV1: ReadingModule = {
      id: 'rm-A1-1-initial',
      level: 'A1',
      moduleNumber: 1,
      theme: 'Meine Stadt',
      exercises: [],
      isCompleted: true,
      maxScore: 10,
      score: 90,
      createdAt: Date.now()
    };
    ReadingService.saveModule('de', moduleV1);

    const saved1 = ReadingService.getSavedModules('de');
    assert(saved1.length === 1, 'Should have exactly 1 saved module');
    assert(saved1[0].score === 90, 'Initial score should be 90');

    // 10b. Re-saving or regenerating the same module number should preserve completion & highest score
    const moduleV2: ReadingModule = {
      id: 'rm-A1-1-regenerated',
      level: 'A1',
      moduleNumber: 1,
      theme: 'Meine Stadt - Erneuert',
      exercises: [],
      isCompleted: false,
      maxScore: 10,
      score: 70,
      createdAt: Date.now()
    };
    ReadingService.saveModule('de', moduleV2);

    const saved2 = ReadingService.getSavedModules('de');
    assert(saved2.length === 1, 'Duplicate moduleNumber should NOT create duplicate module entries');
    assert(saved2[0].isCompleted === true, 'Previous completed status should be preserved');
    assert(saved2[0].score === 90, 'Highest score should be preserved (90 vs 70)');

    testResults.push({ id: 10, name: 'Duplicate retry prevention and preservation of reading progress', passed: true });
  } catch (err: any) {
    testResults.push({ id: 10, name: 'Duplicate retry prevention and preservation of reading progress', passed: false, details: err.message });
  }

  // Test 11: Valid questions, answer keys, and vocabulary output
  try {
    const rawQuestions = [
      { question: "Was ist Berlin?", options: ["Hauptstadt", "Ein Fluss", "Ein Berg", "Ein See"], correctAnswerIndex: 0, explanation: "Berlin ist die Hauptstadt." },
      { question: "Unvollstaendige Frage", options: ["Nur eine Option"], correctAnswerIndex: 99, explanation: "" }
    ];

    const sanitized = (ReadingService as any).sanitizeQuestions(rawQuestions, 'mcq', 'de');
    assert(sanitized.length === 5, 'Should guarantee exactly 5 valid questions');
    sanitized.forEach((q: any, idx: number) => {
      assert(typeof q.question === 'string' && q.question.length > 0, `Question ${idx} must have text`);
      assert(Array.isArray(q.options) && q.options.length >= 2, `Question ${idx} must have at least 2 options`);
      assert(q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.options.length, `Question ${idx} correctAnswerIndex within bounds`);
      assert(typeof q.explanation === 'string' && q.explanation.length > 0, `Question ${idx} must have explanation`);
    });

    testResults.push({ id: 11, name: 'Valid questions, answer keys, and vocabulary output', passed: true });
  } catch (err: any) {
    testResults.push({ id: 11, name: 'Valid questions, answer keys, and vocabulary output', passed: false, details: err.message });
  }

  // Test 12: Existing reading module functionality remaining intact
  try {
    // Check PREMADE_PASSAGES structure
    assert(PREMADE_PASSAGES['A1'].length >= 3, 'A1 premade passages contains German, Spanish, French');
    assert(PREMADE_PASSAGES['A2'].length >= 1, 'A2 premade passages contains content');
    assert(PREMADE_PASSAGES['B1'].length >= 1, 'B1 premade passages contains content');
    assert(PREMADE_PASSAGES['B2'].length >= 1, 'B2 premade passages contains content');
    assert(PREMADE_PASSAGES['C1'].length >= 1, 'C1 premade passages contains content');

    // Test non-repetition rotation in getPremadeFallbackPassage
    const firstPassage = getPremadeFallbackPassage('de', 'A1', []);
    assert(firstPassage !== null, 'First passage returned');
    const secondPassage = getPremadeFallbackPassage('de', 'A1', [firstPassage!.title]);
    assert(secondPassage !== null, 'Second passage returned');
    assert(secondPassage!.title !== firstPassage!.title, 'Fallback selection avoids used titles when alternatives exist');

    testResults.push({ id: 12, name: 'Existing reading module functionality remaining intact', passed: true });
  } catch (err: any) {
    testResults.push({ id: 12, name: 'Existing reading module functionality remaining intact', passed: false, details: err.message });
  }

  // Summary
  console.log("\n================ TEST EXECUTION RESULTS ================");
  let passedCount = 0;
  testResults.forEach(r => {
    const icon = r.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[Test ${r.id}] ${icon}: ${r.name}`);
    if (r.details) console.log(`       Details: ${r.details}`);
    if (r.passed) passedCount++;
  });
  console.log(`\nSummary: ${passedCount} / ${testResults.length} passed.`);

  if (passedCount === testResults.length) {
    console.log("ALL 12 RELIABILITY TEST SCENARIOS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("SOME TESTS FAILED.");
    process.exit(1);
  }
}

runTests();
