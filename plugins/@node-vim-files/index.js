const fs = require('fs');
const path = require('path');

class FilesPlugin {
    constructor() {
        this.name = 'FilesPlugin';
    }

    register(pluginManager) {
        pluginManager.registerCommand('filemanager:createFileOrFolder', this.createFileOrFolder.bind(this));
        pluginManager.registerKeyBinding('ctrl+n', 'filemanager:createFileOrFolder');

        pluginManager.registerCommand('filemanager:deleteFileOrFolder', this.deleteFileOrFolder.bind(this));
        pluginManager.registerKeyBinding('ctrl+r', 'filemanager:deleteFileOrFolder');
    }

    async createFileOrFolder(fileTree) {
        if (!fileTree.directoryPath) return;
        const screen = fileTree.box.parent.screen;

        const prompt = blessed.prompt({
            parent: screen,
            top: 'center',
            left: 'center',
            width: '50%',
            height: 'shrink',
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
                focus: { border: { fg: 'yellow' } }
            },
            keys: true,
            vi: true
        });

        prompt.readInput('Enter name for new file or folder: ', '', (err, name) => {
            if (err) {
                fileTree.createPopup('error', `Failed to read input: ${err}`);
                return;
            }

            if (!name) {
                fileTree.createPopup('error', 'Name cannot be empty');
                return;
            }

            const fullPath = path.join(fileTree.directoryPath, name);

            fs.stat(fullPath, (err, stats) => {
                if (!err && stats.isDirectory()) {
                    fileTree.createPopup('error', 'A file or directory with that name already exists');
                    return;
                }

                const isDirectory = name.endsWith('/');

                if (isDirectory) {
                    fs.mkdir(fullPath, (err) => {
                        if (err) {
                            fileTree.createPopup('error', `Failed to create directory: ${err}`);
                            return;
                        }
                        fileTree.createPopup('success', `Directory created successfully: ${name}`);
                    });
                } else {
                    fs.writeFile(fullPath, '', (err) => {
                        if (err) {
                            fileTree.createPopup('error', `Failed to create file: ${err}`);
                            return;
                        }
                        fileTree.createPopup('success', `File created successfully: ${name}`);
                    });
                }
            });
        });
    }

    async deleteFileOrFolder(fileTree) {
        if (!fileTree.directoryPath) return;

        const screen = fileTree.box.parent.screen;

        const selectedItem = fileTree.getSelectedItem();
        if (!selectedItem) {
            fileTree.createPopup('error', 'No item selected');
            return;
        }

        const fullPath = path.join(fileTree.directoryPath, selectedItem);

        fs.stat(fullPath, (err, stats) => {
            if (err) {
                fileTree.createPopup('error', `Item does not exist: ${err}`);
                return;
            }

            if (stats.isDirectory()) {
                this.promptForDirectoryDeletion(fileTree, fullPath, selectedItem);
            } else {
                this.deleteFile(fileTree, fullPath, selectedItem);
            }
        });
    }

    promptForDirectoryDeletion(fileTree, fullPath, selectedItem) {
        const screen = fileTree.box.parent.screen;

        const confirmPrompt = blessed.prompt({
            parent: screen,
            top: 'center',
            left: 'center',
            width: '50%',
            height: 'shrink',
            border: { type: 'line' },
            style: {
                border: { fg: 'red' },
                focus: { border: { fg: 'yellow' } }
            },
            keys: true,
            vi: true
        });

        confirmPrompt.readInput(`The directory ${selectedItem} is not empty. Are you sure you want to delete it and all its contents? (yes/no): `, '', (err, confirmation) => {
            if (err) {
                fileTree.createPopup('error', `Failed to read input: ${err}`);
                return;
            }

            if (confirmation && confirmation.toLowerCase() === 'yes') {
                this.deleteDirectoryRecursive(fileTree, fullPath, selectedItem);
            } else {
                fileTree.createPopup('info', 'Deletion cancelled');
            }
        });
    }

    deleteDirectoryRecursive(fileTree, dirPath, selectedItem) {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                fileTree.createPopup('error', `Failed to read directory: ${err}`);
                return;
            }

            if (files.length === 0) {
                fs.rmdir(dirPath, (err) => {
                    if (err) {
                        fileTree.createPopup('error', `Failed to delete directory: ${err}`);
                        return;
                    }
                    fileTree.createPopup('success', `Directory deleted successfully: ${selectedItem}`);
                    fileTree.updateContent();
                });
            } else {
                const deletePromises = files.map(file => {
                    const fullPath = path.join(dirPath, file);
                    return new Promise((resolve, reject) => {
                        fs.stat(fullPath, (err, stats) => {
                            if (err) return reject(err);

                            if (stats.isDirectory()) {
                                this.deleteDirectoryRecursive(fileTree, fullPath, file).then(resolve).catch(reject);
                            } else {
                                fs.unlink(fullPath, (err) => {
                                    if (err) return reject(err);
                                    resolve();
                                });
                            }
                        });
                    });
                });

                Promise.all(deletePromises).then(() => {
                    fs.rmdir(dirPath, (err) => {
                        if (err) {
                            fileTree.createPopup('error', `Failed to delete directory: ${err}`);
                            return;
                        }
                        fileTree.createPopup('success', `Directory deleted successfully: ${selectedItem}`);
                        fileTree.updateContent();
                    });
                }).catch(err => {
                    fileTree.createPopup('error', `Failed to delete contents: ${err}`);
                });
            }
        });
    }

    deleteFile(fileTree, fullPath, selectedItem) {
        fs.unlink(fullPath, (err) => {
            if (err) {
                fileTree.createPopup('error', `Failed to delete file: ${err}`);
                return;
            }
            fileTree.createPopup('success', `File deleted successfully: ${selectedItem}`);
            fileTree.updateContent();
        });
    }
}

module.exports = FilesPlugin;
