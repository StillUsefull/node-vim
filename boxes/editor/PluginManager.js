const fs = require('fs');
const path = require('path');

class PluginManager {
    constructor() {
        this.commands = {};
        this.keyBindings = {};
        this.displayUpdaters = [];
        this.pluginsDirectory = path.join(__dirname, '..', '..' ,'plugins');
        this.initializePlugins();
    }

    initializePlugins() {
        this.loadPluginsFromDirectory(this.pluginsDirectory);
    }

    loadPluginsFromDirectory(directory) {
        const pluginFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));
        pluginFiles.forEach(file => {
            const pluginPath = path.join(directory, file);
            const PluginClass = require(pluginPath);
            const pluginInstance = new PluginClass();
            this.loadPlugin(pluginInstance);
        });
    }

    loadPlugin(plugin) {
        plugin.register(this);
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

    handleKeyPress(key, editor) {
        const keyBinding = `${key.ctrl ? 'ctrl+' : ''}${key.name}`;
        const commandName = this.keyBindings[keyBinding];
        if (commandName) {
            this.executeCommand(commandName, editor);
        }
    }

    updateDisplayContent(content, editor) {
        return this.displayUpdaters.reduce((updatedContent, updater) => updater(updatedContent, editor), content);
    }
}

module.exports = PluginManager;
