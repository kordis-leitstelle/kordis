import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { SelectedOperationIdStateService } from '../../../service/selected-operation-id-state.service';
import { TabsFormStateService } from '../../../service/tabs-form-state.service';
import { OperationPatientsComponent } from './operation-patients.component';

describe('OperationPatientsComponent', () => {
	let component: OperationPatientsComponent;
	let fixture: ComponentFixture<OperationPatientsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: GraphqlService,
					useValue: createMock<GraphqlService>({
						query: () => ({
							$: of(),
							refresh: () => Promise.resolve({}),
						}),
					}),
				},
				SelectedOperationIdStateService,
				TabsFormStateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationPatientsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
