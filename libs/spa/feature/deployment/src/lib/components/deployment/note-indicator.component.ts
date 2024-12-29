import { Component, input } from '@angular/core';
import { InfoCircleOutline } from '@ant-design/icons-angular/icons';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

@Component({
	selector: 'krd-note-indicator',
	standalone: true,
	imports: [NzIconDirective, NzTooltipDirective],
	template: `<i
		nz-icon
		nzType="info-circle"
		[nz-tooltip]="note()"
		[nzTooltipOverlayStyle]="{ 'white-space': 'pre-line' }"
	>
	</i>`,
})
export class NoteIndicatorComponent {
	readonly note = input.required<string>();

	constructor(iconService: NzIconService) {
		iconService.addIcon(InfoCircleOutline);
	}
}
