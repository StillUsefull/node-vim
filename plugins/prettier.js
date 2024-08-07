const Plugin = require('./example/Plugin.interface.js');

class PrettierPlugin extends Plugin {
    constructor() {
        super('PrettierPlugin');
    }

    register(pluginManager) {
        pluginManager.registerCommand('formatCode', this.formatCode.bind(this));
        pluginManager.registerKeyBinding('ctrl+f', 'formatCode');
    }

    formatCode(editor) {
        const formattedCode = prettier.format(editor.buffer.getText(), { parser: "babel" });
        editor.buffer.setText(formattedCode);
        editor.render();
    }
}

module.exports = PrettierPlugin;