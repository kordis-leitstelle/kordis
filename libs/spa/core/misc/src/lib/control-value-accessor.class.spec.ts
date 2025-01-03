import { ControlValueAccessorBase } from './control-value-accessor.class';

describe('ControlValueAccessorBase', () => {
	let controlValueAccessorBase: ControlValueAccessorBase;

	beforeEach(() => {
		controlValueAccessorBase = new ControlValueAccessorBase();
	});

	it('should register and call onChange function', () => {
		const mockFn = jest.fn();
		controlValueAccessorBase.registerOnChange(mockFn);
		controlValueAccessorBase.onChange('123');
		expect(mockFn).toHaveBeenCalled();
	});

	it('should register and call onTouch function', () => {
		const mockFn = jest.fn();
		controlValueAccessorBase.registerOnTouched(mockFn);
		controlValueAccessorBase.onTouch();
		expect(mockFn).toHaveBeenCalled();
	});

	it('should write value and check if value is set', () => {
		const testValue = 'test value';
		controlValueAccessorBase.writeValue(testValue);
		expect((controlValueAccessorBase as any).value()).toBe(testValue);
	});
});
