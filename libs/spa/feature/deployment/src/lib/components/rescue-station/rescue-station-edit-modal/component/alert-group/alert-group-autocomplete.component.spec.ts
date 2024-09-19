import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { PossibleAlertGroupSelectionsService } from '../../service/alert-group-selection.service';
import { AlertGroupAutocompleteComponent } from './alert-group-autocomplete.component';

describe('AlertGroupAutocompleteComponent', () => {
	let component: AlertGroupAutocompleteComponent;
	let fixture: ComponentFixture<AlertGroupAutocompleteComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: PossibleAlertGroupSelectionsService,
					useValue: createMock<PossibleAlertGroupSelectionsService>(),
				},
			],
		});
		fixture = TestBed.createComponent(AlertGroupAutocompleteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
