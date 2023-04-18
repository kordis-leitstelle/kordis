import {
	Field,
	ObjectType,
	Query,
	Resolver,
	Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { AppService } from './app.service';

@ObjectType()
export class AppData {
	@Field(() => String)
	message: string;
}

class AppDataAsyncIter {
	private readonly pubSub = new PubSub();

	async *generateNumbers(): AsyncIterableIterator<AppData> {
		for (let i = 1; i <= 100; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			yield { message: String(i) };
		}
	}

	async *subscribe(): AsyncIterableIterator<AppData> {
		const generator = this.generateNumbers();
		for await (const value of generator) {
			yield value;
		}
	}
}

@Resolver(() => AppData)
export class AppResolver {
	constructor(private appService: AppService) {}

	@Query(() => AppData)
	data(): AppData {
		return this.appService.getData();
	}

	@Subscription(() => AppData, {
		resolve: (payload) => payload,
	})
	something(): AsyncIterableIterator<AppData> {
		return new AppDataAsyncIter().subscribe();
	}
}
