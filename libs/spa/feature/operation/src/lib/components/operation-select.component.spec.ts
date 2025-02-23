import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationSelectComponent } from './operation-select.component';

describe('OperationSelectComponent', () => {
	let fixture: ComponentFixture<OperationSelectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationSelectComponent, NoopAnimationsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationSelectComponent);
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
		).toEqual(' Keine Einsätze vorhanden ');
	});
});
