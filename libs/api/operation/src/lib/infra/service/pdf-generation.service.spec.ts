import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Browser, Page, PuppeteerNode } from 'puppeteer';

import { PdfGenerationServiceImpl } from './pdf-generation.service';

const pageMock = createMock<Page>();

jest.mock('puppeteer', () => ({
	__esModule: true,
	default: createMock<PuppeteerNode>({
		launch: jest.fn().mockResolvedValue(
			createMock<Browser>({
				newPage: () => Promise.resolve(pageMock),
			}),
		),
	}),
}));

describe('PdfGenerationServiceImpl', () => {
	let service: PdfGenerationServiceImpl;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PdfGenerationServiceImpl],
		}).compile();

		service = module.get<PdfGenerationServiceImpl>(PdfGenerationServiceImpl);
	});

	it('should generate a PDF', async () => {
		const content = '<html><body><h1>Hello, World!</h1></body></html>';

		const pdfBuffer = Buffer.from('mocked_pdf');
		pageMock.pdf.mockResolvedValue(pdfBuffer);
		const result = await service.generatePdf(content, false);

		expect(result).toEqual(pdfBuffer);
		expect(pageMock.addScriptTag).not.toHaveBeenCalled();
		expect(pageMock.setContent).toHaveBeenCalledWith(
			content,
			expect.anything(),
		);
	});

	it('should load paged.js', async () => {
		const content = '<html><body><h1>Hello, World!</h1></body></html>';

		await service.generatePdf(content, true);
		expect(pageMock.addScriptTag).toHaveBeenCalledWith({
			url: expect.stringContaining('pagedjs'),
		});
	});
});
