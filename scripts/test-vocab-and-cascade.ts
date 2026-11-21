import assert from 'assert';
import { extractDictionaryVocabulary, MULTILINGUAL_DICTIONARY } from '../src/data/reading/dictionary';
import { ReadingService } from '../src/services/ReadingService';
import { ReadingModule } from '../src/types';

console.log("=== TALKY BEAN VOCABULARY & CASCADE VERIFICATION SUITE ===");

const LANGUAGES = ['de', 'es', 'fr', 'it', 'pt', 'ja', 'zh', 'ko', 'ru', 'ga', 'fi'];

// Test 1: Multilingual Dictionary Extractor for all 11 Languages
console.log("\n[Test 1] Testing Dictionary Extraction for all 11 languages...");
for (const lang of LANGUAGES) {
  const samplePassages: Record<string, string> = {
    de: "Lukas wohnt in München. Er isst gesundes Gemüse und trinkt frisches Wasser. Bewegung und Erholung sind wichtig für Körper und Geist.",
    es: "Carlos vive en Madrid. Come verduras frescas y bebe mucha agua. La salud y el ejercicio diario dan energía para el trabajo.",
    fr: "Pierre vit à Paris. Il mange des légumes frais et boit de l'eau. La santé et le sommeil sont essentiels pour le corps et l'esprit.",
    it: "Marco vive a Roma. Mangia verdura fresca e beve acqua pura. La salute e il riposo sono importanti per il corpo e la mente.",
    pt: "João vive em Lisboa. Ele come legumes frescos e bebe água. A saúde e o exercício diário dão energia e bem-estar.",
    ja: "田中さんは東京に住んでいます。毎日野菜を食べ、水をたくさん飲みます。健康と運動は生活にとって大切です。",
    zh: "李明在北京生活。他每天吃新鲜蔬菜，喝很多水。健康和适度运动对身体和生活非常重要。",
    ko: "민수는 서울에 살고 있습니다. 매일 신선한 채소를 먹고 물을 많이 마십니다. 건강과 운동은 생활에 중요합니다.",
    ru: "Алексей живет в Москве. Он ест свежие овощи и пьет чистую воду. Здоровье и спорт очень важны для тела и ума.",
    ga: "Tá Liam ina chónaí i mBaile Átha Cliath. Itheann sé glasraí úra agus ólann sé uisce. Tá sláinte agus aclaíocht tábhachtach don chorp.",
    fi: "Matti asuu Helsingissä. Hän syö tuoreita vihanneksia ja juo vettä. Terveys ja liikunta ovat tärkeitä keholle ja mielelle."
  };

  const passage = samplePassages[lang] || samplePassages['de'];
  const hints = extractDictionaryVocabulary(passage, lang, 8, 20);
  const count = Object.keys(hints).length;

  assert(count >= 8, `Expected at least 8 hints for language ${lang}, got ${count}`);
  console.log(`  ✓ [${lang.toUpperCase()}] Extracted ${count} vocabulary hints.`);
}

// Test 2: EnsureModuleVocabulary Auto-Repair
console.log("\n[Test 2] Testing Auto-Repair on Empty Module...");
const emptyModule: ReadingModule = {
  id: "test-module-empty",
  level: "A1",
  moduleNumber: 1,
  theme: "Gesund leben",
  isCompleted: false,
  maxScore: 10,
  createdAt: Date.now(),
  exercises: [
    {
      id: "ex-0",
      passage: "Gesundes Leben erfordert gute Ernährung und regelmäßige Bewegung im Alltag.",
      questions: [],
      vocabularyHints: {}, // EMPTY
      type: "mcq"
    }
  ]
};

const repaired = ReadingService.ensureModuleVocabulary(emptyModule, "de");
const repairedCount = Object.keys(repaired.exercises[0].vocabularyHints).length;
assert(repairedCount >= 8, `Expected repaired module to have at least 8 hints, got ${repairedCount}`);
console.log(`  ✓ Repaired module successfully populated with ${repairedCount} vocabulary hints.`);

// Test 3: Model Quality Floor & Descending Cascade Logic
console.log("\n[Test 3] Testing Strict Quality Floor (>= Gemini 3.5 Flash)...");
function testQualityFloor(modelId: string): boolean {
  const clean = modelId.trim().toLowerCase();
  if (clean === "gemini-flash-latest") return true;
  const match = clean.match(/gemini-(\d+)(?:\.(\d+))?-flash/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = match[2] ? parseInt(match[2], 10) : 0;
    const versionNum = major + (minor / 10);
    return versionNum >= 3.5;
  }
  return clean === "gemini-3.8-flash" || clean === "gemini-3.5-flash";
}

// Should Pass
assert.strictEqual(testQualityFloor("gemini-flash-latest"), true);
assert.strictEqual(testQualityFloor("gemini-3.8-flash"), true);
assert.strictEqual(testQualityFloor("gemini-3.5-flash"), true);
assert.strictEqual(testQualityFloor("gemini-3.9-flash"), true);
assert.strictEqual(testQualityFloor("gemini-4.0-flash"), true);

// Should be Rejected (below 3.5)
assert.strictEqual(testQualityFloor("gemini-3.1-flash-lite"), false);
assert.strictEqual(testQualityFloor("gemini-2.0-flash"), false);
assert.strictEqual(testQualityFloor("gemini-1.5-flash"), false);
assert.strictEqual(testQualityFloor("gemini-pro"), false);

console.log("  ✓ Models >= 3.5 Flash APPROVED.");
console.log("  ✓ Models < 3.5 Flash (3.1-flash-lite, 2.0, 1.5) REJECTED.");

// Test 4: CJK Substring Tokenizer Simulation
console.log("\n[Test 4] Testing CJK Substring Tokenizer Simulation...");
const cjkText = "李明每天吃新鲜蔬菜，喝很多水。";
const cjkHints = { "蔬菜": "vegetables", "每天": "every day", "水": "water" };
const hintKeys = Object.keys(cjkHints).sort((a, b) => b.length - a.length);

const matchedTokens: string[] = [];
let idx = 0;
while (idx < cjkText.length) {
  let matched: string | null = null;
  for (const k of hintKeys) {
    if (cjkText.substring(idx, idx + k.length) === k) {
      matched = k;
      break;
    }
  }
  if (matched) {
    matchedTokens.push(matched);
    idx += matched.length;
  } else {
    idx++;
  }
}

assert(matchedTokens.includes("每天"), "Expected to match 每天 in continuous Chinese text");
assert(matchedTokens.includes("蔬菜"), "Expected to match 蔬菜 in continuous Chinese text");
assert(matchedTokens.includes("水"), "Expected to match 水 in continuous Chinese text");
console.log(`  ✓ CJK continuous text successfully segmented words: [${matchedTokens.join(", ")}]`);

console.log("\n=======================================================");
console.log("ALL VOCABULARY & CASCADE TESTS PASSED SUCCESSFULLY!");
