import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	OnDestroy,
	OnInit,
	Renderer2,
	inject,
} from '@angular/core';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
	selector: '[krdNzTableFullHeight]',
	standalone: true,
})
export class NzTableFullHeightDirective implements OnInit, OnDestroy {
	private observer: ResizeObserver;
	private resizeSubject$ = new Subject<void>();

	private readonly element = inject(ElementRef);
	private readonly table = inject(NzTableComponent);
	private readonly cd = inject(ChangeDetectorRef);
	private readonly render2 = inject(Renderer2);

	constructor() {
		this.observer = new ResizeObserver(() => this.resizeSubject$.next());
		this.resizeSubject$
			.pipe(debounceTime(200))
			.subscribe(() => this.resizeTable());
	}

	ngOnInit(): void {
		this.render2.setStyle(this.element.nativeElement, 'height', '100%');
		this.observer.observe(this.element.nativeElement);
	}

	ngOnDestroy(): void {
		this.observer.disconnect();
		this.resizeSubject$.complete();
	}

	private resizeTable(): void {
		const nzTable: HTMLElement = this.element.nativeElement;

		// offset `thead` height if present
		const theadHeight = nzTable.querySelector('thead')?.offsetHeight ?? 0;
		this.table.scrollY = `${nzTable.clientHeight - theadHeight}px`;

		this.cd.detectChanges();
	}
}
