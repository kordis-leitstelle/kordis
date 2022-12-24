import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'krd-input',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './input.component.html',
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {}
