#!/usr/bin/env node
const { program } = require('commander');
const PluginManager = require('./PluginManager');

program
  .version('1.0.0')
  .description('Node Vim CLI');



program
  .command('run')
  .description('Run Node Vim')
  .action(() => {
    require('./index.js');
  });

program
  .command('add-plugin <source>')
  .description('Add a plugin from a Git repository or local path')
  .action((source) => {
    PluginManager.addPlugin(source);
  });

program
  .command('list-plugins')
  .description('List installed plugins')
  .action(() => {
    PluginManager.listPlugins();
  });

program.parse(process.argv);