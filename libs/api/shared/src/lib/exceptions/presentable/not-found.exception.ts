import PresentableException from './presentable.exception';

export class NotFoundException extends PresentableException {
	readonly code = 'NOT_FOUND_EXCEPTION';
	constructor(message = 'Nicht gefunden') {
		super(message);
	}
}
