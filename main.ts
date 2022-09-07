import { Plugin } from 'obsidian';
import * as os from 'os';


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
export default class OpenFilePlg extends Plugin {
	async onload() {

		this.addCommand({
			id: 'open-in-other-editor-gvim',
			name: 'Open current active file in gVim',
			callback: () => {
				this.open("gvim")
			}
		});

		this.addCommand({
			id: 'open-in-other-editor-vscode',
			name: 'Open current active file in VScode',
			callback: () => {
				this.open("code")
			}
		});
	}

	onunload() {
	}

	private open(by : "gvim"| "code") {
		let curFilePath = this.app.workspace.getActiveFile()?.path
		if (!curFilePath) {
			console.warn("no active file in workspace");
			return
		}
		let cwd = this.app.vault.adapter.getResourcePath(".")
		cwd = cwd.replace("app://local/", "").replace(/\?\d+.*?/, "")
		if (os.type() === "Windows_NT") {
			runCMD(`cd /d ${cwd} && ${by} ./${curFilePath}`)
		} else {
			runCMD(`cd ${cwd} && ${by} ./${curFilePath}`)
		}
	}
}
