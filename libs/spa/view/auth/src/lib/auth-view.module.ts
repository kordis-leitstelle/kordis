import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginOutline } from '@ant-design/icons-angular/icons';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzContentComponent, NzLayoutComponent } from 'ng-zorro-antd/layout';

import { AuthComponent } from './auth.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: AuthComponent,
			},
		]),
		NzLayoutComponent,
		NzContentComponent,
		NgOptimizedImage,
		NzButtonComponent,
		NzIconModule.forChild([LoginOutline]),
	],
	declarations: [AuthComponent],
	exports: [RouterModule],
})
export class AuthViewModule {}
