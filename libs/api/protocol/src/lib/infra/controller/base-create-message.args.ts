import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import {
	RegisteredUnit,
	UnknownUnit,
} from '../../core/entity/partials/unit-partial.entity';
import { UnitInputTransformer } from '../service/unit-input.transformer';
import { UnitInput } from '../view-model/unit-input.view-model';

@InputType('BaseCreateMessageInput')
@ArgsType()
export class BaseCreateMessageArgs {
	@Field(() => UnitInput)
	@Type(() => UnitInput)
	@ValidateNested()
	sender: UnitInput;

	@Field(() => UnitInput)
	@Type(() => UnitInput)
	@ValidateNested()
	recipient: UnitInput;

	@Field()
	@IsString()
	channel: string;

	getTransformedSender(): Promise<RegisteredUnit | UnknownUnit> {
		return UnitInputTransformer.transform(this.sender);
	}

	getTransformedRecipient(): Promise<RegisteredUnit | UnknownUnit> {
		return UnitInputTransformer.transform(this.recipient);
	}

	async asTransformedPayload(): Promise<{
		sender: RegisteredUnit | UnknownUnit;
		recipient: RegisteredUnit | UnknownUnit;
		channel: string;
	}> {
		return {
			sender: await this.getTransformedSender(),
			recipient: await this.getTransformedRecipient(),
			channel: this.channel,
		};
	}
}

// We have this type, since with direct use of an input type, nullable fields will not work as expected (cannot be instantiated as the correct type).
@ArgsType()
export class ProtocolMessageArgs {
	@Field(() => BaseCreateMessageArgs, { nullable: true })
	@Type(() => BaseCreateMessageArgs)
	@ValidateNested()
	@IsOptional()
	protocolMessage?: BaseCreateMessageArgs;
}
