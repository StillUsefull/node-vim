const fs = require('fs');
const path = require('path');

class PluginManager {
    constructor() {
        this.commands = {};
        this.keyBindings = {};
        this.displayUpdaters = [];
        this.loadPlugins();
    }

    loadPlugins() {
        const nodeModulesPath = path.resolve(__dirname, '..', '..','node_modules');
        const pluginPrefix = '@node-vim';
    
        try {
            const directories = fs.readdirSync(nodeModulesPath);
            directories.forEach(dir => {
                if (dir.startsWith(pluginPrefix)) {
                    try {
                        const pluginPath = path.join(nodeModulesPath, dir);
                        const PluginClass = require(pluginPath);
                        const pluginInstance = new PluginClass();
                        pluginInstance.register(this);
                    } catch (error) {
                        console.log(`Failed to load plugin: ${dir}`, error);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to read node_modules directory', error);
        }
    }

    registerCommand(commandName, commandFunction) {
        this.commands[commandName] = commandFunction;
    }

    registerKeyBinding(keyBinding, commandName) {
        this.keyBindings[keyBinding] = commandName;
    }

    registerDisplayUpdater(updaterFunction) {
        this.displayUpdaters.push(updaterFunction);
    }

    executeCommand(commandName, ...args) {
        if (this.commands[commandName]) {
            this.commands[commandName](...args);
        }
    }

    handleKeyPress(key, context) {
        const keyBinding = `${key.ctrl ? 'ctrl+' : ''}${key.name}`;
        const commandName = this.keyBindings[keyBinding];

        if (commandName) {
            const [prefix, cmd] = commandName.split(':');
            const currentContext = context.constructor.name.toLowerCase(); 
            if (prefix === currentContext) {
                this.executeCommand(commandName, context);
            }
        }
    
    }

    updateDisplayContent(content, editor) {
        return this.displayUpdaters.reduce((updatedContent, updater) => updater(updatedContent, editor), content);
    }
}

module.exports = new PluginManager();