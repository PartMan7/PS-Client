// Rough-ish outline of data from Showdown
// Help here in getting simpler/more accurate types would be greatly appreciated

type Stats = 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'hp';
type StatsTable = Record<Stats, number>;

interface AbilityFlags {
	breakable?: 1; // Can be suppressed by Mold Breaker and related effects
	cantsuppress?: 1; // Ability can't be suppressed by e.g. Gastro Acid or Neutralizing Gas
	failroleplay?: 1; // Role Play fails if target has this Ability
	failskillswap?: 1; // Skill Swap fails if either the user or target has this Ability
	noentrain?: 1; // Entrainment fails if user has this Ability
	noreceiver?: 1; // Receiver and Power of Alchemy will not activate if an ally faints with this Ability
	notrace?: 1; // Trace cannot copy this Ability
	notransform?: 1; // Disables the Ability if the user is Transformed
}

export const abilities: Record<
	string,
	{
		isNonstandard?: 'Past' | 'CAP';
		flags: AbilityFlags;
		name: string;
		rating: number;
		num: number;
		desc: string;
		shortDesc: string;
	}
>;

export const aliases: Record<string, string>;

export const formatsData: Record<
	string,
	{
		isNonstandard?: string;
		tier?: string;
		doublesTier?: string;
		natDexTier?: string;
	}
>;

export const formats: (
	| { section: string; column?: number }
	| {
			name: string;
			desc?: string;
			mod?: string;
			team?: string;
			ruleset?: string[];
			gameType?: string;
			challengeShow?: boolean;
			tournamentShow?: boolean;
			searchShow?: boolean;
			rated?: boolean;
			banlist?: string[];
			unbanlist?: string[];
			bestOfDefault?: boolean;
			restricted?: string[];
			teraPreviewDefault?: boolean;
	  }
)[];

export const items: Record<
	string,
	{
		name: string;
		desc: string;
		shortDesc: string;
		gen: number;
		num: number;
		spritenum: number;
		isNonstandard?: 'Past' | 'Unobtainable' | 'CAP';
		boosts?: StatsTable;
		condition?: any; // not this

		isBerry?: boolean;
		isPokeball?: boolean;
		isGem?: boolean;
		isChoice?: boolean;
		itemUser?: string[];
		forcedForme?: string;
		megaStone?: string;
		megaEvolves?: string;
		zMove?: string | boolean;
		zMoveType?: string;
		zMoveFrom?: string;
		naturalGift?: {
			basePower: number;
			type: string;
		};
		fling?: { basePower: number; status?: string; volatileStatus?: string };
		ignoreKlutz?: boolean;
	}
>;

type MoveSource = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${'M' | 'T' | 'L' | 'R' | 'E' | 'D' | 'S' | 'V' | 'C'}${string}`;

type EventInfo = {
	generation: number;
	level?: number;
	shiny?: boolean | 1;
	gender?: 'M' | 'F' | 'N' | '';
	nature?: string;
	ivs?: Partial<StatsTable>;
	perfectIVs?: number;
	isHidden?: boolean;
	abilities?: string[];
	maxEggMoves?: number;
	moves?: string[];
	pokeball?: string;
	from?: string;
	japan?: boolean;
	emeraldEventEgg?: boolean;
};

type LearnsetData = {
	learnset?: Record<string, MoveSource[]>;
	eventData?: EventInfo[];
	eventOnly?: boolean;
	encounters?: EventInfo[];
	exists?: boolean;
}

export const learnsets: Record<string, LearnsetData>;
