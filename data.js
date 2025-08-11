// @ts-check
/**
 * @import { Ability, IsNonstandard, Format, Item, Learnset, Move, Species, Types, StatsTable } from './types/data.d.ts';
 */

/** @deprecated This will be removed in a future release! */
exports.abilities = /** @type {Record<string, Ability>} */ (require('./showdown/abilities.js').BattleAbilities);
/** @deprecated This will be removed in a future release! */
exports.aliases = /** @type {Record<string, string>} */ (require('./showdown/aliases.js').BattleAliases);
/** @deprecated This will be removed in a future release! */
exports.formatsData = /** @type {Record<string, {
  isNonstandard?: IsNonstandard;
  tier?: string;
  doublesTier?: string;
  natDexTier?: string
}>} */ (require('./showdown/formats-data.js').BattleFormatsData);
/** @deprecated This will be removed in a future release! */
exports.formats = /** @type {({ section: string; column?: number } | Format)[]} */ (require('./showdown/formats.js').Formats);
/** @deprecated This will be removed in a future release! */
exports.items = /** @type {Record<string, Item>} */ (require('./showdown/items.js').BattleItems);
/** @deprecated This will be removed in a future release! */
exports.learnsets = /** @type {Record<string, Learnset>} */ (require('./showdown/learnsets.js').BattleLearnsets);
/** @deprecated This will be removed in a future release! */
exports.moves = /** @type {Record<string, Move>} */ (/** @type {unknown} */ (require('./showdown/moves.json')));
/** @deprecated This will be removed in a future release! */
exports.pokedex = /** @type {Record<string, Species>} */ (require('./showdown/pokedex.json'));
/** @deprecated This will be removed in a future release! */
exports.typechart = /** @type {Record<
	Lowercase<Types>,
	{
		damageTaken: Record<Types, 0 | 1 | 2 | 3> &
			Partial<Record<'prankster' | 'brn' | 'trapped' | 'powder' | 'par' | 'sandstorm' | 'hail' | 'frz' | 'psn' | 'tox', 0 | 3>>;
		HPivs?: Partial<StatsTable>;
		HPdvs?: Partial<StatsTable>;
	}
>} */ (require('./showdown/typechart.js').BattleTypeChart);
