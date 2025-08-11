export function HSL(name: string, original?: boolean | undefined): NameColor;
export function update(...types: Updates[]): Promise<Updates[]>;
export function uploadToPastie(text: string, callback?: ((url: string) => void) | undefined): Promise<string>;
/**
 * @overload
 * @param input {PokePasteInput}
 * @param output {'' | undefined | void}
 * @returns {Promise<string>} The uploaded URL.
 */
export function uploadToPokepaste(input: PokePasteInput, output: '' | undefined | void): Promise<string>;
/**
 * @overload
 * @param input {PokePasteInput}
 * @param output {'raw'}
 * @returns {Promise<string>} The 'raw' version of the uploaded URL.
 */
export function uploadToPokepaste(input: PokePasteInput, output: 'raw'): Promise<string>;
/**
 * @overload
 * @param input {PokePasteInput}
 * @param output {'html'}
 * @returns {Promise<string>} The returned HTML for the uploaded URL.
 */
export function uploadToPokepaste(input: PokePasteInput, output: 'html'): Promise<string>;
export function escapeHTML(input: string): string;
export function unescapeHTML(input: string): string;
export const formatText: (str: string, isTrusted?: boolean | undefined, replaceLinebreaks?: boolean | undefined) => string;
export type NameColor = {
	source: string;
	hsl: [number, number, number];
	base?: Omit<NameColor, 'base'>;
};
export type Updates =
	| any
	| 'abilities'
	| 'aliases'
	| 'formatsdata'
	| 'formats'
	| 'items'
	| 'learnsets'
	| 'moves'
	| 'pokedex'
	| 'typechart'
	| 'colors';
export type PokePasteConfig = {
	title: string;
	author: string;
	notes: string;
	paste: string;
};
export type PokePasteInput = PokePasteConfig | string;
/**
 * @param text {string} The input value
 * @returns {string} The ID of the given input
 */
export function toID(text: string): string;
/**
 * @param text {string} The input value
 * @returns {string} The room ID of the given input (preserves '-')
 */
export function toRoomID(text: string): string;
