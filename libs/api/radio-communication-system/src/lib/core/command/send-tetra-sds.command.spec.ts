import { DeepMocked, createMock } from '@golevelup/ts-jest';

import { TetraControlService } from '../../infra/service/tetra-control.service';
import { SdsNotAbleToSendException } from '../exception/sds-not-able-to-send.exception';
import {
	SendTetraSDSCommand,
	SendTetraSDSHandler,
} from './send-tetra-sds.command';

describe('SendTetraSDSHandler', () => {
	let handler: SendTetraSDSHandler;
	let tetraServiceMock: DeepMocked<TetraControlService>;

	beforeEach(() => {
		tetraServiceMock = createMock<TetraControlService>();
		handler = new SendTetraSDSHandler(tetraServiceMock);
	});

	it('should call send sds through tetra service', async () => {
		const issi = '12345';
		const message = 'Test message';
		const isFlash = true;

		const command = new SendTetraSDSCommand(issi, message, isFlash);

		await handler.execute(command);

		expect(tetraServiceMock.sendSDS).toHaveBeenCalledWith(
			issi,
			message,
			isFlash,
		);
	});

	it('should throw an error if tetraService.sendSDS throws an error', async () => {
		const issi = '12345';
		const message = 'Test message';
		const isFlash = true;

		const command = new SendTetraSDSCommand(issi, message, isFlash);

		tetraServiceMock.sendSDS.mockRejectedValue(new Error());

		await expect(handler.execute(command)).rejects.toThrow(
			SdsNotAbleToSendException,
		);
	});
});
