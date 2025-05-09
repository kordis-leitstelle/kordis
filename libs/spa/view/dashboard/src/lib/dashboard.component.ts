import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import {
	NzDropDownDirective,
	NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import {
	NzContentComponent,
	NzHeaderComponent,
	NzLayoutComponent,
} from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

import { AUTH_SERVICE } from '@kordis/spa/core/auth';
import { GlobalSearchStateService } from '@kordis/spa/core/misc';
import { TraceComponent } from '@kordis/spa/core/observability';
import { PossibleUnitSelectionsService } from '@kordis/spa/core/ui';
import { DeploymentsComponent } from '@kordis/spa/feature/deployment';
import { OperationsComponent } from '@kordis/spa/feature/operation';
import { ProtocolViewComponent } from '@kordis/spa/feature/protocol';

import { ActionBarComponent } from './action-bar.component';

@Component({
	selector: 'krd-dashboard-view',
	imports: [
		DeploymentsComponent,
		NzAvatarModule,
		NzContentComponent,
		NzDropDownDirective,
		NzDropdownMenuComponent,
		NzHeaderComponent,
		NzLayoutComponent,
		NzMenuModule,
		NzModalModule,
		OperationsComponent,
		ProtocolViewComponent,
		AsyncPipe,
		ActionBarComponent,
	],
	providers: [GlobalSearchStateService, PossibleUnitSelectionsService],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
@TraceComponent()
export class DashboardComponent {
	private readonly authService = inject(AUTH_SERVICE);
	readonly user$ = this.authService.user$;
	private readonly modal = inject(NzModalService);

	logout(): void {
		this.authService.logout();
	}

	showCreditsAndLicensesModal(): void {
		this.modal.create({
			nzTitle: 'Kordis - Credits und Lizenzen',
			nzContent: `
				<p>Eine Software von Jasper Herzberg und Timon Masberg veröffentlicht unter der <a href='https://github.com/kordis-leitstelle/kordis/?tab=AGPL-3.0-1-ov-file#readme' target='_blank'>GNU Affero General Public Lizenz in der Version 3</a>. Der Code ist frei verfügbar auf <a  href='https://github.com/kordis-leitstelle/kordis' target='_blank'>Github</a>.</p>
				<p>Für die Entwicklung von Kordis wurden Open-Source Projekte verwendet. Eine Liste der Projekte und deren Lizenzen kann <a href='/assets/third-party-licenses.txt' target='_blank'>hier</a> eingesehen werden, der Licence-Complience Check wird durch FOSSA durchgeführt und <a href='https://app.fossa.com/projects/git%2Bgithub.com%2Fkordis-leitstelle%2Fkordis' target='_blank'>hier</a> veröffentlicht.</p>
			`,
			nzClosable: true,
			nzFooter: null,
		});
	}
}
