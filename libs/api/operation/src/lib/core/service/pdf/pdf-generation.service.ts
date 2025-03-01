export const PDF_GENERATION_SERVICE = Symbol('PDF_GENERATION_SERVICE');

export interface PdfGenerationService {
	generatePdf(htmlContent: string): Promise<ArrayBuffer>;
}
