import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchStateService } from '@kordis/spa/core/misc';

import { NameSearchWrapperComponent } from './name-search-wrapper.component';

@Component({
	selector: 'krd-name-search-wrapper-child',
	/* eslint-disable @angular-eslint/prefer-standalone  */
	standalone: false,
	template: `
		<krd-name-search-wrapper [name]="name()">
			<span data-testid="child-content">hello</span>
		</krd-name-search-wrapper>
	`,
})
class MockNameSearchWrapperComponent {
	readonly name = input<string>('');
}

describe('NameSearchWrapperComponent', () => {
	let fixture: ComponentFixture<MockNameSearchWrapperComponent>;

	beforeEach(() => {
		fixture = TestBed.configureTestingModule({
			imports: [NameSearchWrapperComponent],
			declarations: [MockNameSearchWrapperComponent],
			providers: [GlobalSearchStateService],
		}).createComponent(MockNameSearchWrapperComponent);
	});

	it('should be visible if no search value set', () => {
		fixture.componentRef.setInput('name', 'lorem');
		TestBed.inject(GlobalSearchStateService).searchValue.set('');
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('[data-testid="child-content"]'),
		).not.toBeNull();
	});

	it('should be visible on name match', () => {
		fixture.componentRef.setInput('name', 'lorem');
		TestBed.inject(GlobalSearchStateService).searchValue.set('lor');
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('[data-testid="child-content"]'),
		).not.toBeNull();
	});

	it('should not be visible on name mismatch', () => {
		fixture.componentRef.setInput('name', 'ipsum');
		TestBed.inject(GlobalSearchStateService).searchValue.set('lorem');
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('[data-testid="child-content"]'),
		).toBeNull();
	});
});
