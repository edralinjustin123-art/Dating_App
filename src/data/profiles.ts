
export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  relationshipStatus: string;
  aboutMe: string;
  favorites: string;
  hobbies: string;
  birthdate: string;
};

export const profiles: Profile[] = [
  {
    id: '1',
    name: 'Juan',
    age: 25,
    gender: 'Male',
    relationshipStatus: 'Single',
    aboutMe:
      'I enjoy listening to music, drinking coffee, and discovering new places. I love having meaningful conversations and meeting new people.',
    favorites: 'Coffee, acoustic music, pizza, and sunsets',
    hobbies: 'Photography, traveling, playing guitar',
    birthdate: 'April 12, 2001',
  },
  {
    id: '2',
    name: 'Pedro',
    age: 26,
    gender: 'Male',
    relationshipStatus: 'Single',
    aboutMe:
      'A casual gamer who enjoys watching movies and spending time with friends. Always open to trying something new.',
    favorites: 'Video games, burgers, action movies, and basketball',
    hobbies: 'Gaming, basketball, watching movies',
    birthdate: 'February 8, 2000',
  },
  {
    id: '3',
    name: 'Maria',
    age: 23,
    gender: 'Female',
    relationshipStatus: 'Single',
    aboutMe:
      'I love exploring nature, capturing beautiful moments, and going on spontaneous adventures. I appreciate simple and happy moments.',
    favorites: 'Nature, photography, pasta, and flowers',
    hobbies: 'Traveling, photography, hiking',
    birthdate: 'August 19, 2003',
  },
  {
    id: '4',
    name: 'Alex',
    age: 24,
    gender: 'Male',
    relationshipStatus: 'Single',
    aboutMe:
      'A book lover who enjoys peaceful places, outdoor activities, and good music. I enjoy learning new things every day.',
    favorites: 'Books, coffee, indie music, and nature',
    hobbies: 'Reading, hiking, listening to music',
    birthdate: 'January 25, 2002',
  },
  {
    id: '5',
    name: 'Sam',
    age: 27,
    gender: 'Female',
    relationshipStatus: 'Single',
    aboutMe:
      'I enjoy cooking delicious meals, exploring different restaurants, and spending time outdoors. I believe life is better with good food and good company.',
    favorites: 'Pasta, desserts, seafood, and travel',
    hobbies: 'Cooking, swimming, exploring new places',
    birthdate: 'June 3, 1999',
  },
];
