import { ListeningModule, LanguageLevel } from '../../types';

export const GERMAN_STARTER_LISTENING: { [level in LanguageLevel]?: ListeningModule } = {
  A1: {
    id: 'starter-de-a1',
    level: 'A1',
    title: 'Erste Begegnung',
    script: 'Hallo! Mein Name ist Thomas. Ich komme aus Berlin. Ich bin 25 Jahre alt und arbeite als Lehrer. In meiner Freizeit spiele ich gerne Fußball und höre Musik. Und du? Wie heißt du?',
    questions: [
      {
        id: 'q1',
        question: 'Woher kommt Thomas?',
        options: ['München', 'Berlin', 'Hamburg', 'Köln'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        question: 'Was ist Thomas von Beruf?',
        options: ['Arzt', 'Student', 'Lehrer', 'Ingenieur'],
        correctAnswerIndex: 2
      },
      {
        id: 'q3',
        question: 'Was macht Thomas in seiner Freizeit?',
        options: ['Fußball spielen', 'Kochen', 'Lesen', 'Schwimmen'],
        correctAnswerIndex: 0
      }
    ],
    isCompleted: false,
    createdAt: Date.now()
  },
  A2: {
    id: 'starter-de-a2',
    level: 'A2',
    title: 'Ein Tag in der Stadt',
    script: 'Gestern war ich in der Stadt. Zuerst bin ich mit dem Bus zum Bahnhof gefahren. Dann habe ich meine Freundin Julia getroffen. Wir sind zusammen ins Kino gegangen und haben einen interessanten Film gesehen. Nach dem Film haben wir in einem kleinen Restaurant Pizza gegessen. Es war ein schöner Tag.',
    questions: [
      {
        id: 'q1',
        question: 'Wie ist die Person zum Bahnhof gekommen?',
        options: ['Mit dem Auto', 'Mit dem Fahrrad', 'Mit dem Bus', 'Zu Fuß'],
        correctAnswerIndex: 2
      },
      {
        id: 'q2',
        question: 'Wen hat die Person getroffen?',
        options: ['Ihre Mutter', 'Ihre Freundin Julia', 'Ihren Bruder', 'Ihren Lehrer'],
        correctAnswerIndex: 1
      },
      {
        id: 'q3',
        question: 'Was haben sie nach dem Kino gemacht?',
        options: ['Eis gegessen', 'Pizza gegessen', 'Kaffee getrunken', 'Eingekauft'],
        correctAnswerIndex: 1
      }
    ],
    isCompleted: false,
    createdAt: Date.now()
  },
  B1: {
    id: 'starter-de-b1',
    level: 'B1',
    title: 'Umwelt und Nachhaltigkeit',
    script: 'Heutzutage ist das Thema Umweltschutz sehr wichtig. Viele Menschen versuchen, ihren Plastikverbrauch zu reduzieren. Ich benutze zum Beispiel immer eine Stofftasche beim Einkaufen. Außerdem fahre ich oft mit dem Fahrrad zur Arbeit, anstatt das Auto zu nehmen. Wenn wir alle kleine Dinge ändern, können wir einen großen Unterschied für unseren Planeten machen.',
    questions: [
      {
        id: 'q1',
        question: 'Was versuchen viele Menschen zu reduzieren?',
        options: ['Ihren Wasserverbrauch', 'Ihren Plastikverbrauch', 'Ihren Fleischkonsum', 'Ihre Arbeitszeit'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        question: 'Was benutzt die Person beim Einkaufen?',
        options: ['Eine Plastiktüte', 'Eine Papiertüte', 'Eine Stofftasche', 'Einen Korb'],
        correctAnswerIndex: 2
      },
      {
        id: 'q3',
        question: 'Wie kommt die Person zur Arbeit?',
        options: ['Mit dem Auto', 'Mit dem Bus', 'Mit dem Fahrrad', 'Mit dem Zug'],
        correctAnswerIndex: 2
      }
    ],
    isCompleted: false,
    createdAt: Date.now()
  },
  B2: {
    id: 'starter-de-b2',
    level: 'B2',
    title: 'Die Zukunft der Arbeit',
    script: 'Die Digitalisierung hat die Arbeitswelt grundlegend verändert. Homeoffice und flexible Arbeitszeiten sind für viele Arbeitnehmer mittlerweile selbstverständlich geworden. Während dies einerseits eine bessere Work-Life-Balance ermöglicht, bringt es andererseits auch Herausforderungen mit sich, wie zum Beispiel die ständige Erreichbarkeit. Unternehmen müssen neue Wege finden, um die Zusammenarbeit im Team auch über Distanz effektiv zu gestalten.',
    questions: [
      {
        id: 'q1',
        question: 'Was hat die Arbeitswelt grundlegend verändert?',
        options: ['Die Globalisierung', 'Die Digitalisierung', 'Der Klimawandel', 'Die Politik'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        question: 'Was ist ein Vorteil von Homeoffice laut dem Text?',
        options: ['Weniger Stress', 'Bessere Work-Life-Balance', 'Höheres Gehalt', 'Mehr Urlaub'],
        correctAnswerIndex: 1
      },
      {
        id: 'q3',
        question: 'Was ist eine Herausforderung der neuen Arbeitswelt?',
        options: ['Zu viele Meetings', 'Ständige Erreichbarkeit', 'Geringe Motivation', 'Fehlende Technik'],
        correctAnswerIndex: 1
      }
    ],
    isCompleted: false,
    createdAt: Date.now()
  }
};
