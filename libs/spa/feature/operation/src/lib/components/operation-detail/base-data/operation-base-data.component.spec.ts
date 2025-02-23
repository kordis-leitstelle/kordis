import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GeoSearchService } from '@kordis/spa/core/geocoding';
import { GraphqlService } from '@kordis/spa/core/graphql';

import { SelectedOperationIdStateService } from '../../../service/selected-operation-id-state.service';
import { TabsFormStateService } from '../../../service/tabs-form-state.service';
import { OperationBaseDataComponent } from './operation-base-data.component';

describe('OperationBaseDataComponent', () => {
	let fixture: ComponentFixture<OperationBaseDataComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationBaseDataComponent],
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
				{
					provide: GeoSearchService,
					useValue: createMock<GeoSearchService>(),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationBaseDataComponent);
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
