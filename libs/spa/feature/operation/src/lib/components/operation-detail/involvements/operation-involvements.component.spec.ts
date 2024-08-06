import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { SelectedOperationIdStateService } from '../../../service/selected-operation-id-state.service';
import { TabsFormStateService } from '../../../service/tabs-form-state.service';
import { OperationInvolvementsComponent } from './operation-involvements.component';

describe('OperationInvolvementsComponent', () => {
	let component: OperationInvolvementsComponent;
	let fixture: ComponentFixture<OperationInvolvementsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationInvolvementsComponent],
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

		fixture = TestBed.createComponent(OperationInvolvementsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
