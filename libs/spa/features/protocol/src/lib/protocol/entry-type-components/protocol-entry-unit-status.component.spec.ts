import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolEntryUnitStatusComponent } from './protocol-entry-unit-status.component';

describe('ProtocolEntryUnitStatusComponent', () => {
	let component: ProtocolEntryUnitStatusComponent;
	let fixture: ComponentFixture<ProtocolEntryUnitStatusComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProtocolEntryUnitStatusComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ProtocolEntryUnitStatusComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
