import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

import { PdfGenerationService } from '../../core/service/pdf/pdf-generation.service';


@Injectable()
export class PdfGenerationServiceImpl implements PdfGenerationService {
	async generatePdf(content: string, loadPagedJs = true): Promise<Buffer> {
		const browser = await puppeteer.launch({
			headless: true,
		});
		const page = await browser.newPage();

		await page.setContent(content, { waitUntil: 'domcontentloaded' });

		if (loadPagedJs) {
			// add pagedjs script to load utilities such as page numbers, header and footer
			await page.addScriptTag({
				url: 'https://unpkg.com/pagedjs/dist/paged.polyfill.js',
			});
			// wait for pagedjs render to complete
			await page.waitForSelector('.pagedjs_pages');
		}

		const pdf = await page.pdf({
			format: 'A4',
			printBackground: true,
		});

		await browser.close();

		return pdf;
	}
}
