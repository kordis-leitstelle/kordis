import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { SelectedOperationIdStateService } from '../../../service/selected-operation-id-state.service';
import { TabsFormStateService } from '../../../service/tabs-form-state.service';
import { OperationDescriptionComponent } from './operation-description.component';

describe('OperationDescriptionTextareaComponent', () => {
	let fixture: ComponentFixture<OperationDescriptionComponent>;

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
				{
					provide: SelectedOperationIdStateService,
					useValue: createMock<SelectedOperationIdStateService>({
						selectedOperationId$: of(null),
					}),
				},
				{
					provide: TabsFormStateService,
					useValue: createMock<TabsFormStateService>(),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationDescriptionComponent);
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
