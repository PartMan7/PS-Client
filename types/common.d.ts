import type { Room } from '../classes/room.d.ts';

export type HTML = any;

export type Ranks = '+' | '%' | '*' | '@' | '#' | '§' | '&';

export type HTMLOptsObject = {
	name?: string;
	rank?: Ranks;
	change?: boolean;
	notransform?: boolean;
	// Only used for User#HTML methods.
	room?: string | Room;
};

export type HTMLOpts = HTMLOptsObject | string;
