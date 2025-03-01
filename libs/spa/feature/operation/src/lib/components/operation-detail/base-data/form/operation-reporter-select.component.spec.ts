import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationReporterSelectComponent } from './operation-reporter-select.component';

describe('ReporterSelectComponent', () => {
	let component: OperationReporterSelectComponent;
	let fixture: ComponentFixture<OperationReporterSelectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationReporterSelectComponent, NoopAnimationsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationReporterSelectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
