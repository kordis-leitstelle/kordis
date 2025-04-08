import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentAssignment } from '@kordis/shared/model';
import { GlobalSearchStateService } from '@kordis/spa/core/misc';

import { DeploymentSearchWrapperComponent } from './deployment-search-wrapper.component';

@Component({
	selector: 'krd-search-wrapper-child',
	/* eslint-disable @angular-eslint/prefer-standalone  */
	standalone: false,
	template: `
		<krd-deployment-search-wrapper
			[assignments]="assignments()"
			[name]="name()"
			[alwaysShow]="alwaysShow()"
		>
			<ng-template><span data-testid="child-content">hello</span></ng-template>
		</krd-deployment-search-wrapper>
	`,
})
class MockSearchWrapperComponent {
	readonly assignments = input<DeploymentAssignment[]>([]);
	readonly name = input<string>('');
	readonly alwaysShow = input(false);
}

describe('DeploymentSearchWrapperComponent', () => {
	let fixture: ComponentFixture<MockSearchWrapperComponent>;

	beforeEach(() => {
		fixture = TestBed.configureTestingModule({
			imports: [DeploymentSearchWrapperComponent],
			declarations: [MockSearchWrapperComponent],
			providers: [GlobalSearchStateService],
		}).createComponent(MockSearchWrapperComponent);
	});

	describe('isVisible', () => {
		describe('alwaysShow', () => {
			beforeEach(() => {
				fixture.componentRef.setInput('name', 'ipsum');
			});

			it('should be always visible if true and no match', async () => {
				fixture.componentRef.setInput('alwaysShow', true);
				fixture.detectChanges();
				// no match
				TestBed.inject(GlobalSearchStateService).searchValue.set('lorem');

				expect(
					fixture.nativeElement.querySelector('[data-testid="child-content"]'),
				).not.toBeNull();
			});

			it('should not be visible if `alwaysShow` is false', () => {
				fixture.componentRef.setInput('alwaysShow', false);
				TestBed.inject(GlobalSearchStateService).searchValue.set('lorem');
				fixture.detectChanges();

				expect(
					fixture.nativeElement.querySelector('[data-testid="child-content"]'),
				).toBeNull();
			});
		});

		it('should show if search value matches name', () => {
			fixture.componentRef.setInput('name', 'test');
			TestBed.inject(GlobalSearchStateService).searchValue.set('te');

			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector('[data-testid="child-content"]'),
			).not.toBeNull();
		});

		it('should show if no search value', () => {
			TestBed.inject(GlobalSearchStateService).searchValue.set('');
			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector('[data-testid="child-content"]'),
			).not.toBeNull();
		});

		it('should show if search results found', async () => {
			fixture.autoDetectChanges();

			TestBed.inject(GlobalSearchStateService).searchValue.set('te');

			expect(
				fixture.nativeElement.querySelector('[data-testid="child-content"]'),
			).not.toBeNull();
		});
	});
});
