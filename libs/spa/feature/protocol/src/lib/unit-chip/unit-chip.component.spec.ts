import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitChipComponent } from './unit-chip.component';

// TODO: Implement unit chip component tests
describe('UnitChipComponent', () => {
	let component: UnitChipComponent;
	let fixture: ComponentFixture<UnitChipComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [UnitChipComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(UnitChipComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
