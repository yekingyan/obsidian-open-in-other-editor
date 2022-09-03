import { Plugin } from 'obsidian';


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

function open(by : "gvim"| "code", path :string) {
	if (!path) {
		return
	}
	runCMD(`${by} ${path}`)
}

export default class MyPlugin extends Plugin {
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
		let cwd = this.app.vault.adapter.getResourcePath(".")
		cwd = cwd.replace("app://local/", "").replace(/\?\d+.*?/, "")
		open(by, `${cwd}/${curFilePath}`)
	}

}
