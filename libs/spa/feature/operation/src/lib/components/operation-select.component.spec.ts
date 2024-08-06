import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationSelectComponent } from './operation-select.component';

const MOCK_OPERATIONS = Object.freeze([
	{
		id: '663b47a3146d7fbe28ad1e66',
		sign: '2024/01/001',
		alarmKeyword: 'THWAY',
		location: {
			address: {
				street: 'Neuenfelder Hauptdeich',
			},
		},
	},
	{
		id: '6655e84385774c69ad4b3f2e',
		sign: '2024/01/002',
		alarmKeyword: 'THWAY',
		location: {
			address: {
				street: 'Elbchaussee 351',
			},
		},
	},
]);

describe('OperationSelectComponent', () => {
	let fixture: ComponentFixture<OperationSelectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationSelectComponent, NoopAnimationsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationSelectComponent);
	});

	it('should select first operation', async () => {
		fixture.componentRef.setInput('operations', MOCK_OPERATIONS);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.selectedOperation()?.sign).toEqual(
			'2024/01/001',
		);
	});

	it('should show empty placeholder and empty message', async () => {
		fixture.componentRef.setInput('operations', []);
		fixture.detectChanges();
		fixture.debugElement.query(By.css('nz-select')).nativeElement.click();
		fixture.detectChanges();
		await fixture.whenRenderingDone();
		expect(
			fixture.debugElement.query(By.css('nz-option-container')),
		).toBeTruthy();
		expect(
			fixture.debugElement.query(By.css('nz-embed-empty')).nativeElement
				.textContent,
		).toEqual(' Keine aktiven Einsätze ');
	});
});
