import {
	ChangeDetectionStrategy,
	Component,
	input,
	model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CloseOutline } from '@ant-design/icons-angular/icons';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzSpinComponent } from 'ng-zorro-antd/spin';

@Component({
	selector: 'krd-note-popup',
	imports: [
		FormsModule,
		NzInputDirective,
		NzSpinComponent,
		NzInputGroupComponent,
		NzIconDirective,
	],
	template: `
		@if (isLoading()) {
			<nz-spin nzSimple />
		}

		<nz-input-group [nzSuffix]="textAreaClearTpl">
			<textarea
				rows="3"
				[(ngModel)]="note"
				nz-input
				name="note"
				placeholder="Notiz"
			></textarea>
		</nz-input-group>
		<ng-template #textAreaClearTpl>
			@if (note()) {
				<span
					class="reset-icon"
					nz-icon
					nzType="close"
					(click)="note.set('')"
				></span>
			}
		</ng-template>
	`,
	styles: `
		nz-spin {
			position: absolute;
			top: 0;
			right: 0;
			padding: calc(var(--base-spacing) / 2) calc(var(--base-spacing) * 2)
				calc(var(--base-spacing) / 2);
		}

		.ant-input {
			padding: 0;
		}

		textarea {
			resize: none;
			width: 100%;
		}

		.reset-icon {
			cursor: pointer;
		}

		.reset-icon:hover {
			color: var(--ant-primary-color);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentNotePopupComponent {
	readonly note = model.required<string>();
	readonly isLoading = input(false);

	constructor(iconService: NzIconService) {
		iconService.addIcon(CloseOutline);
	}
}
