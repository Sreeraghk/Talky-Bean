/**
 * Automated Verification Suite for Talky Bean Offline-First Multilingual Dictionary & Lemmatizer
 */

import { MultilingualLemmatizer } from '../src/services/dictionary/lemmatizer';
import { loadLexiconModule } from '../src/services/dictionary/lexicons';
import { DictionaryService } from '../src/services/dictionary/DictionaryService';
import { InMemoryStorageAdapter } from '../src/services/dictionary/storageAdapter';

async function runVerificationSuite() {
  console.log("===============================================================================");
  console.log("TALKY BEAN: ADVANCED OFFLINE MULTILINGUAL DICTIONARY & LEMMATIZER VERIFICATION");
  console.log("===============================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    }
  }

  // TEST 1: Irregular Lemmatization across Languages
  console.log("--- 1. Testing Morphological Lemmatization & Irregular Recognition ---");
  const lemmaChecks = [
    { lang: 'de', word: 'gegangen', expected: 'gehen' },
    { lang: 'de', word: 'ging', expected: 'gehen' },
    { lang: 'de', word: 'häuser', expected: 'haus' },
    { lang: 'de', word: 'besseren', expected: 'gut' },
    { lang: 'es', word: 'fue', expected: 'ir' },
    { lang: 'es', word: 'hizo', expected: 'hacer' },
    { lang: 'es', word: 'ciudades', expected: 'ciudad' },
    { lang: 'fr', word: 'été', expected: 'être' },
    { lang: 'fr', word: 'pris', expected: 'prendre' },
    { lang: 'it', word: 'uomini', expected: 'uomo' },
    { lang: 'it', word: 'fatto', expected: 'fare' },
    { lang: 'pt', word: 'homens', expected: 'homem' },
    { lang: 'pt', word: 'disse', expected: 'dizer' },
    { lang: 'ja', word: '行った', expected: '行く' },
    { lang: 'ja', word: '食べた', expected: '食べる' },
    { lang: 'ko', word: '공부했다', expected: '공부하다' },
    { lang: 'ru', word: 'был', expected: 'быть' },
    { lang: 'ga', word: 'chuaigh', expected: 'téigh' },
    { lang: 'ga', word: 'tháinig', expected: 'tar' },
    { lang: 'fi', word: 'mennyt', expected: 'mennä' },
    { lang: 'fi', word: 'parempi', expected: 'hyvä' }
  ];

  for (const c of lemmaChecks) {
    const res = MultilingualLemmatizer.lemmatize(c.word, c.lang);
    assert(res.lemma.toLowerCase() === c.expected.toLowerCase(), `Lemmatize ${c.lang} "${c.word}" -> "${c.expected}"`, `Got: "${res.lemma}"`);
  }

  // TEST 2: Dynamic Lazy Loading for all 11 Languages
  console.log("\n--- 2. Testing Modular Dynamic Lexicon Loading for all 11 Languages ---");
  const allLanguages = ['de', 'es', 'fr', 'it', 'pt', 'ja', 'zh', 'ko', 'ru', 'ga', 'fi'];

  for (const lang of allLanguages) {
    const lex = await loadLexiconModule(lang);
    assert(!!lex && lex.languageCode === lang && lex.entries.length > 20, `Dynamic load module for "${lang}" (${lex?.entries?.length || 0} entries)`);
    assert(!!lex?.license && lex.license.includes('CC BY-SA'), `License validation for "${lang}": ${lex?.license}`);
  }

  // TEST 3: Storage Adapter & O(1) Irregular Form Indexing
  console.log("\n--- 3. Testing Storage Adapter & Multi-Key Indexing ---");
  const adapter = new InMemoryStorageAdapter();
  const deStore = await adapter.load('de');
  assert(deStore.size > 50, `Storage adapter loaded German store (${deStore.size} total indexed keys)`);

  const entryGegangen = await adapter.get('de', 'gegangen');
  assert(!!entryGegangen && entryGegangen.lemma === 'gehen', `Irregular "gegangen" directly points to base lemma "gehen"`);

  const entryHaeuser = await adapter.get('de', 'häuser');
  assert(!!entryHaeuser && entryHaeuser.lemma === 'Haus', `Noun plural "häuser" directly points to base lemma "Haus"`);

  // TEST 4: Trivial Stopword Filtering
  console.log("\n--- 4. Testing Trivial Stopword Filtering ---");
  assert(MultilingualLemmatizer.isStopword('der', 'de') === true, 'German stopword "der" filtered');
  assert(MultilingualLemmatizer.isStopword('und', 'de') === true, 'German stopword "und" filtered');
  assert(MultilingualLemmatizer.isStopword('Umwelt', 'de') === false, 'German content word "Umwelt" preserved');
  assert(MultilingualLemmatizer.isStopword('el', 'es') === true, 'Spanish stopword "el" filtered');
  assert(MultilingualLemmatizer.isStopword('salud', 'es') === false, 'Spanish content word "salud" preserved');
  assert(MultilingualLemmatizer.isStopword('le', 'fr') === true, 'French stopword "le" filtered');
  assert(MultilingualLemmatizer.isStopword('energie', 'fr') === false, 'French content word "energie" preserved');

  // TEST 5: Full Passage Extraction Without 28-Word Cap
  console.log("\n--- 5. Testing Full Passage Extraction (No 28-Word Limit) ---");
  const longGermanPassage = `
    Eine gesunde Lebensweise umfasst viele wichtige Gewohnheiten für den Menschen.
    Tägliche Bewegung stärkt das Herz und gibt frische Energie für die Arbeit.
    Ausgewogene Mahlzeiten mit Obst und Gemüse fördern das Wohlbefinden im Alltag.
    Guter Schlaf in der Nacht hilft dem Körper und dem Geist bei der Erholung.
    Viele Menschen trinken morgens frisches Wasser und machen einen langen Spaziergang durch die Stadt.
    Moderne Technologie und nachhaltige Forschung unterstützen heute den Schutz der Natur.
    Eine saubere Umwelt verbessert das Leben für alle Kinder und Familien in jedem Land.
    Wer regelmäßig gesund isst, viel schläft und Freude an der Kultur hat, lebt besser.
  `;

  const vocabHints = await DictionaryService.extractPassageVocabulary(longGermanPassage, 'de', 'en', 'A1');
  const count = Object.keys(vocabHints).length;
  console.log(`  Identified ${count} vocabulary hint tokens in passage.`);
  assert(count >= 30, `Identified 30+ tokens without arbitrary 28-word limit (Found: ${count})`);
  assert(!!vocabHints['gesunde'] || !!vocabHints['gesund'], 'Contains "gesund"');
  assert(!!vocabHints['bewegung'], 'Contains "bewegung"');
  assert(!!vocabHints['energie'], 'Contains "energie"');
  assert(!!vocabHints['stadt'], 'Contains "stadt"');
  assert(!!vocabHints['leben'], 'Contains "leben"');

  console.log("\n===============================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("===============================================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerificationSuite().catch(err => {
  console.error("Test Suite Execution Failed:", err);
  process.exit(1);
});
