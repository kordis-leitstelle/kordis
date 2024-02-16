import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthUser } from '@kordis/shared/model';

import { SendTetraSDSCommand } from '../../core/command/send-tetra-sds.command';
import { SdsNotAbleToSendException } from '../../core/exception/sds-not-able-to-send.exception';
import { PresentableSdsNotSendException } from '../exception/presentable-sds-not-send.exception';
import { SDSResolver } from './sds.resolver';

describe('SDSResolver', () => {
	let resolver: SDSResolver;
	let commandBus: DeepMocked<CommandBus>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SDSResolver,
				{
					provide: CommandBus,
					useValue: createMock<CommandBus>(),
				},
			],
		}).compile();

		resolver = module.get<SDSResolver>(SDSResolver);
		commandBus = module.get<DeepMocked<CommandBus>>(CommandBus);
	});

	describe('sendSDS', () => {
		it('should send a Send Tetra SDS command', async () => {
			const issi = '123456';
			const message = 'Test message';
			const isFlash = true;
			const orgId = 'orgId';

			await resolver.sendSDS(
				{ organizationId: orgId } as AuthUser,
				issi,
				message,
				isFlash,
			);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new SendTetraSDSCommand(orgId, issi, message, isFlash),
			);
		});

		it('should throw presentable error on SDS error', async () => {
			const issi = '123456';
			const message = 'Test message';
			const isFlash = false;

			commandBus.execute.mockRejectedValueOnce(
				new SdsNotAbleToSendException(new Error()),
			);

			await expect(
				resolver.sendSDS(
					{ organizationId: 'orgId' } as AuthUser,
					issi,
					message,
					isFlash,
				),
			).rejects.toThrow(PresentableSdsNotSendException);

			const unknownError = new Error('i am an unknown error');
			commandBus.execute.mockRejectedValueOnce(unknownError);

			await expect(
				resolver.sendSDS(
					{ organizationId: ' ' } as AuthUser,
					issi,
					message,
					isFlash,
				),
			).rejects.toThrow(unknownError);
		});
	});
});
