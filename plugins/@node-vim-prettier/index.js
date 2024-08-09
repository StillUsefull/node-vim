const prettier = require('prettier')

class PrettierPlugin {
    constructor() {
        this.name = 'PrettierPlugin';
    }

    register(pluginManager) {
        pluginManager.registerCommand('editor:formatCode', this.formatCode.bind(this));
        pluginManager.registerKeyBinding('ctrl+x', 'editor:formatCode');
    }

    async formatCode(editor) {
        try {
            let content = editor.buffer.toString();
            
            content = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            const formatted = await prettier.format(content, { parser: "babel", semi: true });
            editor.buffer.lines = formatted.split('\n');
            editor.window.render();
        } catch (error) {
            editor.createPopup('error', `Failed to format code: ${error}`);
        }
    }
}

module.exports = PrettierPlugin;