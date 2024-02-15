export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
	T extends { [key: string]: unknown },
	K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
	| T
	| {
			[P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
	  };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
};

export type AppData = {
	__typename?: 'AppData';
	message: Scalars['String']['output'];
};

export type BBox = {
	__typename?: 'BBox';
	bottomRight: Coordinate;
	topLeft: Coordinate;
};

export type BBoxInput = {
	bottomRight: CoordinateInput;
	topLeft: CoordinateInput;
};

export type Coordinate = {
	__typename?: 'Coordinate';
	lat: Scalars['Float']['output'];
	lon: Scalars['Float']['output'];
};

export type CoordinateInput = {
	lat: Scalars['Float']['input'];
	lon: Scalars['Float']['input'];
};

export type Mutation = {
	__typename?: 'Mutation';
	createOrganization: Organization;
	updateOrganizationGeoSettings: Organization;
};

export type MutationCreateOrganizationArgs = {
	geoSettings: OrganizationGeoSettingsInput;
	name: Scalars['String']['input'];
};

export type MutationUpdateOrganizationGeoSettingsArgs = {
	geoSettings: OrganizationGeoSettingsInput;
	id: Scalars['String']['input'];
};

export type Organization = {
	__typename?: 'Organization';
	createdAt: Scalars['String']['output'];
	geoSettings: OrganizationGeoSettings;
	id: Scalars['String']['output'];
	name: Scalars['String']['output'];
	updatedAt: Scalars['String']['output'];
};

export type OrganizationGeoSettings = {
	__typename?: 'OrganizationGeoSettings';
	bbox: BBox;
	centroid: Coordinate;
};

export type OrganizationGeoSettingsInput = {
	bbox: BBoxInput;
	centroid: CoordinateInput;
};

export type Query = {
	__typename?: 'Query';
	data: AppData;
	organization: Organization;
};

export type QueryOrganizationArgs = {
	id: Scalars['String']['input'];
};
