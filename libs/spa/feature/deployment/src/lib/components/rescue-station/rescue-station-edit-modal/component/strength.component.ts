import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	effect,
	input,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
	NzFormControlComponent,
	NzFormDirective,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Subject, map, of, startWith, takeUntil } from 'rxjs';

@Component({
	selector: 'krd-strength',
	standalone: true,
	template: `
		<div [formGroup]="formGroup()" nz-form nzLayout="inline">
			<nz-form-item>
				<nz-form-control [nzValidateStatus]="formGroup()">
					<nz-input-number
						[nzMin]="0"
						formControlName="leaders"
						nzInputMode="numeric"
						nz-tooltip="Führer"
					/>
				</nz-form-control>
			</nz-form-item>
			<span>/</span>
			<nz-form-item>
				<nz-form-control>
					<nz-input-number
						[nzMin]="0"
						formControlName="subLeaders"
						nzInputMode="numeric"
						nz-tooltip="Unterführer"
					/>
				</nz-form-control>
			</nz-form-item>
			<span>/</span>
			<nz-form-item>
				<nz-form-control>
					<nz-input-number
						[nzMin]="0"
						formControlName="helpers"
						nzInputMode="numeric"
						nz-tooltip="Helfer"
					/>
				</nz-form-control>
			</nz-form-item>
			<span>// {{ total$ | async }}</span>
		</div>
	`,
	imports: [
		AsyncPipe,
		NzInputNumberComponent,
		NzTooltipDirective,
		ReactiveFormsModule,
		NzFormItemComponent,
		NzFormControlComponent,
		NzFormDirective,
	],
	styles: `
		div {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 5px;
		}

		.ant-form-item {
			margin: 0;
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
