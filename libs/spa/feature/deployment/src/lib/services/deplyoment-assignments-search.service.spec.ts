import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import {
	AlertGroup,
	DeploymentAlertGroup,
	DeploymentAssignment,
	DeploymentUnit,
} from '@kordis/shared/model';
import { GraphqlService } from '@kordis/spa/core/graphql';

import { DeploymentAssignmentsSearchService } from './deplyoment-assignments-search.service';

describe('DeploymentAssignmentsSearchService', () => {
	let service: DeploymentAssignmentsSearchService;
	let gqlService: DeepMocked<GraphqlService>;

	beforeEach(() => {
		gqlService = createMock();

		TestBed.configureTestingModule({
			providers: [
				DeploymentAssignmentsSearchService,
				{ provide: GraphqlService, useValue: gqlService },
			],
		});

		service = TestBed.inject(DeploymentAssignmentsSearchService);
	});

	describe('updateAssignments', () => {
		it('should index only new items', () => {
			const assignments: DeploymentAssignment[] = [
				{
					__typename: 'DeploymentUnit',
					unit: { id: '1', name: 'Unit 1', callSign: 'U1' },
				} as DeploymentUnit,
				{
					__typename: 'DeploymentAlertGroup',
					alertGroup: { id: '2', name: 'Group 1' } as AlertGroup,
					assignedUnits: [],
				},
			];

			const unitSearchEngineSpy = jest.spyOn(
				service['unitSearchEngine'],
				'add',
			);
			const alertGroupSearchEngineSpy = jest.spyOn(
				service['alertGroupSearchEngine'],
				'add',
			);

			service.updateAssignments(assignments);

			expect(service['currentIndexedUnits'].has('1')).toBe(true);
			expect(service['currentIndexedAlertGroups'].has('2')).toBe(true);

			service.updateAssignments(assignments);

			expect(unitSearchEngineSpy).toHaveBeenCalledTimes(1);
			expect(alertGroupSearchEngineSpy).toHaveBeenCalledTimes(1);
		});

		it('should remove items that are not present anymore', () => {
			const initialAssignments: DeploymentAssignment[] = [
				{
					__typename: 'DeploymentUnit',
					unit: { id: '1', name: 'Unit 1', callSign: 'U1' },
				} as DeploymentUnit,
			];

			service.updateAssignments(initialAssignments);

			const newAssignments: DeploymentAssignment[] = [
				{
					__typename: 'DeploymentUnit',
					unit: { id: '2', name: 'Unit 2', callSign: 'U2' },
				} as DeploymentUnit,
			];

			service.updateAssignments(newAssignments);

			expect(service['currentIndexedUnits'].has('1')).toBe(false);
			expect(service['currentIndexedUnits'].has('2')).toBe(true);
		});
	});

	describe('search', () => {
		it('should find by name', async () => {
			const assignments: DeploymentAssignment[] = [
				{
					__typename: 'DeploymentUnit',
					unit: { id: '1', name: 'Unit 1', callSign: 'U1' },
				} as DeploymentUnit,
				{
					__typename: 'DeploymentAlertGroup',
					alertGroup: { id: '2', name: 'Group 1' } as AlertGroup,
					assignedUnits: [],
				},
				{
					__typename: 'DeploymentAlertGroup',
					alertGroup: { id: '2', name: 'Group 2' } as AlertGroup,
					assignedUnits: [],
				},
			];

			service.updateAssignments(assignments);

			gqlService.queryOnce$
				.mockReturnValueOnce(
					of({ unit: { id: '1', name: 'Unit 1', callSign: 'U1' } }),
				)
				.mockReturnValueOnce(of({ alertGroup: { id: '2', name: 'Group 1' } }));

			const results = await service.search('1');

			expect(results).toEqual([
				{
					__typename: 'DeploymentUnit',
					unit: { id: '1', name: 'Unit 1', callSign: 'U1' },
				},
				{
					__typename: 'DeploymentAlertGroup',
					alertGroup: { id: '2', name: 'Group 1' },
					assignedUnits: [],
				},
			]);
		});

		it('should find by call sign', async () => {
			const assignments: DeploymentAssignment[] = [
				{
					__typename: 'DeploymentUnit',
					unit: { id: '1', name: 'Unit 1', callSign: 'some callsign' },
				} as DeploymentUnit,
			];

			service.updateAssignments(assignments);

			gqlService.queryOnce$.mockReturnValueOnce(
				of({ unit: { id: '1', name: 'Unit 1', callSign: 'some callsign' } }),
			);

			const results = await service.search('som');

			expect(results).toEqual([
				{
					__typename: 'DeploymentUnit',
					unit: { id: '1', name: 'Unit 1', callSign: 'some callsign' },
				},
			]);
		});

		it('should find by call sign abbreviation', async () => {
			const assignments: DeploymentAssignment[] = [
				{
					__typename: 'DeploymentUnit',
					unit: {
						id: '1',
						name: 'Unit 1',
						callSign: 'some callsign',
						callSignAbbreviation: 'abbr',
					},
				} as DeploymentUnit,
			];

			service.updateAssignments(assignments);

			gqlService.queryOnce$.mockReturnValueOnce(
				of({
					unit: {
						id: '1',
						name: 'Unit 1',
						callSign: 'some callsign',
						callSignAbbreviation: 'abr',
					},
				}),
			);

			const results = await service.search('abb');

			expect(results).toEqual([
				{
					__typename: 'DeploymentUnit',
					unit: {
						id: '1',
						name: 'Unit 1',
						callSign: 'some callsign',
						callSignAbbreviation: 'abr',
					},
				},
			]);
		});
	});
});
