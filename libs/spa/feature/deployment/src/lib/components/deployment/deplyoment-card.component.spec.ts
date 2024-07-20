import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertGroup, DeploymentAssignment, Unit } from '@kordis/shared/model';

import { DeploymentCardComponent } from './deplyoment-card.component';

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

describe('DeploymentCardComponent', () => {
	let fixture: ComponentFixture<DeploymentCardComponent>;

	beforeEach(() => {
		fixture = TestBed.createComponent(DeploymentCardComponent);
	});

	it('should create', () => {
		const component = fixture.componentInstance;
		fixture.componentRef.setInput('assignments', []);
		fixture.componentRef.setInput('name', 'Deployment Name');
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	it('should sort assignments correctly', () => {
		const mockAssignments: DeploymentAssignment[] = [
			{
				__typename: 'DeploymentUnit',
				unit: { id: '3', status: { status: 4 } } as Unit,
			},
			{
				__typename: 'DeploymentUnit',
				unit: { id: '1', status: { status: 1 } } as Unit,
			},
			{
				__typename: 'DeploymentAlertGroup',
				alertGroup: { id: '1' } as AlertGroup,
				assignedUnits: [
					{
						__typename: 'DeploymentUnit',
						unit: { id: '3', status: { status: 6 } } as Unit,
					},
					{
						__typename: 'DeploymentUnit',
						unit: { id: '4', status: { status: 1 } } as Unit,
					},
				],
			},
			{
				__typename: 'DeploymentUnit',
				unit: { id: '2', status: { status: 3 } } as Unit,
			},
		];

		fixture.componentRef.setInput('assignments', mockAssignments);
		fixture.componentRef.setInput('name', 'Deployment Name');
		fixture.detectChanges();

		const sortedAssignments = fixture.componentInstance.sortedAssignments();
		expect(sortedAssignments).toEqual([
			{
				__typename: 'DeploymentUnit',
				unit: { id: '3', status: { status: 4 } },
			},
			{
				__typename: 'DeploymentUnit',
				unit: { id: '2', status: { status: 3 } },
			},
			{
				__typename: 'DeploymentUnit',
				unit: { id: '1', status: { status: 1 } },
			},
			{
				__typename: 'DeploymentAlertGroup',
				alertGroup: { id: '1' },
				assignedUnits: [
					{
						__typename: 'DeploymentUnit',
						unit: { id: '4', status: { status: 1 } },
					},
					{
						__typename: 'DeploymentUnit',
						unit: { id: '3', status: { status: 6 } },
					},
				],
			},
		]);
	});
});
