import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';

import type { AppService } from './app.service';

@ObjectType()
export class AppData {
	@Field(() => String)
	message: string;
}

@Resolver(() => AppData)
export class AppResolver {
	constructor(private appService: AppService) {}

	@Query(() => AppData)
	data(): AppData {
		return this.appService.getData();
	}
}
