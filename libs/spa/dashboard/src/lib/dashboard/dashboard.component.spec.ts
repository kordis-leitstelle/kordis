import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';

import { AUTH_SERVICE, AuthService } from '@kordis/spa/auth';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;
	const authServiceMock = createMock<AuthService>({
		user$: of(null),
	});
	const modalServiceMock = createMock<NzModalService>();

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule],
			providers: [{ provide: AUTH_SERVICE, useValue: authServiceMock }],
		}).compileComponents();

		TestBed.overrideModule(NzModalModule, {
			set: {
				providers: [{ provide: NzModalService, useValue: modalServiceMock }],
			},
		});

		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call authService.logout() when logout is called', () => {
		component.logout();
		expect(authServiceMock.logout).toHaveBeenCalled();
	});

	it('should call modalService.create() when showCreditsAndLicensesModal is called', () => {
		component.showCreditsAndLicensesModal();
		expect(modalServiceMock.create).toHaveBeenCalled();
	});
});
