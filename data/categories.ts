import { deGoudenGriffelWinners } from './deGoudenGriffel';
import { augustprisetWinners } from './augustpriset';
import { bramStokerWinners } from './bramStoker';
import { groteVriendelijke100 } from './groteVriendelijke';
import { lasarnasLegender } from './LasarnasLegender';

export interface PrizeCategory {
  id: string;
  name: string;
  domeImage: string;
  books: Array<{
    year: number;
    title: string;
    author: string;
    illustrator?: string;
    publisher?: string;
    cover?: string;
    ageRange?: string;
    summary?: string;
  }>;
}

export const prizeCategories: PrizeCategory[] = [
  {
    id: 'de-gouden-griffel',
    name: 'De Gouden Griffel',
    domeImage: '/assets/griffeldome.png',
    books: [...deGoudenGriffelWinners].reverse(),
  },
  {
    id: 'augustpriset',
    name: 'Augustpriset',
    domeImage: '/assets/augustdome.png',
    books: [...augustprisetWinners].reverse(),
  },
  {
    id: 'bram-stoker',
    name: 'Bram Stoker Award',
    domeImage: '/assets/stokerdome.png',
    books: [...bramStokerWinners].reverse(),
  },
  {
    id: 'grote-vriendelijke',
    name: 'Grote Vriendelijke 100',
    domeImage: '/assets/grotevriendelijkedome.png',
    books: groteVriendelijke100,
  },
  {
    id: 'lasarnas-legender',
    name: 'Läsarnas Legender',
    domeImage: '/assets/lasarnasdome.png',
    books: lasarnasLegender,
  },
];
