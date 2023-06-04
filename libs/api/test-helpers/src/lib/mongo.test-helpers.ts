import { Model } from 'mongoose';

export function mockModelMethodResult(
	model: Model<unknown>,
	document: Record<string, any>,
	method: keyof Model<unknown>,
) {
	const findByIdSpy = jest.spyOn(model, method as any);

	findByIdSpy.mockReturnThis().mockReturnValue({
		exec: jest.fn().mockReturnValue({
			...document,
			toObject: jest.fn().mockReturnValue(document),
		}),
	} as any);

	return findByIdSpy;
}
