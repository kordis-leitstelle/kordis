import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolComponent } from './protocol.component';

describe('ProtocolComponent', () => {
	let component: ProtocolComponent;
	let fixture: ComponentFixture<ProtocolComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProtocolComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ProtocolComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
