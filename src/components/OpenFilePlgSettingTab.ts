import { App, PluginSettingTab, Setting } from "obsidian";
import OpenFilePlg from "../main";

export class OpenFilePlgSettingTab extends PluginSettingTab {
	plugin: OpenFilePlg;
	constructor(app: App, plugin: OpenFilePlg) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display() {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("path to vscode ")
			.setDesc("absolute")
			.addText((text) =>
				text
					.setPlaceholder("hrm")
					.then((component) => {
						console.log({
							component,
							config: this.plugin.settingConfig,
						});
						return component;
					})
					.setValue(this.plugin.settingConfig.vscode_path)
					.onChange(async (value) => {
						this.plugin.settingConfig.vscode_path = value;
						await this.plugin.doSaveSettingConfig();
					})
			);
	}
}
