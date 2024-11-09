import Room from './room';

export type HTMLopts = {
	name?: string;
	rank?: '+' | '%' | '*' | '@' | '#' | '§' | '&';
	change?: boolean;
	notransform?: boolean;
	// Only used for User#HTML methods.
	room?: string | Room;
};
