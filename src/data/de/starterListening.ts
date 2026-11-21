import { ListeningModule, LanguageLevel } from '../../types';

export const GERMAN_STARTER_LISTENING: { [level in LanguageLevel]?: ListeningModule } = {
  A1: {
    id: 'starter-de-a1',
    level: 'A1',
    examType: 'Standard',
    title: 'Erste Begegnung',
    script: 'Hallo! Mein Name ist Thomas. Ich komme aus Berlin. Ich bin 25 Jahre alt und arbeite als Lehrer. In meiner Freizeit spiele ich gerne Fußball und höre Musik. Und du? Wie heißt du?',
    questions: [
      {
        id: 'q1',
        question: 'Thomas kommt aus Berlin.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 0
      },
      {
        id: 'q2',
        question: 'Thomas ist Lehrer von Beruf.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 0
      },
      {
        id: 'q3',
        question: 'Thomas spielt in seiner Freizeit gerne Tennis.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 1
      }
    ],
    isCompleted: false,
    createdAt: Date.now(),
    index: 0
  },
  A2: {
    id: 'starter-de-a2',
    level: 'A2',
    examType: 'Standard',
    title: 'Ein Tag in der Stadt',
    script: 'Gestern war ich in der Stadt. Zuerst bin ich mit dem Bus zum Bahnhof gefahren. Dann habe ich meine Freundin Julia getroffen. Wir sind zusammen ins Kino gegangen und haben einen interessanten Film gesehen. Nach dem Film haben wir in einem kleinen Restaurant Pizza gegessen. Es war ein schöner Tag.',
    questions: [
      {
        id: 'q1',
        question: 'Die Person ist mit dem Fahrrad zum Bahnhof gefahren.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        question: 'Die Person hat ihre Freundin Julia getroffen.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 0
      },
      {
        id: 'q3',
        question: 'Nach dem Kino haben sie Pizza gegessen.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 0
      }
    ],
    isCompleted: false,
    createdAt: Date.now(),
    index: 0
  },
  B1: {
    id: 'starter-de-b1',
    level: 'B1',
    examType: 'Standard',
    title: 'Umwelt und Nachhaltigkeit',
    script: 'Heutzutage ist das Thema Umweltschutz sehr wichtig. Viele Menschen versuchen, ihren Plastikverbrauch zu reduzieren. Ich benutze zum Beispiel immer eine Stofftasche beim Einkaufen. Außerdem fahre ich oft mit dem Fahrrad zur Arbeit, anstatt das Auto zu nehmen. Wenn wir alle kleine Dinge ändern, können wir einen großen Unterschied für unseren Planeten machen.',
    questions: [
      {
        id: 'q1',
        question: 'Viele Menschen möchten ihren Plastikverbrauch reduzieren.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 0
      },
      {
        id: 'q2',
        question: 'Die Person benutzt beim Einkaufen immer eine Plastiktüte.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 1
      },
      {
        id: 'q3',
        question: 'Die Person fährt oft mit dem Auto zur Arbeit.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 1
      }
    ],
    isCompleted: false,
    createdAt: Date.now(),
    index: 0
  },
  B2: {
    id: 'starter-de-b2',
    level: 'B2',
    examType: 'Standard',
    title: 'Die Zukunft der Arbeit',
    script: 'Die Digitalisierung hat die Arbeitswelt grundlegend verändert. Homeoffice und flexible Arbeitszeiten sind für viele Arbeitnehmer mittlerweile selbstverständlich geworden. Während dies einerseits eine bessere Work-Life-Balance ermöglicht, bringt es andererseits auch Herausforderungen mit sich, wie zum Beispiel die ständige Erreichbarkeit. Unternehmen müssen neue Wege finden, um die Zusammenarbeit im Team auch über Distanz effektiv zu gestalten.',
    questions: [
      {
        id: 'q1',
        question: 'Die Digitalisierung hat kaum Auswirkungen auf die Arbeitswelt.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        question: 'Homeoffice kann die Work-Life-Balance verbessern.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 0
      },
      {
        id: 'q3',
        question: 'Ständige Erreichbarkeit wird als Vorteil von Homeoffice genannt.',
        type: 'true-false',
        options: ['Richtig', 'Falsch'],
        correctAnswerIndex: 1
      }
    ],
    isCompleted: false,
    createdAt: Date.now(),
    index: 0
  }
};
