export type UserRole = 'kid';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
}

export const USERS: UserProfile[] = [
  { id: 'annalyn', name: 'Annalyn', role: 'kid' },
  { id: 'elliott', name: 'Elliot',  role: 'kid' },
  { id: 'robin',   name: 'Robin',   role: 'kid' },
  { id: 'simon',   name: 'Simon',   role: 'kid' },
  { id: 'oliver',  name: 'Oliver',  role: 'kid' },
  { id: 'lucas',   name: 'Lucas',   role: 'kid' },
];
