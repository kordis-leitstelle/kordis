import { Page } from '@playwright/test';

import { testIdSelector } from '../helper';

export class LoginPo {
	private readonly selectors = {
		b2c: {
			userIdInput: '#UserId',
			passwordInput: '#password',
			loginBtn: '#next',
		},
		loginBtn: testIdSelector('login-btn'),
	};
	constructor(private readonly page: Page) {}

	async login(username: string, password: string): Promise<void> {
		await this.page.goto('/auth');

		const loginBtn = await this.page.waitForSelector(this.selectors.loginBtn);
		await loginBtn.click();

		const usernameInput = await this.page.waitForSelector(
			this.selectors.b2c.userIdInput,
		);
		const passwordInput = await this.page.waitForSelector(
			this.selectors.b2c.passwordInput,
		);
		const b2cLoginBtn = await this.page.waitForSelector(
			this.selectors.b2c.loginBtn,
		);

		await usernameInput.type(username);
		await passwordInput.type(password);
		await b2cLoginBtn.click();
	}
}
