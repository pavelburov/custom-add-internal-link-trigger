import {App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface CustomAddInternalLinkTriggerPluginSettings {
	trigger: string;
}

const DEFAULT_SETTINGS: CustomAddInternalLinkTriggerPluginSettings = {
	trigger: 'хх', // cyrillic
}

export default class CustomAddInternalLinkTriggerPlugin extends Plugin {
	settings: CustomAddInternalLinkTriggerPluginSettings;

	private readonly onEditorChange = (editor: Editor, info: MarkdownView) => {
		const {
			trigger = ''
		} = this.settings;

		const currentPosition = editor.getCursor();

		const fromPosition = {
			line: currentPosition.line,
			ch: Math.max(0, currentPosition.ch - trigger.length)
		};

		const range = editor.getRange(fromPosition, currentPosition);

		if (trigger && trigger != '' && range === trigger) {
			console.debug('CustomAddInternalLinkTriggerPlugin - replacing trigger', range);
			editor.replaceRange('', fromPosition, currentPosition);
			this.app.commands.executeCommandById('editor:insert-wikilink');
		}
	}

	async onload() {
		await this.loadSettings();

		// on(name: 'editor-change', callback: (editor: Editor, info: MarkdownView | MarkdownFileInfo) => any, ctx?: any): EventRef;
		this.registerEvent(this.app.workspace.on('editor-change', this.onEditorChange, this));

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: CustomAddInternalLinkTriggerPlugin;

	constructor(app: App, plugin: CustomAddInternalLinkTriggerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('trigger')
			.setDesc('Character sequence to trigger \'Add Internal Link\' command')
			.addText(text => text
				.setPlaceholder('Enter character sequence')
				.setValue(this.plugin.settings.trigger)
				.onChange(async (value) => {
					this.plugin.settings.trigger = value;
					await this.plugin.saveSettings();
				}));
	}
}
