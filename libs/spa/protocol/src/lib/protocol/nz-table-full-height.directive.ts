import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	OnDestroy,
	OnInit,
	Renderer2,
} from '@angular/core';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// TODO: Evaluate location for NzTableFullHeightDirective directive
@Directive({
	selector: '[krdNzTableFullHeight]',
	standalone: true,
})
export class NzTableFullHeightDirective implements OnInit, OnDestroy {
	private observer: ResizeObserver;
	private resize = new Subject<void>();

	constructor(
		private element: ElementRef,
		private table: NzTableComponent<unknown>,
		private cd: ChangeDetectorRef,
		private render2: Renderer2,
	) {
		this.observer = new ResizeObserver(() => this.resize.next());
		this.resize.pipe(debounceTime(200)).subscribe(() => this.resizeTable());
	}

	ngOnInit(): void {
		this.render2.setStyle(this.element.nativeElement, 'height', '100%');
		this.observer.observe(this.element.nativeElement);
	}

	ngOnDestroy(): void {
		this.observer.disconnect();
		this.resize.complete();
	}

	private resizeTable(): void {
		const nzTable: HTMLElement = this.element.nativeElement;

		// offset `thead` height if present
		const theadHeight = nzTable.querySelector('thead')?.offsetHeight ?? 0;
		this.table.scrollY = `${nzTable.clientHeight - theadHeight}px`;

		this.cd.detectChanges();
	}
}
