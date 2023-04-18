import {
	Controller,
	OnModuleInit,
	Post,
	Req,
	Res,
	ServiceUnavailableException,
} from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import type { Response } from 'express';
import { Request } from 'express';
import { createHandler } from 'graphql-sse/lib/use/express';

import { KordisRequest } from '@kordis/api/shared';

@Controller('graphql-stream')
export class GraphqlSubscriptionsController implements OnModuleInit {
	private handler?: (req: Request, res: Response) => Promise<void>;
	constructor(private readonly graphQLSchemaHost: GraphQLSchemaHost) {}

	onModuleInit(): void {
		const schema = this.graphQLSchemaHost.schema;

		this.handler = createHandler({
			schema,
		});
	}

	@Post()
	subscriptionHandler(
		@Req() req: KordisRequest,
		@Res() res: Response,
	): Promise<void> {
		if (!this.handler) {
			throw new ServiceUnavailableException(
				'GraphQL Subscription handler not ready yet. Try again.',
			);
		}

		return this.handler(req, res);
	}
}
