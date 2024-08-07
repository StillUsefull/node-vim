class Plugin {
    constructor(name) {
        this.name = name;
    }

    register(pluginManager) {
        throw new Error('register method must be implemented');
    }
}

module.exports = Plugin;