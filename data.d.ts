// Rough-ish outline of data from Showdown
// Help here in getting simpler/more accurate types would be greatly appreciated

type Stats = 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'hp';
type StatsTable = Record<Stats, number>;
type IsNonstandard = 'CAP' | 'Past' | 'Future' | 'Unobtainable' | 'Gigantamax' | 'LGPE' | 'Custom' | null;
type Gender = 'M' | 'F' | 'N' | '';

type AbilityFlags = Partial<
	Record<'breakable' | 'cantsuppress' | 'failroleplay' | 'failskillswap' | 'noentrain' | 'noreceiver' | 'notrace' | 'notransform', 1>
>;

export type Ability = {
	isNonstandard?: 'Past' | 'CAP';
	flags: AbilityFlags;
	name: string;
	rating: number;
	num: number;
	desc: string;
	shortDesc: string;
};
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

export type Item = {
	name: string;
	desc: string;
	shortDesc: string;
	gen: number;
	num: number;
	spritenum: number;
	isNonstandard?: IsNonstandard;
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
	zMoveType?: Types;
	zMoveFrom?: string;
	naturalGift?: {
		basePower: number;
		type: Types;
	};
	fling?: { basePower: number; status?: string; volatileStatus?: string };
	ignoreKlutz?: boolean;
};
export const items: Record<string, Item>;

type MoveSource = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${'M' | 'T' | 'L' | 'R' | 'E' | 'D' | 'S' | 'V' | 'C'}${string}`;

type EventInfo = {
	generation: number;
	level?: number;
	shiny?: boolean | 1;
	gender?: Gender;
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

export type Learnset = {
	learnset?: Record<string, MoveSource[]>;
	eventData?: EventInfo[];
	eventOnly?: boolean;
	encounters?: EventInfo[];
	exists?: boolean;
};

export const learnsets: Record<string, Learnset>;

type MoveTarget =
	| 'adjacentAlly'
	| 'adjacentAllyOrSelf'
	| 'adjacentFoe'
	| 'all'
	| 'allAdjacent'
	| 'allAdjacentFoes'
	| 'allies'
	| 'allySide'
	| 'allyTeam'
	| 'any'
	| 'foeSide'
	| 'normal'
	| 'randomNormal'
	| 'scripted'
	| 'self';

type MoveFlags = Partial<
	Record<
		| 'allyanim'
		| 'bypasssub'
		| 'bite'
		| 'bullet'
		| 'cantusetwice'
		| 'charge'
		| 'contact'
		| 'dance'
		| 'defrost'
		| 'distance'
		| 'failcopycat'
		| 'failencore'
		| 'failinstruct'
		| 'failmefirst'
		| 'failmimic'
		| 'futuremove'
		| 'gravity'
		| 'heal'
		| 'metronome'
		| 'mirror'
		| 'mustpressure'
		| 'noassist'
		| 'nonsky'
		| 'noparentalbond'
		| 'nosketch'
		| 'nosleeptalk'
		| 'pledgecombo'
		| 'powder'
		| 'protect'
		| 'pulse'
		| 'punch'
		| 'recharge'
		| 'reflectable'
		| 'slicing'
		| 'snatch'
		| 'sound'
		| 'wind',
		1
	>
>;

type HitEffect = {
	boosts?: Partial<StatsTable> | null;
	status?: string;
	volatileStatus?: string;
	sideCondition?: string;
	slotCondition?: string;
	pseudoWeather?: string;
	terrain?: string;
	weather?: string;
};

type SecondaryEffect = HitEffect & {
	chance?: number;
	ability?: Ability;
	dustproof?: boolean;
	kingsrock?: boolean;
	self?: HitEffect;
};

type EffectData = {
	name?: string;
	desc?: string;
	duration?: number;
	effectType?: string;
	infiltrates?: boolean;
	isNonstandard?: IsNonstandard | null;
	shortDesc?: string;
};

type Move = EffectData &
	HitEffect & {
		name: string;
		num?: number;
		condition?: { duration?: number };
		basePower: number;
		accuracy: true | number;
		pp: number;
		category: 'Physical' | 'Special' | 'Status';
		type: Types;
		priority: number;
		target: MoveTarget;
		flags: MoveFlags;
		realMove?: string;

		damage?: number | 'level' | false | null;
		contestType?: string;
		noPPBoosts?: boolean;

		isZ?: boolean | string;
		zMove?: {
			basePower?: number;
			effect?: string;
			boost?: Partial<StatsTable>;
		};

		isMax?: boolean | string;
		maxMove?: {
			basePower: number;
		};

		ohko?: boolean | 'Ice';
		thawsTarget?: boolean;
		heal?: number[] | null;
		forceSwitch?: boolean;
		selfSwitch?: 'copyvolatile' | 'shedtail' | boolean;
		selfBoost?: { boosts?: Partial<StatsTable> };
		selfdestruct?: 'always' | 'ifHit' | boolean;
		breaksProtect?: boolean;

		recoil?: [number, number];
		drain?: [number, number];
		mindBlownRecoil?: boolean;
		stealsBoosts?: boolean;
		struggleRecoil?: boolean;
		secondary?: SecondaryEffect | null;
		secondaries?: SecondaryEffect[] | null;
		self?: SecondaryEffect | null;
		hasSheerForce?: boolean;

		alwaysHit?: boolean;
		critRatio?: number;
		overrideOffensivePokemon?: 'target' | 'source';
		overrideOffensiveStat?: string;
		overrideDefensivePokemon?: 'target' | 'source';
		overrideDefensiveStat?: string;
		forceSTAB?: boolean;
		ignoreAbility?: boolean;
		ignoreAccuracy?: boolean;
		ignoreDefensive?: boolean;
		ignoreEvasion?: boolean;
		ignoreImmunity?: boolean | { [typeName: string]: boolean };
		ignoreNegativeOffensive?: boolean;
		ignoreOffensive?: boolean;
		ignorePositiveDefensive?: boolean;
		ignorePositiveEvasion?: boolean;
		multiaccuracy?: boolean;
		multihit?: number | number[];
		multihitType?: 'parentalbond';
		noDamageVariance?: boolean;
		nonGhostTarget?: MoveTarget;
		pressureTarget?: MoveTarget;
		spreadModifier?: number;
		sleepUsable?: boolean;
		smartTarget?: boolean;
		tracksTarget?: boolean;
		willCrit?: boolean;
		callsMove?: boolean;

		hasCrashDamage?: boolean;
		isConfusionSelfHit?: boolean;
		stallingMove?: boolean;
		baseMove?: string;

		basePowerCallback?: true;
	};

export const moves: Record<string, Move>;

export type Species = {
	id: string;
	name: string;
	num: number;
	gen?: number;
	baseSpecies?: string;
	forme?: string;
	baseForme?: string;
	cosmeticFormes?: string[];
	otherFormes?: string[];
	formeOrder?: string[];
	spriteid?: string;
	abilities: {
		0: string;
		1?: string;
		H?: string;
		S?: string;
	};
	types: Types[];
	addedType?: string;
	prevo?: string;
	evos?: string[];
	evoType?: 'trade' | 'useItem' | 'levelMove' | 'levelExtra' | 'levelFriendship' | 'levelHold' | 'other';
	evoCondition?: string;
	evoItem?: string;
	evoMove?: string;
	evoRegion?: 'Alola' | 'Galar';
	evoLevel?: number;
	nfe?: boolean;
	eggGroups: string[];
	canHatch?: boolean;
	gender?: Gender;
	genderRatio?: { M: number; F: number };
	baseStats: StatsTable;
	maxHP?: number;
	bst: number;
	weightkg: number;
	weighthg?: number;
	heightm: number;
	color: string;
	tags?: ('Mythical' | 'Restricted Legendary' | 'Sub-Legendary' | 'Ultra Beast' | 'Paradox')[];
	isNonstandard?: IsNonstandard;
	unreleasedHidden?: boolean | 'Past';
	maleOnlyHidden?: boolean;
	mother?: string;
	isMega?: boolean;
	isPrimal?: boolean;
	canGigantamax?: string;
	gmaxUnreleased?: boolean;
	cannotDynamax?: boolean;
	forceTeraType?: string;
	battleOnly?: string | string[];
	requiredItem?: string;
	requiredMove?: string;
	requiredAbility?: string;
	requiredItems?: string[];
	changesFrom?: string;
	pokemonGoData?: string[];
	tier?: string;
	doublesTier?: string;
	natDexTier?: string;
};

export const pokedex: Record<string, Species>;

export type Types =
	| 'Bug'
	| 'Dark'
	| 'Dragon'
	| 'Electric'
	| 'Fairy'
	| 'Fighting'
	| 'Fire'
	| 'Flying'
	| 'Ghost'
	| 'Grass'
	| 'Ground'
	| 'Ice'
	| 'Normal'
	| 'Poison'
	| 'Psychic'
	| 'Rock'
	| 'Steel'
	| 'Stellar'
	| 'Water';

export const typechart: Record<
	Lowercase<Types>,
	{
		damageTaken: Record<Types, 0 | 1 | 2 | 3> &
			Partial<Record<'prankster' | 'brn' | 'trapped' | 'powder' | 'par' | 'sandstorm' | 'hail' | 'frz' | 'psn' | 'tox', 0 | 3>>;
		HPivs?: Partial<StatsTable>;
		HPdvs?: Partial<StatsTable>;
	}
>;
