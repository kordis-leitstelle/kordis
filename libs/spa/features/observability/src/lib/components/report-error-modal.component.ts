import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAutosizeDirective, NzInputDirective } from 'ng-zorro-antd/input';

@Component({
	selector: 'krd-report-error-modal',
	standalone: true,
	imports: [CommonModule, NzInputDirective, NzAutosizeDirective, FormsModule],
	template: `
		<p>
			Bitte schreibe uns eine Ausführliche Fehlermeldung, damit wir den Fehler
			schnell nachvollziehen und beheben können:
		</p>

		<textarea [(ngModel)]="message" nz-input nzAutosize>
				- Welche Schritte hast du unternommen, bis es zu dem Fehler kam?
				- Was wäre das gewünschte Resultat?
				- Was war das fehlerhafte Resultat?
		</textarea
		>
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportErrorModalComponent {
	message: string = '';
}
