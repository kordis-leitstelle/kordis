import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationAlarmKeywordSelectComponent } from './operation-alarm-keyword-select.component';

describe('AlarmKeywordSelectComponent', () => {
	let fixture: ComponentFixture<OperationAlarmKeywordSelectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationAlarmKeywordSelectComponent, NoopAnimationsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationAlarmKeywordSelectComponent);
	});

	it('should select element and emit form completed', async () => {
		const component = fixture.componentInstance;
		fixture.detectChanges();

		jest.spyOn(fixture.componentInstance.keywordSelected, 'emit');

		(component as any).onModelChange('THWAY');
		expect(fixture.componentInstance.keywordSelected.emit).toHaveBeenCalled();
	});
});
