import { Component, input, signal } from '@angular/core';
import { InfoCircleOutline } from '@ant-design/icons-angular/icons';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { Unit } from '@kordis/shared/model';

import { DeploymentUnitDetailsComponent } from './deployment-unit-details.component';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
	selector: 'krd-deployment-unit',
	standalone: true,
	imports: [
		DeploymentUnitDetailsComponent,
		NzCardComponent,
		NzIconDirective,
		NzPopoverModule,
		NzTooltipDirective,
		StatusBadgeComponent,
	],
	template: `
		<ng-template #contentTemplate>
			<krd-deployment-unit-details
				[unit]="unit()"
				(unitStatusUpdated)="showPopover.set(false)"
			/>
		</ng-template>
		<nz-card
			[nzHoverable]="true"
			(click)="$event.stopPropagation()"
			nz-popover
			[nzPopoverBackdrop]="true"
			[nzBodyStyle]="{ padding: '5px 10px' }"
			[nzPopoverTitle]="unit().callSign + ' - ' + unit().name"
			[nzPopoverOverlayStyle]="{ width: '300px' }"
			[nzPopoverContent]="contentTemplate"
			[(nzPopoverVisible)]="showPopover"
			nzPopoverTrigger="click"
		>
			<div class="card-body">
				<div class="header-row">
					<div>
						{{ unit().callSign }}
						@if (unit().note) {
							<i nz-icon nzType="info-circle" [nz-tooltip]="unit().note"> </i>
						}
					</div>
					<div style="display: flex; align-items: center; gap: 5px">
						<krd-status-badge [status]="unit().status?.status" />
					</div>
				</div>
				<div class="name">
					<span>{{ unit().name }}</span>
				</div>
			</div>
		</nz-card>
	`,
	styles: `
		.card-body {
			display: flex;
			flex-direction: column;
		}

		.header-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.name {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 0.9rem;
			color: grey;
		}
	`,
})
export class DeploymentUnitComponent {
	unit = input.required<Unit>();
	protected showPopover = signal(false);

	constructor(iconService: NzIconService) {
		iconService.addIcon(InfoCircleOutline);
	}
}
