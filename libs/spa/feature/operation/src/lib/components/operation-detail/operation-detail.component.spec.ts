import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { SelectedOperationIdStateService } from '../../service/selected-operation-id-state.service';
import { TabsFormStateService } from '../../service/tabs-form-state.service';
import { OperationBaseDataComponent } from './base-data/operation-base-data.component';
import { OperationDescriptionComponent } from './description/operation-description.component';
import { OperationInvolvementsComponent } from './involvements/operation-involvements.component';
import { OperationDetailComponent } from './operation-detail.component';
import { OperationPatientsComponent } from './patients/operation-patients.component';

describe('OperationDetailComponent', () => {
	let component: OperationDetailComponent;
	let fixture: ComponentFixture<OperationDetailComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NoopAnimationsModule],
			providers: [
				TabsFormStateService,
				SelectedOperationIdStateService,
				{
					provide: GraphqlService,
					useValue: createMock({
						query: () => ({
							$: of(),
							refresh: () => Promise.resolve({}),
						}),
					}),
				},
				DatePipe,
			],
			schemas: [NO_ERRORS_SCHEMA],
		})
			.overrideComponent(OperationBaseDataComponent, {
				set: {
					template: '<div>Base Data</div>',
				},
			})
			.overrideComponent(OperationDescriptionComponent, {
				set: {
					template: '<div>Description</div>',
				},
			})
			.overrideComponent(OperationInvolvementsComponent, {
				set: {
					template: '<div>Involvements</div>',
				},
			})
			.overrideComponent(OperationPatientsComponent, {
				set: {
					template: '<div>Patients</div>',
				},
			})

			.compileComponents();

		fixture = TestBed.createComponent(OperationDetailComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
