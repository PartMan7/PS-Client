import type { Datacenters } from './data';

type Namecolour = {
	source: string;
	hsl: [number, number, number];
	base?: Omit<Namecolour, 'base'>;
};

type PokePaste = {
	title: string;
	author: string;
	notes: string;
	paste: string;
};

type FetchType =
	| 'abilities'
	| 'aliases'
	| 'colors'
	| 'formatsdata'
	| 'formats'
	| 'items'
	| 'learnsets'
	| 'moves'
	| 'pokedex'
	| 'typechart';

type HSLOptions = {
	original?: boolean;
	customColors?: Record<string, string>;
};

/**
 * @param text The input value
 * @returns The ID of the given input
 */
export function toID(text: any): string;
/**
 * @param text The input value
 * @returns The room ID of the given input (preserves '-')
 */
export function toRoomID(text: any): string;

/**
 * @param name - The username whose HSL value is to be calculated
 * @param opts - Optional original colour override and PS custom colour map
 * @returns An object with the required details (HSL values in namecolour.hsl)
 */
export function HSL(name: string, opts?: HSLOptions): Namecolour;

/**
 * @param types - Datacenter(s) to fetch from play.pokemonshowdown.com. Fetches all when omitted.
 * @returns A promise with the requested datacenter data
 */
export function fetch(...types: FetchType[]): Promise<Partial<Datacenters>>;

/**
 * @param text - The text to upload
 * @param callback - An optional callback to run with the returned URL
 * @returns A promise that resolves with the uploaded URL
 */
export function uploadToPastie(text: string, callback?: (url: string) => any): Promise<string>;

/**
 * @param input - The input to upload (can be an object or a string)
 * @param output - An optional string to dictate the resolution value of the promise ('raw' for the URL with the raw text, 'html' for the source HTML). Leave empty for the standard URL.
 * @returns A promise with the value dictated by output
 */
export function uploadToPokepaste(input: string | PokePaste, output?: 'raw' | 'html' | void): Promise<string>;

/**
 * @param input - The text to sanitize HTML from
 * @returns The HTML-sanitized text
 */
export function escapeHTML(input: string): string;

/**
 * @param input - The text to desanitize HTML from
 * @returns The HTML-desanitized text
 */
export function unescapeHTML(input: string): string;

/**
 * @param input - The text to format
 * @returns The formatted text
 */
export function formatText(input: string): string;
