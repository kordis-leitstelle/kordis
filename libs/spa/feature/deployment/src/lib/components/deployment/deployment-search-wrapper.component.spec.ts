import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';

import { DeploymentAssignment } from '@kordis/shared/model';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { DeploymentSearchWrapperComponent } from './deployment-search-wrapper.component';

@Component({
	selector: 'krd-search-wrapper-child',
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
			providers: [DeploymentsSearchStateService],
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
				TestBed.inject(DeploymentsSearchStateService).searchValue.set('lorem');

				expect(
					fixture.nativeElement.querySelector('[data-testid="child-content"]'),
				).not.toBeNull();
			});

			it('should not be visible if `alwaysShow` is false', () => {
				fixture.componentRef.setInput('alwaysShow', false);
				TestBed.inject(DeploymentsSearchStateService).searchValue.set('lorem');
				fixture.detectChanges();

				expect(
					fixture.nativeElement.querySelector('[data-testid="child-content"]'),
				).toBeNull();
			});
		});

		it('should show if search value matches name', () => {
			fixture.componentRef.setInput('name', 'test');
			TestBed.inject(DeploymentsSearchStateService).searchValue.set('te');

			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector('[data-testid="child-content"]'),
			).not.toBeNull();
		});

		it('should show if no search value', () => {
			TestBed.inject(DeploymentsSearchStateService).searchValue.set('');
			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector('[data-testid="child-content"]'),
			).not.toBeNull();
		});

		it('should show if search results found', async () => {
			fixture.autoDetectChanges();

			TestBed.inject(DeploymentsSearchStateService).searchValue.set('te');

			expect(
				fixture.nativeElement.querySelector('[data-testid="child-content"]'),
			).not.toBeNull();
		});
	});
});
