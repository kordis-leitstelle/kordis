import { AbstractControl, FormGroup } from '@angular/forms';

/*
 * Checks each top-level control in the form group and returns the whole value of the dirty ones.
 */
export function getTopLevelDirtyValues<
	TForm extends { [key: string]: AbstractControl },
>(
	group: FormGroup<TForm>,
): Partial<{
	[K in keyof TForm]: TForm[K] extends AbstractControl<infer V> ? V : never;
}> {
	const result: Partial<{
		[K in keyof TForm]: TForm[K] extends AbstractControl<infer V> ? V : never;
	}> = {};

	for (const key in group.controls) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const currentControl = group.get(key)!;

		if (currentControl.dirty) {
			result[key as keyof TForm] = currentControl.value;
		}
	}

	return result;
}
