import {
	All,
	Controller,
	OnModuleInit,
	Req,
	Res,
	ServiceUnavailableException,
} from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import type { Response } from 'express';
import { createHandler } from 'graphql-sse/lib/use/express';

import type { KordisRequest } from '@kordis/api/shared';

@Controller('graphql-stream')
export class GraphqlSubscriptionsController implements OnModuleInit {
	private handler?: (req: KordisRequest, res: Response) => Promise<void>;

	constructor(private readonly graphQLSchemaHost: GraphQLSchemaHost) {}

	onModuleInit(): void {
		this.handler = createHandler({
			schema: this.graphQLSchemaHost.schema,
			context: (req) => ({
				// pass express request, since the request will be used in the nestjs pipeline
				req: req.raw,
			}),
		});
	}

	@All()
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
