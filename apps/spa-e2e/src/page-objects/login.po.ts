import type { Page } from '@playwright/test';

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

	async loginWithB2C(username: string, password: string): Promise<void> {
		await this.gotoLoginPage();

		const usernameInput = await this.page.waitForSelector(
			this.selectors.b2c.userIdInput,
		);
		const passwordInput = await this.page.waitForSelector(
			this.selectors.b2c.passwordInput,
		);
		const b2cLoginBtn = await this.page.waitForSelector(
			this.selectors.b2c.loginBtn,
		);

		await usernameInput.fill(username);
		await passwordInput.fill(password);
		await b2cLoginBtn.click();
	}

	async loginViaDevAuth(username: string): Promise<void> {
		await this.gotoLoginPage();
		const testUserLoginBtn = await this.page.waitForSelector(
			`button[data-username="${username}"]`,
		);
		await testUserLoginBtn.click();
	}

	private async gotoLoginPage(): Promise<void> {
		await this.page.goto('/auth');

		const loginBtn = await this.page.waitForSelector(this.selectors.loginBtn);
		await loginBtn.click();
	}
}
