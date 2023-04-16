import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

export function createParamDecoratorFactory(
	decorator: () => ParameterDecorator,
) {
	class TestDecorator {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		public test(@decorator() value: unknown): void {}
	}

	const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestDecorator, 'test');
	return args[Object.keys(args)[0]].factory;
}
