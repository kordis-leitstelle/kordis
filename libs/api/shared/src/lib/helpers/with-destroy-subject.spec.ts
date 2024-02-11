import { Subject } from 'rxjs';

import { WithDestroySubject } from './with-destroy-subject';

describe('WithDestroySubject', () => {
	class TestWithDestroySubject extends WithDestroySubject {
		public getOnDestroySubject(): Subject<void> {
			return this.onDestroySubject;
		}
	}

	it('should call next and complete on onDestroySubject', () => {
		const testInstance = new TestWithDestroySubject();

		const onDestroySubjectSpy = jest.spyOn(
			testInstance.getOnDestroySubject(),
			'next',
		);
		const onDestroySubjectCompleteSpy = jest.spyOn(
			testInstance.getOnDestroySubject(),
			'complete',
		);

		testInstance.onModuleDestroy();

		expect(onDestroySubjectSpy).toHaveBeenCalled();
		expect(onDestroySubjectCompleteSpy).toHaveBeenCalled();
	});
});
