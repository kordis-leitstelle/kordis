import { OperationEntity } from '../entity/operation.entity';

export const OPERATION_TEMPLATE_RENDERER = Symbol(
	'OPERATION_TEMPLATE_RENDERER',
);
export type OperationTemplatePayload = Partial<OperationEntity> & {
	generatedAt: Date;
	generatedBy: string;
	orgName: string;
};
export interface OperationTemplateRenderer {
	renderTemplate(operation: OperationTemplatePayload): string;
}
