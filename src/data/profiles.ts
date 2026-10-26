
export type Profile = {
  id: string;
  name: string;
  age: number;
  description: string;
};

export const profiles: Profile[] = [
  {
    id: '1',
    name: 'Juan',
    age: 25,
    description: 'Enjoys music, coffee, and discovering new places.',
  },
  {
    id: '2',
    name: 'Pedro',
    age: 26,
    description: 'Likes gaming, watching movies, and meeting new people.',
  },
  {
    id: '3',
    name: 'Maria',
    age: 23,
    description: 'Loves traveling, photography, and exploring nature.',
  },
  {
    id: '4',
    name: 'Alex',
    age: 24,
    description: 'Enjoys reading books, hiking, and listening to music.',
  },
  {
    id: '5',
    name: 'Sam',
    age: 27,
    description: 'Likes cooking, trying new food, and spending time outdoors.',
  },
];
