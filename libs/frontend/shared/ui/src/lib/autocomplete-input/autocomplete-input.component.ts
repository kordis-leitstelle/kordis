import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	Input,
	Output,
	TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../input/input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
	distinctUntilChanged,
	filter,
	map,
	merge,
	scan,
	share,
	startWith,
	Subject,
	withLatestFrom,
} from 'rxjs';

enum NavigationCommand {
	Up = -1,
	Down = 1,
}

@Component({
	selector: 'krd-autocomplete-input',
	standalone: true,
	imports: [CommonModule, InputComponent, ReactiveFormsModule],
	templateUrl: './autocomplete-input.component.html',
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteInputComponent {
	@ContentChild(TemplateRef) templateRef!: TemplateRef<unknown>;

	@Input() suggestions: unknown[] = [];
	@Input() showResetButton = false;
	@Input() placeholder = '';
	@Input() defaultSelectFirst = false;
	@Input() calcStringMatch = false;

	control = new FormControl<string>('');

	private readonly selectItemSubject = new Subject<number>();
	private readonly navigateSubject = new Subject<NavigationCommand>();
	private readonly hoveredItem$ = this.selectItemSubject.pipe(
		startWith(-1),
		share(),
	);

	readonly selectedItemIndex$ = merge(
		this.navigateSubject.pipe(
			map((command) => (index: number) => {
				const valueAfterCommandApplied = index + command;

				if (
					valueAfterCommandApplied < 0 ||
					valueAfterCommandApplied > this.suggestions.length - 1
				) {
					return index;
				}

				return valueAfterCommandApplied;
			}),
		),
		this.hoveredItem$.pipe(map((hoveredItemIndex) => () => hoveredItemIndex)),
	).pipe(
		scan((state, operation) => operation(state), -1),
		distinctUntilChanged(),
		share(),
	);

	private readonly submitSelectedItemSubject = new Subject<void>();
	@Output() itemSelected = this.submitSelectedItemSubject.pipe(
		withLatestFrom(this.selectedItemIndex$),
		map(([, selectedIndex]) => selectedIndex),
		filter((selectedIndex) => selectedIndex >= 0),
		map((selectedIndex) => this.suggestions[selectedIndex]),
	);

	@Input() set value(value: string) {
		this.control.setValue(value);
	}

	handleKeyDown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'ArrowUp':
				this.navigateSubject.next(NavigationCommand.Up);
				break;
			case 'ArrowDown':
				this.navigateSubject.next(NavigationCommand.Down);
				break;
			case 'Enter':
				this.submitSelectedItem();
				break;
		}
	}

	handleItemHoverIn(index: number): void {
		this.selectItemSubject.next(index);
	}

	handleItemHoverOut(): void {
		this.selectItemSubject.next(-1);
	}

	submitSelectedItem(): void {
		this.submitSelectedItemSubject.next();
	}
}
