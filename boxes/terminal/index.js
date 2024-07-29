const { spawn } = require('child_process');

class Terminal {
    constructor(parent) {
        this.terminalBox = this.createTerminalBox(parent);
        this.isFocused = false;
        this.initialize();
        this.length = 0;
    }

    createTerminalBox(parent) {
        return blessed.box({
            parent,
            label: 'Terminal',
            bottom: 0,
            right: 0,
            width: '85%',
            height: '25%',
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: 'blue'
                },
                focus: {
                    border: {
                        fg: 'yellow'
                    }
                }
            },
            scrollable: true,
            mouse: true,
            alwaysScroll: true,
            content: '',
            focusable: true,
            keys: true, 
            inputOnFocus: true 
        });
    }

    focus() {
        this.isFocused = true;
        this.terminalBox.focus();
        this.terminalBox.style.border.fg = 'yellow';
        this.terminalBox.screen.render();
    }

    unfocus() {
        this.isFocused = false;
        this.terminalBox.style.border.fg = 'blue';
    }

    updateContent(newContent) {
        this.terminalBox.setContent(newContent);
        this.terminalBox.screen.render();
    }

    clearContent() {
        this.updateContent('');
    }

    appendContent(newContent) {
        this.terminalBox.setContent(this.terminalBox.getContent() + newContent);
        this.terminalBox.screen.render();
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.terminalBox.setScrollPerc(100); 
        this.terminalBox.screen.render(); 
    }


    initialize() {
        const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
        const shellArgs = process.platform === 'win32' ? ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; powershell'] : [];

        this.child = spawn(shell, shellArgs, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: { ...process.env, LANG: 'en_US.UTF-8' }
        });

        this.child.stdout.setEncoding('utf8');
        this.child.stderr.setEncoding('utf8');

        this.child.stdout.on('data', (data) => {
            this.appendContent(data.toString());
        });

        this.child.stderr.on('data', (data) => {
            this.appendContent(data.toString());
        });

        this.terminalBox.on('keypress', (ch, key) => {
            if (this.isFocused) {
                if (key.full === 'enter') {
                    this.length = 0;
                    this.child.stdin.write('\n');
                } else if (key.full === 'backspace' && this.length > 0) {
                    this.length -= 1;
                    this.child.stdin.write('\b');
                    const content = this.terminalBox.getContent();
                    this.updateContent(content.slice(0, -1));
                } else if (ch) {
                    this.length += 1;
                    this.child.stdin.write(ch);
                }
            }
        });
    }
}

module.exports = Terminal;
