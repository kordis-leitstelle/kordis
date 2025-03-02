import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { GeoSearchService } from '@kordis/spa/core/geocoding';
import { GraphqlService } from '@kordis/spa/core/graphql';

import { CreateOperationModalComponent } from './create-operation-modal.component';

describe('CreateOperationModalComponent', () => {
	let component: CreateOperationModalComponent;
	let fixture: ComponentFixture<CreateOperationModalComponent>;

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

		fixture = TestBed.createComponent(CreateOperationModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
