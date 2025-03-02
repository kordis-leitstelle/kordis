import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolTableComponent } from './protocol-table.component';

describe('SpaProtocolComponent', () => {
	// TODO: Implement protocol component tests
	let component: ProtocolTableComponent;
	let fixture: ComponentFixture<ProtocolTableComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProtocolTableComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ProtocolTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
