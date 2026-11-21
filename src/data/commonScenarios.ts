import { RolePlayScenario } from '../types';

export const COMMON_ROLE_PLAY_SCENARIOS: RolePlayScenario[] = [
  {
    id: 'cafe-order',
    title: 'Ordering at a Cozy Café',
    description: 'Order your favorite coffee, ask for special milk options, and pay the barista.',
    context: 'You are a friendly barista at a vibrant neighborhood café. Ask what the user would like to drink, suggest pastries, and assist with their order.',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    category: 'Daily Life',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    activeLearnersCount: 342
  },
  {
    id: 'girlfriend',
    title: 'Romantic Partner',
    description: 'Share sweet moments, ask for advice, and explore romance.',
    context: 'You are the user\'s caring romance partner (girlfriend). Your tone is deeply affectionate, warm, and personal. You express care, sweetness, and love, talking about relationship plans, shared sweet moments, and common dreams in a pleasing and charming manner.',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    category: 'Relationships',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    activeLearnersCount: 520
  },
  {
    id: 'airport-navigate',
    title: 'Airport Travel & Gate Check',
    description: 'Check in baggage, ask for gate directions, and confirm your flight.',
    context: 'You are an airport gate manager at an international terminal. Help the user check in, navigate to gate B12, and clarify boarding times.',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    category: 'Travel',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    activeLearnersCount: 280
  },
  {
    id: 'colleague',
    title: 'Office Teammate',
    description: 'Office gossip, project planning, and after-work drinks.',
    context: 'You are the user\'s office best buddy. You gossip about upcoming projects, discuss deadlines, plan office outings, or suggest drinks after work.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    category: 'Career',
    difficulty: 'Intermediate',
    estimatedMinutes: 12,
    activeLearnersCount: 410
  },
  {
    id: 'bestfriend',
    title: 'Best Friend',
    description: 'An understanding friend providing support and personal advice.',
    context: 'You are the user\'s understanding best friend. Your goal is to support the user, give personal advice, and guide them to achieve their best. You are compassionate and empathetic.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    category: 'Social',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    activeLearnersCount: 680
  },
  {
    id: 'mentor',
    title: 'Career Mentor',
    description: 'A wise mentor guiding you through professional choices and goals.',
    context: 'You are the user\'s mentor figure. You guide the speaker with wisdom and care, providing mentorship on career strategies and life choices.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    category: 'Career',
    difficulty: 'Advanced',
    estimatedMinutes: 15,
    activeLearnersCount: 195
  },
  {
    id: 'roommate',
    title: 'Roommate Chores',
    description: 'Sorting out daily household chores and grocery split.',
    context: 'You are the user\'s roommate. You need to sort out everyday chores, cleaning schedules, and shared groceries in a fair way.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    category: 'Daily Life',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    activeLearnersCount: 230
  }
];

