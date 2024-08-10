const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class PluginManager {
    constructor() {
        this.commands = {};
        this.keyBindings = {};
        this.displayUpdaters = [];
        this.loadPlugins();
    }

    loadPlugins() {
        const pluginsDir = path.resolve(__dirname, 'node_modules', '@node-vim');
        if (!fs.pathExistsSync(pluginsDir)) return;
        try {
            const directories = fs.readdirSync(pluginsDir);
            directories.forEach(dir => {
                const pluginPath = path.join(pluginsDir, dir, 'index.js');
                if (fs.existsSync(pluginPath)) {
                    try {
                        const PluginClass = require(pluginPath);
                        const pluginInstance = new PluginClass();
                        pluginInstance.register(this);
                    } catch (error) {
                        console.log(`Failed to load plugin: @node-vim/${dir}`, error);
                    }
                } else {
                    console.log(`Invalid plugin: @node-vim/${dir} (index.js not found)`);
                }
            });
        } catch (error) {
            console.error('Failed to read plugins directory', error);
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

    listPlugins() {
        const nodeModulesPath = path.resolve(__dirname, 'node_modules', '@node-vim');
    
        try {
            if (!fs.existsSync(nodeModulesPath)) {
                console.log('No plugins installed.');
                return;
            }
            const directories = fs.readdirSync(nodeModulesPath);
    
            if (directories.length === 0) {
                console.log('No plugins installed.');
            } else {
                console.log('Installed plugins:');
                directories.forEach(dir => {
                    const pluginPath = path.join(nodeModulesPath, dir, 'index.js');
                    if (fs.existsSync(pluginPath)) {
                        console.log(`- @node-vim/${dir}`);
                    } else {
                        console.log(`- @node-vim/${dir} (Invalid plugin: index.js not found)`);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to list plugins', error);
        }
    }

    addPlugin(source) {
        const nodeModulesPath = path.resolve(__dirname, 'node_modules');
        const pluginName = path.basename(source, '.git');
        if (!pluginName.startsWith('@node-vim')) {
            console.error(`Invalid plugin name: ${pluginName}. Plugins must start with @node-vim.`);
            return;
        }
        const pluginPath = path.join(nodeModulesPath, pluginName);
        if (fs.existsSync(pluginPath)) {
            console.error(`Plugin ${pluginName} is already installed.`);
            return;
        }
        try {
            if (source.startsWith('http://') || source.startsWith('https://')) {
                execSync(`npm install ${source}`, { stdio: 'inherit' });
            } else {
                const absolutePath = path.resolve(process.cwd(), source);
                execSync(`npm install ${absolutePath}`, { stdio: 'inherit' });
            }
            console.log(`Plugin ${pluginName} added successfully.`);
        } catch (error) {
            console.error(`Failed to add plugin: ${source}`, error);
        }
    }
}

module.exports = new PluginManager();