import {
	ConnectionArgs,
	ConnectionBuilder,
	Cursor,
	PageInfo,
} from 'nestjs-graphql-connection';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { ProtocolEntryConnection } from '../view-model/protocol-entry.connection';
import { ProtocolEntryEdge } from '../view-model/protocol-entry.edge';

export type ProtocolEntryCursorParams = { time: number };
export type ProtocolEntryCursor = Cursor<ProtocolEntryCursorParams>;

export class ProtocolEntryConnectionBuilder extends ConnectionBuilder<
	ProtocolEntryConnection,
	ConnectionArgs,
	ProtocolEntryEdge,
	ProtocolEntryBase,
	ProtocolEntryCursor
> {
	public createConnection(fields: {
		edges: ProtocolEntryEdge[];
		pageInfo: PageInfo;
	}): ProtocolEntryConnection {
		return new ProtocolEntryConnection(fields);
	}

	public createEdge(fields: {
		node: ProtocolEntryBase;
		cursor: string;
	}): ProtocolEntryEdge {
		return new ProtocolEntryEdge(fields);
	}

	public createCursor(node: ProtocolEntryBase): ProtocolEntryCursor {
		return new Cursor({ time: node.time.getTime() });
	}

	public getStartDate(): Date | undefined {
		if (this.beforeCursor) {
			return new Date(Number(this.beforeCursor.parameters.time));
		}

		if (this.afterCursor) {
			return new Date(Number(this.afterCursor.parameters.time));
		}

		return;
	}
}
