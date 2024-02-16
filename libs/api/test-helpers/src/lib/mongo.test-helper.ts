import { Model } from 'mongoose';

export function mockModelMethodResult(
	model: Model<any>,
	document: Record<string, any> | null,
	method: keyof Model<unknown>,
) {
	const findByIdSpy = jest.spyOn(model, method as any);

	findByIdSpy.mockReturnThis().mockReturnValue({
		exec: jest.fn().mockReturnValue({
			...document,
			toObject: jest.fn().mockReturnValue(document),
		}),
		lean: jest.fn().mockReturnValue({
			...document,
			toObject: jest.fn().mockReturnValue(document),
			exec: jest.fn().mockReturnValue(document),
		}),
	} as any);

	return findByIdSpy;
}
