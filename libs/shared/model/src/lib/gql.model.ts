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
	assignment?: Maybe<EntityAssignment>;
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

export type CreateOngoingOperationArgs = {
	alarmKeyword: Scalars['String']['input'];
	assignedAlertGroups: Array<CreateOperationInvolvedAlertGroupInput>;
	assignedUnitIds: Array<Scalars['String']['input']>;
	location: OperationLocationInput;
	start: Scalars['DateTime']['input'];
};

export type CreateOperationInput = {
	alarmKeyword: Scalars['String']['input'];
	assignedAlertGroups: Array<CreateOperationInvolvedAlertGroupInput>;
	assignedUnitIds: Array<Scalars['String']['input']>;
	end: Scalars['DateTime']['input'];
	location: OperationLocationInput;
	start: Scalars['DateTime']['input'];
};

export type CreateOperationInvolvedAlertGroupInput = {
	alertGroupId: Scalars['String']['input'];
	assignedUnitIds: Array<Scalars['String']['input']>;
};

export type DeletedOperationModel = {
	__typename?: 'DeletedOperationModel';
	operationId: Scalars['String']['output'];
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

export type EntityAssignment =
	| EntityOperationAssignment
	| EntityRescueStationAssignment;

export type EntityOperationAssignment = {
	__typename?: 'EntityOperationAssignment';
	createdAt: Scalars['DateTime']['output'];
	id: Scalars['ID']['output'];
	operation: Operation;
	orgId: Scalars['String']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
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

export enum FilterableOperationProcessState {
	Active = 'ACTIVE',
	Archived = 'ARCHIVED',
	Completed = 'COMPLETED',
	OnGoing = 'ON_GOING',
}

export type FurtherAttribute = {
	__typename?: 'FurtherAttribute';
	name: Scalars['String']['output'];
	value: Scalars['String']['output'];
};

export type InvolvementTime = {
	__typename?: 'InvolvementTime';
	end?: Maybe<Scalars['DateTime']['output']>;
	start: Scalars['DateTime']['output'];
};

export type Mutation = {
	__typename?: 'Mutation';
	archiveOperation: Scalars['Boolean']['output'];
	changeEmail: Scalars['Boolean']['output'];
	changeRole: Scalars['Boolean']['output'];
	createCommunicationMessage: CommunicationMessage;
	/** Starts a new ongoing operation with a protocol entry. */
	createOngoingOperation: Operation;
	createOperation: Operation;
	createOrganization: OrganizationEntity;
	createUser: UserEntity;
	deactivateUser: Scalars['Boolean']['output'];
	deleteOperation: Scalars['Boolean']['output'];
	/** Ends an ongoing operation with a protocol entry.tet */
	endOngoingOperation: Operation;
	reactivateUser: Scalars['Boolean']['output'];
	resetCurrentAlertGroupUnits: Array<AlertGroup>;
	resetRescueStations: Array<RescueStationDeploymentEntity>;
	resetUnitNotes: Array<Unit>;
	setCurrentAlertGroupUnits: AlertGroup;
	signInRescueStation: RescueStationDeployment;
	signOffRescueStation: RescueStationDeployment;
	updateOperationBaseData: Operation;
	updateOperationInvolvements: Operation;
	updateOrganizationGeoSettings: OrganizationEntity;
	updateRescueStationNote: RescueStationDeployment;
	updateSignedInRescueStation: RescueStationDeployment;
	updateUnitNote: Unit;
	updateUnitStatus: Unit;
};

export type MutationArchiveOperationArgs = {
	id: Scalars['ID']['input'];
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

export type MutationCreateOngoingOperationArgs = {
	operation: CreateOngoingOperationArgs;
	protocolMessage: BaseCreateMessageInput;
};

export type MutationCreateOperationArgs = {
	operation: CreateOperationInput;
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

export type MutationDeleteOperationArgs = {
	id: Scalars['ID']['input'];
};

export type MutationEndOngoingOperationArgs = {
	operationId: Scalars['String']['input'];
	protocolMessage: BaseCreateMessageInput;
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

export type MutationUpdateOperationBaseDataArgs = {
	data: UpdateOperationBaseDataInput;
	id: Scalars['ID']['input'];
};

export type MutationUpdateOperationInvolvementsArgs = {
	id: Scalars['ID']['input'];
	involvements: UpdateOperationInvolvementsInput;
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

export type Operation = {
	__typename?: 'Operation';
	alarmKeyword: Scalars['String']['output'];
	alertGroupInvolvements: Array<OperationAlertGroupInvolvement>;
	categories: Array<OperationCategory>;
	commander: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	description: Scalars['String']['output'];
	end?: Maybe<Scalars['DateTime']['output']>;
	externalReference: Scalars['String']['output'];
	id: Scalars['ID']['output'];
	location: OperationLocation;
	orgId: Scalars['String']['output'];
	patients: Array<OperationPatient>;
	processState: OperationProcessState;
	protocol: Array<ProtocolEntryUnion>;
	reporter: Scalars['String']['output'];
	sign: Scalars['String']['output'];
	start: Scalars['DateTime']['output'];
	unitInvolvements: Array<OperationUnitInvolvement>;
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type OperationAlertGroupInvolvement = {
	__typename?: 'OperationAlertGroupInvolvement';
	alertGroup: AlertGroup;
	unitInvolvements: Array<OperationUnitInvolvement>;
};

export type OperationAssignmentsUpdatedMessagePayload = {
	__typename?: 'OperationAssignmentsUpdatedMessagePayload';
	assignedAlertGroups: Array<OperationMessageAssignedAlertGroup>;
	assignedUnits: Array<OperationMessageAssignedUnit>;
	operationId: Scalars['String']['output'];
	operationSign: Scalars['String']['output'];
};

export type OperationBaseAddress = {
	__typename?: 'OperationBaseAddress';
	city: Scalars['String']['output'];
	postalCode: Scalars['String']['output'];
	street: Scalars['String']['output'];
};

export type OperationBaseAddressInput = {
	city: Scalars['String']['input'];
	postalCode: Scalars['String']['input'];
	street: Scalars['String']['input'];
};

export type OperationCategory = {
	__typename?: 'OperationCategory';
	count: Scalars['Float']['output'];
	dangerousSituationCount: Scalars['Float']['output'];
	name: Scalars['String']['output'];
	patientCount: Scalars['Float']['output'];
	wasDangerous: Scalars['Boolean']['output'];
};

export type OperationCategoryInput = {
	count: Scalars['Float']['input'];
	dangerousSituationCount: Scalars['Float']['input'];
	name: Scalars['String']['input'];
	patientCount: Scalars['Float']['input'];
	wasDangerous: Scalars['Boolean']['input'];
};

export type OperationDeployment = {
	__typename?: 'OperationDeployment';
	assignments: Array<DeploymentAssignment>;
	createdAt: Scalars['DateTime']['output'];
	id: Scalars['ID']['output'];
	operation: Operation;
	orgId: Scalars['String']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type OperationEndedMessagePayload = {
	__typename?: 'OperationEndedMessagePayload';
	operationId: Scalars['String']['output'];
	operationSign: Scalars['String']['output'];
};

export type OperationFilterInput = {
	processStates?: InputMaybe<Array<FilterableOperationProcessState>>;
};

export type OperationInvolvementTimeInput = {
	end?: InputMaybe<Scalars['DateTime']['input']>;
	start: Scalars['DateTime']['input'];
};

export type OperationLocation = {
	__typename?: 'OperationLocation';
	address: OperationLocationAddress;
	coordinate?: Maybe<Coordinate>;
};

export type OperationLocationAddress = {
	__typename?: 'OperationLocationAddress';
	city: Scalars['String']['output'];
	name: Scalars['String']['output'];
	postalCode: Scalars['String']['output'];
	street: Scalars['String']['output'];
};

export type OperationLocationAddressInput = {
	city: Scalars['String']['input'];
	name: Scalars['String']['input'];
	postalCode: Scalars['String']['input'];
	street: Scalars['String']['input'];
};

export type OperationLocationInput = {
	address: OperationLocationAddressInput;
	coordinate?: InputMaybe<CoordinateInput>;
};

export type OperationMessageAssignedAlertGroup = {
	__typename?: 'OperationMessageAssignedAlertGroup';
	alertGroupId: Scalars['String']['output'];
	alertGroupName: Scalars['String']['output'];
	assignedUnits: Array<OperationMessageAssignedUnit>;
};

export type OperationMessageAssignedUnit = {
	__typename?: 'OperationMessageAssignedUnit';
	unitId: Scalars['String']['output'];
	unitName: Scalars['String']['output'];
	unitSign: Scalars['String']['output'];
};

export type OperationPatient = {
	__typename?: 'OperationPatient';
	address: OperationBaseAddress;
	birthDate?: Maybe<Scalars['DateTime']['output']>;
	firstName: Scalars['String']['output'];
	lastName: Scalars['String']['output'];
	phoneNumber: Scalars['String']['output'];
	whereabouts: Scalars['String']['output'];
};

export type OperationPatientInput = {
	address: OperationBaseAddressInput;
	birthDate?: InputMaybe<Scalars['DateTime']['input']>;
	firstName: Scalars['String']['input'];
	lastName: Scalars['String']['input'];
	phoneNumber: Scalars['String']['input'];
	whereabouts: Scalars['String']['input'];
};

export enum OperationProcessState {
	Archived = 'ARCHIVED',
	Completed = 'COMPLETED',
	Deleted = 'DELETED',
	OnGoing = 'ON_GOING',
}

export type OperationStartedMessageLocation = {
	__typename?: 'OperationStartedMessageLocation';
	city: Scalars['String']['output'];
	name: Scalars['String']['output'];
	postalCode: Scalars['String']['output'];
	street: Scalars['String']['output'];
};

export type OperationStartedMessagePayload = {
	__typename?: 'OperationStartedMessagePayload';
	alarmKeyword: Scalars['String']['output'];
	assignedAlertGroups: Array<OperationMessageAssignedAlertGroup>;
	assignedUnits: Array<OperationMessageAssignedUnit>;
	location: OperationStartedMessageLocation;
	operationId: Scalars['String']['output'];
	operationSign: Scalars['String']['output'];
	start: Scalars['DateTime']['output'];
};

export type OperationUnitInvolvement = {
	__typename?: 'OperationUnitInvolvement';
	involvementTimes: Array<InvolvementTime>;
	isPending: Scalars['Boolean']['output'];
	unit: Unit;
};

export type OrganizationEntity = {
	__typename?: 'OrganizationEntity';
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

export type ProtocolEntryUnion =
	| CommunicationMessage
	| RescueStationSignOffMessage
	| RescueStationSignOnMessage
	| RescueStationUpdateMessage;

export type Query = {
	__typename?: 'Query';
	alertGroup: AlertGroup;
	alertGroups: Array<AlertGroup>;
	operation: Operation;
	operationDeployments: Array<OperationDeployment>;
	operations: Array<Operation>;
	organization: OrganizationEntity;
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

export type QueryOperationArgs = {
	id: Scalars['ID']['input'];
};

export type QueryOperationsArgs = {
	filter?: InputMaybe<OperationFilterInput>;
	sortBySignAsc?: InputMaybe<Scalars['Boolean']['input']>;
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

export type RescueStationSignOffMessage = {
	__typename?: 'RescueStationSignOffMessage';
	channel: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	id: Scalars['ID']['output'];
	orgId: Scalars['String']['output'];
	payload: RescueStationSignOffMessagePayload;
	producer: UserProducer;
	recipient: UnitUnion;
	searchableText: Scalars['String']['output'];
	sender: UnitUnion;
	time: Scalars['DateTime']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RescueStationSignOffMessagePayload = {
	__typename?: 'RescueStationSignOffMessagePayload';
	rescueStationCallSign: Scalars['String']['output'];
	rescueStationId: Scalars['String']['output'];
	rescueStationName: Scalars['String']['output'];
};

export type RescueStationSignOnMessage = {
	__typename?: 'RescueStationSignOnMessage';
	channel: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	id: Scalars['ID']['output'];
	orgId: Scalars['String']['output'];
	payload: RescueStationMessagePayload;
	producer: UserProducer;
	recipient: UnitUnion;
	searchableText: Scalars['String']['output'];
	sender: UnitUnion;
	time: Scalars['DateTime']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RescueStationStrength = {
	__typename?: 'RescueStationStrength';
	helpers: Scalars['Float']['output'];
	leaders: Scalars['Float']['output'];
	subLeaders: Scalars['Float']['output'];
};

export type RescueStationUpdateMessage = {
	__typename?: 'RescueStationUpdateMessage';
	channel: Scalars['String']['output'];
	createdAt: Scalars['DateTime']['output'];
	id: Scalars['ID']['output'];
	orgId: Scalars['String']['output'];
	payload: RescueStationMessagePayload;
	producer: UserProducer;
	recipient: UnitUnion;
	searchableText: Scalars['String']['output'];
	sender: UnitUnion;
	time: Scalars['DateTime']['output'];
	updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum Role {
	Admin = 'ADMIN',
	OrganizationAdmin = 'ORGANIZATION_ADMIN',
	User = 'USER',
}

export type Subscription = {
	__typename?: 'Subscription';
	currentUserDeactivated: UserDeactivated;
	operationCreated: Operation;
	operationDeleted: DeletedOperationModel;
	operationDeploymentCreated: OperationDeployment;
	operationDeploymentUpdated: OperationDeployment;
	protocolEntryCreated: ProtocolEntryUnion;
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
	assignment?: Maybe<EntityAssignment>;
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

export type UpdateOperationAlertGroupInvolvementInput = {
	alertGroupId: Scalars['String']['input'];
	unitInvolvements: Array<UpdateOperationUnitInvolvementInput>;
};

export type UpdateOperationBaseDataInput = {
	alarmKeyword?: InputMaybe<Scalars['String']['input']>;
	categories?: InputMaybe<Array<OperationCategoryInput>>;
	commander?: InputMaybe<Scalars['String']['input']>;
	description?: InputMaybe<Scalars['String']['input']>;
	end?: InputMaybe<Scalars['DateTime']['input']>;
	externalReference?: InputMaybe<Scalars['String']['input']>;
	location?: InputMaybe<OperationLocationInput>;
	patients?: InputMaybe<Array<OperationPatientInput>>;
	reporter?: InputMaybe<Scalars['String']['input']>;
	start?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateOperationInvolvementsInput = {
	alertGroupInvolvements: Array<UpdateOperationAlertGroupInvolvementInput>;
	unitInvolvements: Array<UpdateOperationUnitInvolvementInput>;
};

export type UpdateOperationUnitInvolvementInput = {
	involvementTimes: Array<OperationInvolvementTimeInput>;
	isPending?: Scalars['Boolean']['input'];
	unitId: Scalars['String']['input'];
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
