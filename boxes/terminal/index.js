const terminalBox = require('./box')
const addFunctionality = require('./functionality')


function initialize(parent){
    const terminal = terminalBox(parent);
    addFunctionality(terminal)
};

module.exports = initialize;