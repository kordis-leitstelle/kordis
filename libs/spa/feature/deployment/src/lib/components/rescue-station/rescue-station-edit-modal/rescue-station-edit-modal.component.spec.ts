import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { RescueStationEditModalComponent } from './rescue-station-edit-modal.component';
import { RescueStationEditService } from './service/rescue-station-edit.service';

describe('RescueStationEditModalComponent', () => {
	let fixture: ComponentFixture<RescueStationEditModalComponent>;

	beforeEach(() => {
		TestBed.overrideProvider(NzModalRef, {
			useValue: createMock<NzModalRef>(),
		})
			.overrideProvider(RescueStationEditService, {
				useValue: createMock<RescueStationEditService>(),
			})
			.overrideProvider(GraphqlService, {
				useValue: createMock<GraphqlService>(),
			})
			.configureTestingModule({
				imports: [NoopAnimationsModule],
			});
	});

	it('should default units if not signed in', () => {
		TestBed.overrideProvider(NZ_MODAL_DATA, {
			useValue: {
				strength: {
					helpers: 3,
					subLeaders: 2,
					leaders: 1,
				},
				note: '',
				defaultUnits: [
					{
						id: '1',
						name: 'Unit 1',
						__typename: 'Unit',
					},
				],
				assignments: [],
				signedIn: false,
			},
		});
		fixture = TestBed.createComponent(RescueStationEditModalComponent);
		fixture.detectChanges();

		expect(
			fixture.componentInstance.formGroup.controls.rescueStationData.value
				.units,
		).toEqual([
			{
				id: '1',
				name: 'Unit 1',
				__typename: 'Unit',
			},
		]);
	});

	it('should set unit and alert groups from assignments', async () => {
		TestBed.overrideProvider(NZ_MODAL_DATA, {
			useValue: {
				id: '1',
				strength: {
					helpers: 3,
					subLeaders: 2,
					leaders: 1,
				},
				note: '',
				defaultUnits: [],
				assignments: [
					{
						unit: {
							id: '1',
							name: 'Unit 1',
							__typename: 'Unit',
						},
						__typename: 'DeploymentUnit',
					},
					{
						__typename: 'DeploymentAlertGroup',
						alertGroup: {
							id: '1',
							name: 'Group 1',
							__typename: 'AlertGroup',
						},
						assignedUnits: [
							{
								unit: {
									id: '2',
									name: 'Unit 2',
									__typename: 'Unit',
								},
							},
						],
					},
				],
				signedIn: true,
			},
		});
		fixture = TestBed.createComponent(RescueStationEditModalComponent);
		fixture.detectChanges();

		expect(
			fixture.componentInstance.formGroup.controls.rescueStationData.value
				.units,
		).toEqual([
			{
				id: '1',
				name: 'Unit 1',
				__typename: 'Unit',
			},
		]);
		expect(
			fixture.componentInstance.formGroup.controls.rescueStationData.value
				.alertGroups,
		).toEqual([
			{
				alertGroup: {
					__typename: 'AlertGroup',
					id: '1',
					name: 'Group 1',
				},
				assignedUnits: [
					{
						__typename: 'Unit',
						id: '2',
						name: 'Unit 2',
					},
				],
			},
		]);
	});
});
