import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationBaseDataComponent } from './base-data/operation-base-data.component';
import { OperationDescriptionComponent } from './description/operation-description.component';
import { OperationInvolvementsComponent } from './involvements/operation-involvements.component';
import { OperationDetailComponent } from './operation-detail.component';
import { OperationPatientsComponent } from './patients/operation-patients.component';

describe('OperationDetailComponent', () => {
	let component: OperationDetailComponent;
	let fixture: ComponentFixture<OperationDetailComponent>;

	beforeEach(async () => {
		TestBed.overrideComponent(OperationPatientsComponent, {
			set: {
				selector: 'krd-operation-patients',
			},
		})
			.overrideComponent(OperationInvolvementsComponent, {
				set: {
					selector: 'krd-operation-involvements',
				},
			})
			.overrideComponent(OperationDescriptionComponent, {
				set: {
					selector: 'krd-operation-description',
				},
			})
			.overrideComponent(OperationBaseDataComponent, {
				set: {
					selector: 'krd-operation-base-data',
				},
			});
		fixture = TestBed.createComponent(OperationDetailComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
