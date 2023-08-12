import { Mapper } from '@automapper/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getMapperToken } from '@timonmasberg/automapper-nestjs';
import { ChildProcess, fork } from 'child_process';
import { Model } from 'mongoose';
import { join as joinPath } from 'path';
import {
	Observable,
	Subject,
	distinctUntilChanged,
	finalize,
	map,
	scan,
	share,
	takeUntil,
} from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import { WithDestroySubject } from '@kordis/api/shared';

import { ShipPositionFeature } from '../../../core/entity/ship-position.entity';
import { ShipPositionsService } from '../../../core/service/ship-positions.service';
import {
	HPAShipPositionDocument,
	ShipPosition,
} from '../../schema/hpa-ship-position.schema';

@Injectable()
export class HpaShipPositionsService
	extends WithDestroySubject
	implements ShipPositionsService
{
	private readonly newShipPositionReportSubject =
		new Subject<ShipPositionFeature>();
	private readonly shipPositionChanges$: Observable<ShipPositionFeature> =
		this.newShipPositionReportSubject.pipe(share());
	private readonly connectionCounterSubject = new Subject<'up' | 'down'>();

	private readonly logger: KordisLogger = new Logger(
		HpaShipPositionsService.name,
	);
	private readonly cacheProcess: ChildProcess;

	constructor(
		@InjectModel(HPAShipPositionDocument.name)
		private readonly shipPositionModel: Model<HPAShipPositionDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {
		super();

		this.cacheProcess = fork(
			joinPath(__dirname, 'workers/hpa-ship-position.worker.js'),
		);

		this.cacheProcess.on('close', (e) =>
			this.logger.error(
				`HPA Cache process closed unexpected with exit code ${e}`,
			),
		);
		this.cacheProcess.on('error', (e) =>
			this.logger.error(`HPA Cache process error ${e}`, e.stack, {
				error: e,
			}),
		);

		this.cacheProcess.send({
			mongoUri: 'mongodb://127.0.0.1:27017/dev-db',
			hpaAmqpUri: '', // todo: set by config
		});

		this.connectionCounterSubject
			.pipe(
				scan(
					(count: number, command: 'up' | 'down') =>
						command === 'up' ? count + 1 : count - 1,
					0,
				),
				distinctUntilChanged(),
				map((count) =>
					count > 0 ? this.activateStream : this.deactivateStream,
				),
				takeUntil(this.onDestroySubject),
			)
			.subscribe((action) => action.bind(this)());

		this.logger.log('HPA Ship Position Service initialized');
	}

	async getAll(): Promise<ShipPositionFeature[]> {
		const shipPositionDocs = await this.shipPositionModel.find().lean().exec();
		return this.mapper.mapArrayAsync(
			shipPositionDocs,
			HPAShipPositionDocument,
			ShipPositionFeature,
		);
	}

	getChangeStream$(): Observable<ShipPositionFeature> {
		this.connectionCounterSubject.next('up');
		return this.shipPositionChanges$.pipe(
			finalize(() => this.connectionCounterSubject.next('down')),
		);
	}

	async search(query: string, limit: number): Promise<ShipPositionFeature[]> {
		// this is quite primitive, without scoring or anything, future work might include better matching and ranking of results
		const shipPositionDocs = await this.shipPositionModel
			.find({
				$or: [
					{ $text: { $search: query } },
					{ name: { $regex: query, $options: 'i' } },
					{ mmsi: { $regex: query, $options: 'i' } },
					{ callSign: { $regex: query, $options: 'i' } },
				],
			})
			.limit(limit)
			.lean()
			.exec();
		return this.mapper.mapArrayAsync(
			shipPositionDocs,
			HPAShipPositionDocument,
			ShipPositionFeature,
		);
	}

	private activateStream(): void {
		this.logger.debug(
			'Activating HPA Ship Position stream, now publishing new positions.',
		);
		this.cacheProcess.on('message', async (shipPositionMsg) => {
			const shipPositionFeature = await this.mapper.mapAsync(
				shipPositionMsg as ShipPosition,
				HPAShipPositionDocument,
				ShipPositionFeature,
			);
			this.newShipPositionReportSubject.next(shipPositionFeature);
		});
	}

	private deactivateStream(): void {
		this.logger.debug(
			'Deactivating HPA Ship Position stream, now ignoring new positions.',
		);
		this.cacheProcess.removeAllListeners('message');
	}
}
