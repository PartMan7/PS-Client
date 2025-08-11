export const abilities: Record<string, Ability>;
export const aliases: Record<string, string>;
export const formatsData: Record<
	string,
	{
		isNonstandard?: IsNonstandard;
		tier?: string;
		doublesTier?: string;
		natDexTier?: string;
	}
>;
export const formats: (
	| Format
	| {
			section: string;
			column?: number;
	  }
)[];
export const items: Record<string, Item>;
export const learnsets: Record<string, Learnset>;
export const moves: Record<string, Move>;
export const pokedex: Record<string, Species>;
export const typechart: Record<
	| 'normal'
	| 'psychic'
	| 'bug'
	| 'dark'
	| 'dragon'
	| 'electric'
	| 'fairy'
	| 'fighting'
	| 'fire'
	| 'flying'
	| 'ghost'
	| 'grass'
	| 'ground'
	| 'ice'
	| 'poison'
	| 'rock'
	| 'steel'
	| 'stellar'
	| 'water',
	{
		damageTaken: Record<Types, 0 | 1 | 2 | 3> &
			Partial<Record<'prankster' | 'brn' | 'trapped' | 'powder' | 'par' | 'sandstorm' | 'hail' | 'frz' | 'psn' | 'tox', 0 | 3>>;
		HPivs?: Partial<StatsTable>;
		HPdvs?: Partial<StatsTable>;
	}
>;
import type { Ability } from './types/data.d.ts';
import type { IsNonstandard } from './types/data.d.ts';
import type { Format } from './types/data.d.ts';
import type { Item } from './types/data.d.ts';
import type { Learnset } from './types/data.d.ts';
import type { Move } from './types/data.d.ts';
import type { Species } from './types/data.d.ts';
import type { Types } from './types/data.d.ts';
import type { StatsTable } from './types/data.d.ts';
