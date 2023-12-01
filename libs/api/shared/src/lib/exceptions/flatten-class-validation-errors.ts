import type { ValidationError } from 'class-validator';

import type { ValidationExceptionEntry } from './core/validation.exception';

export function flattenValidationErrors(
	errors: ValidationError[],
): ValidationExceptionEntry[] {
	const stack: { error: ValidationError; path: string[] }[] = errors.map(
		(error) => ({ error, path: [] }),
	);
	const entries: ValidationExceptionEntry[] = [];
	while (stack.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const { error, path } = stack.pop()!;
		const currentPath = [...path, error.property];
		if (error.constraints) {
			const errorMessages = Object.values(error.constraints);
			entries.push({ path: currentPath, errors: errorMessages });
		}
		if (error.children) {
			for (const child of error.children) {
				stack.push({ error: child, path: currentPath });
			}
		}
	}

	return entries;
}
