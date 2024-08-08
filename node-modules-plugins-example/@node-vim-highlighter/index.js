class SyntaxHighlightingPlugin{
    constructor() {
        this.name = 'SyntaxHighlightingPlugin';
        this.keywordStyles = {
            'class': { fg: '214', bold: true },  
            'function': { fg: '33', bold: true },  
            'const': { fg: '33', bold: true },  
            'let': { fg: '51', bold: true },     
            'var': { fg: '57', bold: true },     
            'return': { fg: '81', bold: true }, 
            'if': { fg: '81', bold: true },      
            'else': { fg: '75', bold: true },    
            'for': { fg: '111', bold: true },    
            'while': { fg: '75', bold: true },
            'require': { fg: '28', bold: true },  
            'import': { fg: '28', bold: true },  
            'from': { fg: '28', bold: true },  
            'constructor': { fg: '81', bold: true }, 
        };
    }

    register(pluginManager) {
        pluginManager.registerDisplayUpdater(this.highlightKeywords.bind(this));
    }

    highlightKeywords(content, editor) {
        const lines = content.split('\n');
        
        return lines.map(line => {
            Object.keys(this.keywordStyles).forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                line = line.replace(regex, match => editor.window.colorize(match, this.keywordStyles[keyword]));
            });
            return line;
        }).join('\n');
    }
}

module.exports = SyntaxHighlightingPlugin;