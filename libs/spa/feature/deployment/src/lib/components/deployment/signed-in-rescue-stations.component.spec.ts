import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';
import { GlobalSearchStateService } from '@kordis/spa/core/misc';

import { SignedInRescueStationsComponent } from './signed-in-rescue-stations.component';

describe('SignedInRescueStationsComponent', () => {
	let fixture: ComponentFixture<SignedInRescueStationsComponent>;

	beforeEach(async () => {
		fixture = TestBed.overrideProvider(GraphqlService, {
			useValue: createMock<GraphqlService>({
				query: jest.fn().mockReturnValue({
					$: of(),
				}),
			}),
		})
			.overrideProvider(GlobalSearchStateService, {
				useValue: createMock(),
			})
			.createComponent(SignedInRescueStationsComponent);
	});

	it('should show no search results if no rescue stations provided', () => {
		fixture.componentRef.setInput('rescueStations', []);
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('.empty-state').textContent,
		).toContain('Keine angemeldeten Rettungswachen gefunden');
	});
});
