import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProtocolMessageComponent } from './create-protocol-message.component';

describe('CreateProtocolMessageComponent', () => {
	let component: CreateProtocolMessageComponent;
	let fixture: ComponentFixture<CreateProtocolMessageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CreateProtocolMessageComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateProtocolMessageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
