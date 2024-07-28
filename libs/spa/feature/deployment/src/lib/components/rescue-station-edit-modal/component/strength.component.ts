import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	effect,
	input,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Subject, map, of, startWith, takeUntil } from 'rxjs';

@Component({
	selector: 'krd-strength',
	standalone: true,
	template: `
		<div [formGroup]="formGroup()">
			<nz-input-number
				[nzMin]="0"
				formControlName="leaders"
				nzInputMode="numeric"
				nz-tooltip="Führer"
				[nzStatus]="
					formGroup().controls.helpers.invalid &&
					formGroup().controls.helpers.touched
						? 'error'
						: ''
				"
			/>
			/
			<nz-input-number
				[nzMin]="0"
				formControlName="subLeaders"
				nzInputMode="numeric"
				nz-tooltip="Unterführer"
				[nzStatus]="
					formGroup().controls.subLeaders.invalid &&
					formGroup().controls.subLeaders.touched
						? 'error'
						: ''
				"
			/>
			/
			<nz-input-number
				[nzMin]="0"
				formControlName="helpers"
				nzInputMode="numeric"
				nz-tooltip="Helfer"
				[nzStatus]="
					formGroup().controls.leaders.invalid &&
					formGroup().controls.leaders.touched
						? 'error'
						: ''
				"
			/>
			// {{ total$ | async }}
		</div>
	`,
	imports: [
		AsyncPipe,
		NzInputNumberComponent,
		NzTooltipDirective,
		ReactiveFormsModule,
	],
	styles: `
		div {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 5px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrengthComponent implements OnDestroy {
	readonly formGroup = input.required<
		FormGroup<{
			leaders: FormControl<number>;
			subLeaders: FormControl<number>;
			helpers: FormControl<number>;
		}>
	>();
	total$ = of(0);

	private readonly destroyRefSubject$ = new Subject<void>();

	constructor() {
		effect(() => {
			this.destroyRefSubject$.next(); // when formGroup changes, destroy previous subscription
			this.total$ = this.formGroup().valueChanges.pipe(
				startWith(() => null), // trigger initial calculation
				map(() => this.formGroup().getRawValue()),
				map(
					({ leaders, subLeaders, helpers }) => leaders + subLeaders + helpers,
				),
				takeUntil(this.destroyRefSubject$),
			);
		});
	}

	ngOnDestroy(): void {
		this.destroyRefSubject$.next();
		this.destroyRefSubject$.complete();
	}
}
