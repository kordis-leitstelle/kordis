import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { InputComponent } from './input.component';

export default {
	title: 'InputComponent',
	component: InputComponent,
	decorators: [
		moduleMetadata({
			imports: [],
		}),
	],
} as Meta<InputComponent>;

const Template: Story<InputComponent> = (args: InputComponent) => ({
	props: args,
});

export const Primary = Template.bind({});
Primary.args = {};
