import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { GeoSearchService } from '@kordis/spa/core/geocoding';

import { OperationBaseDataFormComponent } from './operation-base-data-form.component';

describe('OperationBaseDataComponent', () => {
	let fixture: ComponentFixture<OperationBaseDataFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationBaseDataFormComponent],
			providers: [
				{
					provide: GeoSearchService,
					useValue: createMock<GeoSearchService>(),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationBaseDataFormComponent);
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
