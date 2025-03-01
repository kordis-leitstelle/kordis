import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { OperationActionsService } from './../service/operation-actions.service';
import { OperationsComponent } from './operations.component';

describe('OperationsComponent', () => {
	let component: OperationsComponent;
	let fixture: ComponentFixture<OperationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NzModalModule, NoopAnimationsModule],
			providers: [
				{
					provide: OperationActionsService,
					useValue: createMock(),
				},
				{
					provide: GraphqlService,
					useValue: createMock<GraphqlService>({
						query: () => ({
							$: of(),
						}),
					}),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
