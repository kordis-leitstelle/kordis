import { AutocompleteInputComponent } from './autocomplete-input.component';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator';

/*
	Checks whether the suggestions are in the correct state, ng-content should be as follows:
	<suggestion>-<isSelected>
 */
function expectSuggestionsState(
	actualSuggestionNodes: Element[],
	expectTrueAtPosition = -1,
): void {
	for (let i = 0; i < actualSuggestionNodes.length; i++) {
		expect(actualSuggestionNodes[i].textContent).toBe(
			`${i}-${i === expectTrueAtPosition ? 'true' : 'false'}`,
		);
	}
}

describe('AutocompleteInputComponent', () => {
	let spectator: SpectatorHost<AutocompleteInputComponent>;
	const createHost = createHostFactory(AutocompleteInputComponent);

	beforeEach(async () => {
		spectator = createHost(
			`<krd-autocomplete-input [suggestions]='["0", "1", "2"]'>
								<ng-template let-isSelected='isSelected' let-suggestion>
									<span>{{suggestion}}-{{isSelected}}</span>
								</ng-template>
								</krd-autocomplete-input>`,
		);
	});

	it('should clear input on reset button click', async () => {
		spectator.component.showResetButton = true;

		const value = 'foo bar';
		const input = spectator.query<HTMLInputElement>('input');

		spectator.typeInElement(value, input);
		expect(input.value).toBe(value);

		spectator.click('button');
		expect(input.value).toBe('');
	});

	it('should select items with arrow keys', () => {
		const suggestions = spectator.queryAll('span');

		expect(suggestions.length).toBe(3);
		expectSuggestionsState(suggestions);

		for (let i = 0; i < 3; i++) {
			spectator.dispatchKeyboardEvent('input', 'keydown', 'ArrowDown');
			expectSuggestionsState(suggestions, i);
		}

		// if out of suggestion bound, stay at last
		spectator.dispatchKeyboardEvent('input', 'keydown', 'ArrowDown');
		expectSuggestionsState(suggestions, 2);

		for (let i = 1; i >= 0; i--) {
			spectator.dispatchKeyboardEvent('input', 'keydown', 'ArrowUp');
			expectSuggestionsState(suggestions, i);
		}

		// if out of suggestion bound, stay at last
		spectator.dispatchKeyboardEvent('input', 'keydown', 'ArrowUp');
		expectSuggestionsState(suggestions, 0);
	});

	it('should select select item with hover', () => {
		const suggestions = spectator.queryAll('span');
		expect(suggestions.length).toBe(3);
		expectSuggestionsState(suggestions);

		spectator.dispatchMouseEvent(suggestions[0], 'mouseenter');
		expectSuggestionsState(suggestions, 0);
		spectator.dispatchMouseEvent(suggestions[0], 'mouseleave');
		expectSuggestionsState(suggestions);
	});

	it('should emit selected item', async () => {
		let output: unknown;
		spectator.output('itemSelected').subscribe((result) => (output = result));
		spectator.output('itemSelected').subscribe(console.log);

		spectator.dispatchKeyboardEvent('input', 'keydown', 'ArrowDown');
		spectator.dispatchKeyboardEvent('input', 'keydown', 'Enter');
		expect(output).toBe('0');

		const secondSuggestion = spectator.queryAll('li')[1];
		spectator.dispatchMouseEvent(secondSuggestion, 'mouseenter');
		spectator.dispatchMouseEvent(secondSuggestion, 'click');

		expect(output).toBe('1');
	});
});
