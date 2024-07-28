import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { ProtocolDataComponent } from './protocol-data.component';

describe('ProtocolDataComponent', () => {
	let fixture: ComponentFixture<ProtocolDataComponent>;

	beforeEach(() => {
		fixture = TestBed.createComponent(ProtocolDataComponent);
	});

	it('should focus initially', async () => {
		fixture.componentRef.setInput(
			'formGroup',
			new FormGroup({
				sender: new FormControl(''),
				recipient: new FormControl(''),
				channel: new FormControl(''),
			}),
		);

		fixture.componentRef.setInput('focusInitially', true);

		fixture.detectChanges();

		await fixture.whenStable();
		const senderInput = fixture.nativeElement.querySelector(
			'[data-testid="sender-input"]',
		);
		expect(document.activeElement).toBe(senderInput);
	});
});
