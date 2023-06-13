Use directenv or autoshellenv to set OBSIDIAN_TEST_VAULT into process.env
The build will use that env as the test vault.

Placing a path in OPHIDIAN_TEST_VAULT will direct ophidian builder to send build artifacts to assigned dev vault.
ie :$HOME/coding/contribute-to-git/obsidian-custom-classes/dev-vault

# Features

## Hot Reload

* withInstall has two params, the second is hot reload that defaults to true.
