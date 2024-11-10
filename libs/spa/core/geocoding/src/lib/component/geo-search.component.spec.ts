import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { GeoSearchService } from '../service/geo-search.service';
import { GeoSearchComponent } from './geo-search.component';

describe('GeoSearchComponent', () => {
	let component: GeoSearchComponent;
	let fixture: ComponentFixture<GeoSearchComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: GeoSearchService,
					useValue: createMock(),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GeoSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
