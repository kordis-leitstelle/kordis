import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
	NzTabComponent,
	NzTabDirective,
	NzTabsComponent,
} from 'ng-zorro-antd/tabs';

import { TabsFormStateService } from '../../service/tabs-form-state.service';
import { OperationBaseDataComponent } from './base-data/operation-base-data.component';
import { OperationCategoriesComponent } from './categories/operation-categories.component';
import { OperationDescriptionComponent } from './description/operation-description.component';
import { FormStateIndicatorComponent } from './form-state-indicator.component';
import { OperationInvolvementsComponent } from './involvements/operation-involvements.component';
import { OperationPatientsComponent } from './patients/operation-patients.component';
import { OperationProtocolComponent } from './protocol/operation-protocol.component';

@Component({
	selector: 'krd-operation-detail',
	imports: [
		FormStateIndicatorComponent,
		NzTabComponent,
		NzTabDirective,
		OperationBaseDataComponent,
		OperationCategoriesComponent,
		OperationDescriptionComponent,
		OperationInvolvementsComponent,
		OperationPatientsComponent,
		OperationProtocolComponent,
		NzTabsComponent,
	],
	template: `
		<nz-tabs [nzAnimated]="false" nzSize="small">
			<nz-tab [nzTitle]="baseDataTitle">
				<ng-template #baseDataTitle>
					<div class="tab-title">
						<span>Grunddaten</span>
						<krd-form-state-indicator
							[formState]="tabsFormStateService.getState('baseData')"
						/>
					</div>
				</ng-template>

				<krd-operation-base-data />
			</nz-tab>
			<nz-tab [nzTitle]="descriptionTitle">
				<ng-template #descriptionTitle>
					<div class="tab-title">
						<span>Beschreibung</span>

						<krd-form-state-indicator
							[formState]="tabsFormStateService.getState('description')"
						/>
					</div>
				</ng-template>

				<ng-template nz-tab>
					<krd-operation-description />
				</ng-template>
			</nz-tab>
			<nz-tab [nzTitle]="unitsTitle">
				<ng-template #unitsTitle>
					<div class="tab-title">
						<span>Einheiten</span>

						<krd-form-state-indicator
							[formState]="tabsFormStateService.getState('involvements')"
						/>
					</div>
				</ng-template>
				<ng-template nz-tab>
					<krd-operation-involvements />
				</ng-template>
			</nz-tab>
			<nz-tab [nzTitle]="categoriesTitle">
				<ng-template #categoriesTitle>
					<div class="tab-title">
						<span>Kategorien</span>

						<krd-form-state-indicator
							[formState]="tabsFormStateService.getState('categories')"
						/>
					</div>
				</ng-template>
				<ng-template nz-tab>
					<krd-operation-categories />
				</ng-template>
			</nz-tab>
			<nz-tab [nzTitle]="patientsTitle">
				<ng-template #patientsTitle>
					<div class="tab-title">
						<span>Patienten</span>

						<krd-form-state-indicator
							[formState]="tabsFormStateService.getState('patients')"
						/>
					</div>
				</ng-template>
				<ng-template nz-tab>
					<krd-operation-patients />
				</ng-template>
			</nz-tab>
			<nz-tab nzTitle="Protokoll">
				<ng-template nz-tab>
					<krd-operation-protocol />
				</ng-template>
			</nz-tab>
		</nz-tabs>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		.tab-title {
			display: flex;
			align-items: center;
			gap: calc(var(--base-spacing) / 2);
		}

		nz-tabs {
			height: 100%;
			display: flex;
			flex-direction: column;

			::ng-deep .ant-tabs-content-holder {
				flex-grow: 1;
			}

			::ng-deep .ant-tabs-content,
			::ng-deep .ant-tabs-tabpane {
				height: 100%;
			}
		}
	`,
})
export class OperationDetailComponent {
	protected readonly tabsFormStateService = inject(TabsFormStateService);
}
