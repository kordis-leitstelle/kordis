import { Component } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
	selector: 'krd-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {
	constructor(readonly themeService: ThemeService) {}
}
