import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { UnitSearchService } from '../../../../services/unit-search.service';
import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import { UnitsSelectComponent } from './units-select.component';

describe('StrengthComponent', () => {
	let fixture: ComponentFixture<UnitsSelectComponent>;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [UnitsSelectComponent, NoopAnimationsModule],
			providers: [
				PossibleUnitSelectionsService,
				{
					provide: GraphqlService,
					useValue: createMock<GraphqlService>(),
				},
				{
					provide: UnitSearchService,
					useValue: createMock<UnitSearchService>(),
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UnitsSelectComponent);
	});

	it('should create', async () => {
		fixture.componentRef.setInput(
			'control',
			new FormControl([{ id: 1, callSign: 'unit1', name: 'name' }]),
		);
		fixture.detectChanges();

		expect(fixture.componentInstance).toBeTruthy();
	});
});
