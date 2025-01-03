import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { FormState, TabFormState } from '../../service/tabs-form-state.service';


@Component({
	standalone: true,
	selector: 'krd-form-state-indicator',
	template: `
		@switch (formState().state()) {
			@case (FormState.LOADING) {
				<nz-spin nzSimple nzSize="small" />
			}
			@case (FormState.ERROR) {
				<span
					nz-icon
					nzType="warning"
					nzTheme="outline"
					[nz-tooltip]="formState().error() + ' (' + latestSave() + ')'"
				></span>
			}
			@case (FormState.SAVED) {
				<span
					[nz-tooltip]="latestSave()"
					nz-icon
					nzType="check-circle"
					nzTheme="outline"
				></span>
			}
		}
	`,
	styles: `
		.anticon {
			margin-right: 0;
		}
	`,
	imports: [NzSpinComponent, NzIconDirective, NzTooltipDirective],
})
export class FormStateIndicatorComponent {
	readonly formState = input.required<TabFormState>();
	protected readonly FormState = FormState;

	private readonly datePipe = inject(DatePipe);
	protected readonly latestSave = computed(() =>
		this.formState().latestSave()
			? 'Speicherstand: ' +
				this.datePipe.transform(this.formState().latestSave(), 'dd.MM. HH:mm')
			: 'Nicht gespeichert!',
	);
}
