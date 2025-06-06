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

type UpdateType =
	| 'abilities'
	| 'aliases'
	| 'config'
	| 'formatsdata'
	| 'formats'
	| 'items'
	| 'learnsets'
	| 'moves'
	| 'pokedex'
	| 'typechart';

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
 * @param original - Whether the username's original colour should override the custom colour (optional)
 * @returns An object with the required details (HSL values in namecolour.hsl)
 */
export function HSL(name: string, original?: boolean): Namecolour;

/**
 * @param types - A string corresponding to the datacenter you wish to update.
 * If nothing is passed, this updates all available datacenters.
 * @returns A promise with the name(s) of the updated datacenter(s)
 */
export function update(...types: UpdateType[]): Promise<UpdateType[]>;

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
