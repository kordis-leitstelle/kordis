/*
 * Returns a css selector for our test id attribute.
 */
export function testIdSelector(testId: string): string {
	return `[data-testid="${testId}"]`;
}
