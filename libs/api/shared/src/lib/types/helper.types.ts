export type Mutable<T> = {
	-readonly [K in keyof T]: T[K];
};

export type NoOptionals<T> = {
	[K in keyof T]-?: T[K];
};
