import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteIndicatorComponent } from './note-indicator.component';

describe('NoteIndicatorComponent', () => {
	let component: NoteIndicatorComponent;
	let fixture: ComponentFixture<NoteIndicatorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({}).compileComponents();

		fixture = TestBed.createComponent(NoteIndicatorComponent);
	});

	it('should create', () => {
		component = fixture.componentInstance;
		fixture.componentRef.setInput('note', 'Test note');
		fixture.detectChanges();

		expect(component).toBeTruthy();
	});
});
