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
			.setName("vscode")
			.setDesc("macOS only")
			.addText((text) =>
				text
					.setPlaceholder("Absolute path")
					.setValue(this.plugin.settingConfig.vscode_path)
					.onChange(async (value) => {
						this.plugin.settingConfig.vscode_path = value;
						await this.plugin.doSaveSettingConfig();
					})
			);
	}
}
