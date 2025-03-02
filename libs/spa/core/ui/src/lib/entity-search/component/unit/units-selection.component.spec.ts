import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import { UnitsSelectionComponent } from './units-selection.component';

describe('StrengthComponent', () => {
	let fixture: ComponentFixture<UnitsSelectionComponent>;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [UnitsSelectionComponent, NoopAnimationsModule],
			providers: [
				PossibleUnitSelectionsService,
				{
					provide: GraphqlService,
					useValue: createMock<GraphqlService>(),
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UnitsSelectionComponent);
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
