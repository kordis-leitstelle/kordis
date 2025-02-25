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
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
	DateTime: { input: any; output: any };
};

export type AlertGroup = {
	__typename?: 'AlertGroup';
	assignment?: Maybe<EntityRescueStationAssignment>;
	createdAt: Scalars['DateTime']['output'];
	/** The current units of the alert group. These units will be presented to the user when the alert group is assigned to a deployment. */
	currentUnits: Array<Unit>;
	/** Units actively assigned to the alert group in its current assignment. If not assigned, the array is empty. */
	currentUnitsOfAssignment: Array<DeploymentUnit>;
	/** The default units of the alert group. These units are assigned to the alert group by default and whenever deployments are reset. */
	defaultUnits: Array<Unit>;
	id: Scalars['ID']['output'];
	name: Scalars['String']['output'];
	orgId: Scalars['String']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AlertGroupsFilter = {
	ids?: InputMaybe<Array<Scalars['ID']['input']>>;
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

export type BaseCreateMessageInput = {
	channel: Scalars['String']['input'];
	recipient: UnitInput;
	sender: UnitInput;
};

export type CommunicationMessage = {
	__typename?: 'CommunicationMessage';
	channel: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	id: Scalars['ID']['output'];
	orgId: Scalars['String']['output'];
	payload: CommunicationMessagePayload;
	producer: UserProducer;
	recipient: UnitUnion;
	searchableText: Scalars['String']['output'];
	sender: UnitUnion;
	time: Scalars['DateTime']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CommunicationMessagePayload = {
	__typename?: 'CommunicationMessagePayload';
	message: Scalars['String']['output'];
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

export type DeploymentAlertGroup = {
	__typename?: 'DeploymentAlertGroup';
	alertGroup: AlertGroup;
	assignedUnits: Array<DeploymentUnit>;
};

export type DeploymentAssignment = DeploymentAlertGroup | DeploymentUnit;

export type DeploymentUnit = {
	__typename?: 'DeploymentUnit';
	unit: Unit;
};

export type EntityRescueStationAssignment = {
	__typename?: 'EntityRescueStationAssignment';
	callSign: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	defaultUnits: Array<Unit>;
	id: Scalars['ID']['output'];
	location: RescueStationLocation;
	name: Scalars['String']['output'];
	note: Scalars['String']['output'];
	orgId: Scalars['String']['output'];
	signedIn: Scalars['Boolean']['output'];
	strength: RescueStationStrength;
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type FurtherAttribute = {
	__typename?: 'FurtherAttribute';
	name: Scalars['String']['output'];
	value: Scalars['String']['output'];
};

export type Mutation = {
	__typename?: 'Mutation';
	changeEmail: Scalars['Boolean']['output'];
	changeRole: Scalars['Boolean']['output'];
	createCommunicationMessage: CommunicationMessage;
	createOrganization: Organization;
	createUser: UserEntity;
	deactivateUser: Scalars['Boolean']['output'];
	reactivateUser: Scalars['Boolean']['output'];
	resetCurrentAlertGroupUnits: Array<AlertGroup>;
	resetRescueStations: Array<RescueStationDeploymentEntity>;
	resetUnitNotes: Array<Unit>;
	setCurrentAlertGroupUnits: AlertGroup;
	signInRescueStation: RescueStationDeployment;
	signOffRescueStation: RescueStationDeployment;
	updateOrganizationGeoSettings: Organization;
	updateRescueStationNote: RescueStationDeployment;
	updateSignedInRescueStation: RescueStationDeployment;
	updateUnitNote: Unit;
	updateUnitStatus: Unit;
};

export type MutationChangeEmailArgs = {
	newEmail: Scalars['String']['input'];
	userId: Scalars['String']['input'];
};

export type MutationChangeRoleArgs = {
	newRole: Role;
	userId: Scalars['String']['input'];
};

export type MutationCreateCommunicationMessageArgs = {
	channel: Scalars['String']['input'];
	message: Scalars['String']['input'];
	recipient: UnitInput;
	sender: UnitInput;
};

export type MutationCreateOrganizationArgs = {
	geoSettings: OrganizationGeoSettingsInput;
	name: Scalars['String']['input'];
};

export type MutationCreateUserArgs = {
	email: Scalars['String']['input'];
	firstName: Scalars['String']['input'];
	lastName: Scalars['String']['input'];
	role: Role;
	username: Scalars['String']['input'];
};

export type MutationDeactivateUserArgs = {
	userId: Scalars['String']['input'];
};

export type MutationReactivateUserArgs = {
	userId: Scalars['String']['input'];
};

export type MutationSetCurrentAlertGroupUnitsArgs = {
	alertGroupId: Scalars['ID']['input'];
	unitIds: Array<Scalars['ID']['input']>;
};

export type MutationSignInRescueStationArgs = {
	protocolMessageData: BaseCreateMessageInput;
	rescueStationData: UpdateRescueStationInput;
};

export type MutationSignOffRescueStationArgs = {
	protocolMessageData: BaseCreateMessageInput;
	rescueStationId: Scalars['String']['input'];
};

export type MutationUpdateOrganizationGeoSettingsArgs = {
	geoSettings: OrganizationGeoSettingsInput;
	id: Scalars['String']['input'];
};

export type MutationUpdateRescueStationNoteArgs = {
	id: Scalars['ID']['input'];
	note: Scalars['String']['input'];
};

export type MutationUpdateSignedInRescueStationArgs = {
	protocolMessageData?: InputMaybe<BaseCreateMessageInput>;
	rescueStationData: UpdateRescueStationInput;
};

export type MutationUpdateUnitNoteArgs = {
	note: Scalars['String']['input'];
	unitId: Scalars['ID']['input'];
};

export type MutationUpdateUnitStatusArgs = {
	status: Scalars['Int']['input'];
	unitId: Scalars['ID']['input'];
};

export type Organization = {
	__typename?: 'Organization';
	createdAt: Scalars['DateTime']['output'];
	geoSettings: OrganizationGeoSettings;
	id: Scalars['ID']['output'];
	name: Scalars['String']['output'];
	orgId: Scalars['String']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type PageInfo = {
	__typename?: 'PageInfo';
	endCursor?: Maybe<Scalars['String']['output']>;
	hasNextPage: Scalars['Boolean']['output'];
	hasPreviousPage: Scalars['Boolean']['output'];
	startCursor?: Maybe<Scalars['String']['output']>;
	totalEdges?: Maybe<Scalars['Int']['output']>;
};

export type ProtocolEntryConnection = {
	__typename?: 'ProtocolEntryConnection';
	edges: Array<ProtocolEntryEdge>;
	pageInfo: PageInfo;
};

export type ProtocolEntryEdge = {
	__typename?: 'ProtocolEntryEdge';
	/** An opaque cursor that can be used to retrieve further pages of edges before or after this one. */
	cursor: Scalars['String']['output'];
	/** The node object (belonging to type ProtocolEntryUnion) attached to the edge. */
	node: ProtocolEntryUnion;
};

export type ProtocolEntryUnion = CommunicationMessage;

export type Query = {
	__typename?: 'Query';
	alertGroup: AlertGroup;
	alertGroups: Array<AlertGroup>;
	organization: Organization;
	/** Returns protocol entries sorted by time desc. */
	protocolEntries: ProtocolEntryConnection;
	rescueStationDeployment: RescueStationDeployment;
	rescueStationDeployments: Array<RescueStationDeployment>;
	unassignedEntities: Array<DeploymentAssignment>;
	unit: Unit;
	units: Array<Unit>;
	userLoginHistory: Array<Scalars['String']['output']>;
	users: Array<UserEntity>;
};

export type QueryAlertGroupArgs = {
	id: Scalars['ID']['input'];
};

export type QueryAlertGroupsArgs = {
	filter?: InputMaybe<AlertGroupsFilter>;
};

export type QueryOrganizationArgs = {
	id: Scalars['String']['input'];
};

export type QueryProtocolEntriesArgs = {
	after?: InputMaybe<Scalars['String']['input']>;
	before?: InputMaybe<Scalars['String']['input']>;
	first?: InputMaybe<Scalars['Int']['input']>;
	last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryRescueStationDeploymentArgs = {
	id: Scalars['ID']['input'];
};

export type QueryRescueStationDeploymentsArgs = {
	signedIn?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryUnitArgs = {
	id: Scalars['ID']['input'];
};

export type QueryUnitsArgs = {
	filter?: InputMaybe<UnitsFilter>;
};

export type QueryUserLoginHistoryArgs = {
	historyLength?: Scalars['Float']['input'];
	userId: Scalars['String']['input'];
};

export type RegisteredUnit = {
	__typename?: 'RegisteredUnit';
	unit: Unit;
};

export type RescueStationAddress = {
	__typename?: 'RescueStationAddress';
	city: Scalars['String']['output'];
	postalCode: Scalars['String']['output'];
	street: Scalars['String']['output'];
};

export type RescueStationDeployment = {
	__typename?: 'RescueStationDeployment';
	assignments: Array<DeploymentAssignment>;
	callSign: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	defaultUnits: Array<Unit>;
	id: Scalars['ID']['output'];
	location: RescueStationLocation;
	name: Scalars['String']['output'];
	note: Scalars['String']['output'];
	orgId: Scalars['String']['output'];
	signedIn: Scalars['Boolean']['output'];
	strength: RescueStationStrength;
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RescueStationDeploymentEntity = {
	__typename?: 'RescueStationDeploymentEntity';
	callSign: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	defaultUnits: Array<Unit>;
	id: Scalars['ID']['output'];
	location: RescueStationLocation;
	name: Scalars['String']['output'];
	note: Scalars['String']['output'];
	orgId: Scalars['String']['output'];
	signedIn: Scalars['Boolean']['output'];
	strength: RescueStationStrength;
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RescueStationLocation = {
	__typename?: 'RescueStationLocation';
	address: RescueStationAddress;
	coordinate: Coordinate;
};

export type RescueStationMessageAssignedAlertGroup = {
	__typename?: 'RescueStationMessageAssignedAlertGroup';
	id: Scalars['String']['output'];
	name: Scalars['String']['output'];
	units: Array<RescueStationMessageAssignedUnit>;
};

export type RescueStationMessageAssignedUnit = {
	__typename?: 'RescueStationMessageAssignedUnit';
	callSign: Scalars['String']['output'];
	id: Scalars['String']['output'];
	name: Scalars['String']['output'];
};

export type RescueStationMessagePayload = {
	__typename?: 'RescueStationMessagePayload';
	alertGroups: Array<RescueStationMessageAssignedAlertGroup>;
	rescueStationCallSign: Scalars['String']['output'];
	rescueStationId: Scalars['String']['output'];
	rescueStationName: Scalars['String']['output'];
	strength: RescueStationMessageStrength;
	units: Array<RescueStationMessageAssignedUnit>;
};

export type RescueStationMessageStrength = {
	__typename?: 'RescueStationMessageStrength';
	helpers: Scalars['Float']['output'];
	leaders: Scalars['Float']['output'];
	subLeaders: Scalars['Float']['output'];
};

export type RescueStationSignOffMessagePayload = {
	__typename?: 'RescueStationSignOffMessagePayload';
	rescueStationCallSign: Scalars['String']['output'];
	rescueStationId: Scalars['String']['output'];
	rescueStationName: Scalars['String']['output'];
};

export type RescueStationStrength = {
	__typename?: 'RescueStationStrength';
	helpers: Scalars['Float']['output'];
	leaders: Scalars['Float']['output'];
	subLeaders: Scalars['Float']['output'];
};

export enum Role {
	Admin = 'ADMIN',
	OrganizationAdmin = 'ORGANIZATION_ADMIN',
	User = 'USER',
}

export type Subscription = {
	__typename?: 'Subscription';
	currentUserDeactivated: UserDeactivated;
	rescueStationNoteUpdated: RescueStationDeployment;
	rescueStationSignedIn: RescueStationDeployment;
	rescueStationSignedOff: RescueStationDeployment;
	rescueStationsReset: Scalars['Boolean']['output'];
	signedInRescueStationUpdated: RescueStationDeployment;
	unitStatusUpdated: Unit;
};

export type Unit = {
	__typename?: 'Unit';
	alertGroup?: Maybe<AlertGroup>;
	assignment?: Maybe<EntityRescueStationAssignment>;
	callSign: Scalars['String']['output'];
	callSignAbbreviation: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	department: Scalars['String']['output'];
	furtherAttributes: Array<FurtherAttribute>;
	id: Scalars['ID']['output'];
	name: Scalars['String']['output'];
	note: Scalars['String']['output'];
	orgId: Scalars['String']['output'];
	rcsId: Scalars['String']['output'];
	status?: Maybe<UnitStatus>;
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UnitInput = {
	id?: InputMaybe<Scalars['String']['input']>;
	name?: InputMaybe<Scalars['String']['input']>;
	type: Scalars['String']['input'];
};

export type UnitStatus = {
	__typename?: 'UnitStatus';
	receivedAt: Scalars['String']['output'];
	source: Scalars['String']['output'];
	status: Scalars['Float']['output'];
};

export type UnitUnion = RegisteredUnit | UnknownUnit;

export type UnitsFilter = {
	ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UnknownUnit = {
	__typename?: 'UnknownUnit';
	name: Scalars['String']['output'];
};

export type UpdateRescueStationAssignedAlertGroup = {
	alertGroupId: Scalars['String']['input'];
	unitIds: Array<Scalars['String']['input']>;
};

export type UpdateRescueStationInput = {
	/** The Alert Groups to assign. If a Unit is currently assigned to another Rescue Station it will be released first. If the alert group is assigned to another deployment, it will be released and units that are not assigned within the new assignment will be kept as normally assigned units in the deployment. Alert Groups and Units currently assigned to an operation will result in an error! */
	assignedAlertGroups: Array<UpdateRescueStationAssignedAlertGroup>;
	/** The Units to assign. If a Unit is currently assigned to another Rescue Station it will be released first. Units currently assigned to an operation will result in an error! */
	assignedUnitIds: Array<Scalars['String']['input']>;
	note?: Scalars['String']['input'];
	rescueStationId: Scalars['String']['input'];
	strength: UpdateRescueStationStrength;
};

export type UpdateRescueStationStrength = {
	helpers: Scalars['Float']['input'];
	leaders: Scalars['Float']['input'];
	subLeaders: Scalars['Float']['input'];
};

export type UserDeactivated = {
	__typename?: 'UserDeactivated';
	userId?: Maybe<Scalars['String']['output']>;
};

export type UserEntity = {
	__typename?: 'UserEntity';
	deactivated: Scalars['Boolean']['output'];
	email: Scalars['String']['output'];
	firstName: Scalars['String']['output'];
	id: Scalars['ID']['output'];
	lastName: Scalars['String']['output'];
	organizationId: Scalars['String']['output'];
	role: Scalars['String']['output'];
	userName: Scalars['String']['output'];
};

export type UserProducer = {
	__typename?: 'UserProducer';
	firstName: Scalars['String']['output'];
	lastName: Scalars['String']['output'];
	userId: Scalars['String']['output'];
};
