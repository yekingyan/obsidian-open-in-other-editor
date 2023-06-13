import {
	DataAdapter,
	Plugin,
	Notice,
	App,
	Vault,
	MenuItem,
	Menu,
} from "obsidian";
import * as os from "os";
import { spawn, exec } from "child_process";
import { OpenFilePlgSettingTab } from "./components/OpenFilePlgSettingTab";

const CONST_TO_EDITOR_MAP = {
	GVIM: "gvim",
	VSCODE: "code",
	NVIM: "nvim-qt",
} as const;

type ValueOf<T> = T[keyof T];
type EditorName = ValueOf<typeof CONST_TO_EDITOR_MAP>;
type EditorNameToBinPathConfig = Record<EditorName, string>;

type AdapterPlus = Partial<DataAdapter> & {
	path: any;
	basePath: any;
};

function runCMD(cmd: string) {
	const { exec } = require("child_process");
	exec(cmd, (error: string, stdout: string, stderr: string) => {
		if (error) {
			console.error(`run cmd err: ${error}, ${stdout}, ${stderr}`);
			return;
		}
		console.log(`run cmd: ${cmd}`);
	});
}

type HandleArguments = {
	file: string;
	args: string[];
};

export async function execa(file: string, args: string[]) {
	const handledArgs = handleArguments(file, args);
	let spawned = spawn(handledArgs.file, handledArgs.args);
	return new Promise((resolve, reject) => {
		spawned.on("exit", (exitCode, signal) => {
			resolve({ exitCode, signal });
		});

		spawned.on("error", (error) => {
			reject(error);
		});
		spawned.stdout.on("data", (data) => console.log(data.toString()));
		if (spawned.stdin) {
			spawned.stdin.on("error", (error) => {
				reject(error);
			});
		}
	});
}

function handleArguments(
	file: HandleArguments["file"],
	args: HandleArguments["args"]
) {
	return { file, args };
}

type SettingConfig = {
	vscode_path: string;
	gvim_path: string;
	nvim_path: string;
};

export default class OpenFilePlg extends Plugin {
	settingConfig: SettingConfig = {
		vscode_path: "",
		gvim_path: "",
		nvim_path: "",
	};

	async doLoadSettingConfig() {
		this.settingConfig = {
			...this.settingConfig,
			...(await this.loadData()),
		};
	}
	async doSaveSettingConfig() {
		await this.saveData(this.settingConfig);
	}
	async onload() {
		await this.doLoadSettingConfig();
		this.activateContextMenuFeature();

		this.addCommand({
			id: "open-in-other-editor-gvim",
			name: "Open current active file in gVim",
			callback: () => {
				this.open("gvim");
			},
		});

		this.addCommand({
			id: "open-in-other-editor-vscode",
			name: "Open current active file in VScode",
			callback: () => {
				this.open(CONST_TO_EDITOR_MAP.VSCODE);
			},
		});

		this.addCommand({
			id: "open-in-other-editor-nvim-qt",
			name: "Open current active file in nvim",
			callback: () => {
				this.open("nvim-qt");
			},
		});

		this.addSettingTab(new OpenFilePlgSettingTab(app, this));
	}

	activateContextMenuFeature() {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, abstractFile, source) => {
				menu.addSeparator();
				menu.addItem((mi) => {
					mi.setTitle("Open in other editor").onClick(
						clickHandler.bind(this)
					);
				});
				function clickHandler(e: MouseEvent) {
					if (this.settingConfig.vscode_path) {
						return this.open(CONST_TO_EDITOR_MAP.VSCODE, {
							curFilePath: abstractFile.path,
						});
					}
					new Notice(
						"Please save vscode editor path in settings.",
						5000
					);
				}
				menu.addSeparator();
			})
		);
		this.registerEvent(
			this.app.workspace.on(
				"files-menu",
				(menu: Menu, abstractFile: any, source: any) => {
					menu.addSeparator()
						.addItem((mi: MenuItem) => {
							mi.setTitle("Open in other editor").onClick(
								clickHandler.bind(this)
							);
						})
						.addSeparator();
					function clickHandler(e: MouseEvent) {
						if (
							this.settingConfig.vscode_path &&
							Array.isArray(abstractFile)
						) {
							return abstractFile.forEach((af) => {
								this.open(CONST_TO_EDITOR_MAP.VSCODE, {
									curFilePath: af.path,
								});
							});
						}
						this.open(CONST_TO_EDITOR_MAP.VSCODE, {
							curFilePath: abstractFile.path,
						});
					}
				}
			)
		);
	}

	onunload() {}

	/**
	 * @param by {EditorName}
	 * @param overrideConfig : {curFilePath: string} User may want to open a file from the file browser pane, not always from the active file.
	 */
	private open(
		by: EditorName,
		overrideConfig?: {
			curFilePath?: string;
		}
	) {
		const { curFilePath } = {
			curFilePath: this.app.workspace.getActiveFile()?.path,
			...overrideConfig,
		};
		if (!curFilePath) {
			return new Notice("No active file in workspace", 6000);
		}
		const { adapter } = this.app.vault;
		const { basePath } = adapter as AdapterPlus;

		const platform: NodeJS.Platform = os.platform();
		if (["darwin"].includes(platform)) {
			const file: EditorNameToBinPathConfig = {
				code: this.settingConfig.vscode_path,
				gvim: this.settingConfig.gvim_path,
				[CONST_TO_EDITOR_MAP.NVIM]: this.settingConfig.nvim_path,
			};
			return this.macopen(basePath, curFilePath, file[by]);
		} else if (os.type() === "Windows_NT") {
			runCMD(`cd /d "${basePath}" && ${by} "./${curFilePath}"`);
		} else {
			runCMD(`cd "${basePath}" && ${by} "./${curFilePath}"`);
		}
	}

	macopen(basePath: string, curFilePath: string, by: string) {
		const {
			path: { join },
		} = this.app.vault.adapter as AdapterPlus;
		const derived_path = join(basePath, curFilePath);

		void (async function (
			file: string,
			app: App & {
				vault: {
					adapter: DataAdapter & { fsPromises?: any };
				} & Vault;
			}
		) {
			if (!file) {
				return new Notice(
					"Please save absolute path to vscode into settings",
					7000
				);
			}
			const { err, access } = await app.vault.adapter.fsPromises
				.stat(file)
				.then((access: any) => ({ access, err: null }))
				.catch((err: Error) => {
					return {
						err,
						access: null,
					};
				});
			if (err && !access) {
				new Notice(
					[
						"Bin path in settings may be wrong",
						err.message.split(":")[1],
					].join("\n"),
					5000
				);
				return console.log({ err, access });
			}
			await execa(file, [derived_path]);
		})(by, this.app);
	}
}
