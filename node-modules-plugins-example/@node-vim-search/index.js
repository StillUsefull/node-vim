class SearchPlugin {
    constructor() {
        this.name = 'SearchPlugin';
    }

    register(pluginManager) {
        pluginManager.registerCommand('editor:searchWord', this.searchWord.bind(this));
        pluginManager.registerKeyBinding('ctrl+f', 'editor:searchWord');
    }

    searchWord(editor) {
        const prompt = blessed.prompt({
            parent: editor.window.box,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            label: ' Search ',
            tags: true,
            keys: true,
            vi: true
        });

        prompt.input('Enter search keyword:', '', (err, keyword) => {
            if (err) {
                editor.createPopup('error', `Search error: ${err.message}`);
                return;
            }

            if (!keyword) {
                return;
            }


            const lines = editor.buffer.getLines();
            const results = this.findWord(lines, keyword);
            if (results.length === 0) {
                editor.createPopup('info', 'No results found');
            } else {
                this.displayResults(editor, results);
            }
        });
    }


    findWord(lines, word) {
        const results = [];
        lines.forEach((line, index) => {
            const regex = RegExp(word, 'i')
            if (regex.test(line)) {
                results.push({ line: index + 1, content: line });
            }
        });
        return results;
    }

    displayResults(editor, results) {
        const items = results.map(r => `Line ${r.line}: ${r.content}`);
        const list = blessed.list({
            parent: editor.window.box.screen,
            border: 'line',
            height: '50%',
            width: '80%',
            top: 'center',
            left: 'center',
            label: ` Search Results (${results.length}) `,
            tags: true,
            keys: true,
            vi: true,
            items: items,
            style: {
                selected: {
                    bg: 'blue',
                    fg: 'white'
                }
            },
            scrollable: true,
            alwaysScroll: true,
            scrollbar: {
                ch: '|',
                track: {
                    bg: 'cyan'
                },
                style: {
                    inverse: true
                }
            }
        });

        list.key(['up', 'down', 'k', 'j'], () => {
            list.screen.render();
        });

        list.key(['enter'], () => {
            const selectedIndex = list.selected;
            const line = results[selectedIndex].line - 1;
            editor.window.cursor = {x: 0, y: line};
            list.screen.remove(list);
            list.screen.render();
        });

        list.key(['escape', 'q'], () => {
            list.screen.remove(list);
            list.screen.render();
        });

        list.focus();
        editor.window.box.screen.render();
    }
}

module.exports = SearchPlugin;
