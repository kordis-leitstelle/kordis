export async function expectIterableNotToHaveNext(
	iterable: AsyncIterableIterator<unknown>,
): Promise<void> {
	await expect(
		Promise.race([
			iterable.next().then((v) => {
				console.log('got iterator next result', v);
				throw new Error();
			}),
			// resolve after 100ms to have a safety delay, even though it might be unnecessary
			new Promise((resolve) => setTimeout(() => resolve(true), 100)),
		]),
	).resolves.toBeTruthy();
}
