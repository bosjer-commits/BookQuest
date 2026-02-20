export type UserRole = 'kid' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  kids?: string[];
}

export const USERS: UserProfile[] = [
  { id: 'elliott', name: 'Elliott', role: 'kid',    pin: '6081' },
  { id: 'robin',   name: 'Robin',   role: 'kid',    pin: '0824' },
  { id: 'simon',   name: 'Simon',   role: 'kid',    pin: '0115' },
  { id: 'oliver',  name: 'Oliver',  role: 'kid',    pin: '3294' },
  { id: 'lucas',   name: 'Lucas',   role: 'kid',    pin: '5883' },
  { id: 'fanny',   name: 'Fanny',   role: 'parent', pin: '0395', kids: ['elliott'] },
  { id: 'fie',     name: 'Fie',     role: 'parent', pin: '7811', kids: ['robin', 'simon'] },
  { id: 'jo',      name: 'Jo',      role: 'parent', pin: '9844', kids: ['oliver', 'lucas'] },
];
