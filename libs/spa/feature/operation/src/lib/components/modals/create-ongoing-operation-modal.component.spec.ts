import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { GeoSearchService } from '@kordis/spa/core/geocoding';
import { GraphqlService } from '@kordis/spa/core/graphql';

import { CreateOngoingOperationModalComponent } from './create-ongoing-operation-modal.component';

describe('CreateOngoingOperationModalComponent', () => {
	let component: CreateOngoingOperationModalComponent;
	let fixture: ComponentFixture<CreateOngoingOperationModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NoopAnimationsModule],
			providers: [
				{
					provide: NzModalRef,
					useValue: createMock(),
				},
				{
					provide: GraphqlService,
					useValue: createMock(),
				},
				{
					provide: GeoSearchService,
					useValue: {},
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateOngoingOperationModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
