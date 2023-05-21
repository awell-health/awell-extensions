const fs = require('fs');
const path = require('path');

/**
 * We're creating a markdown.json file that contains README.md and CHANGELOG.md. Rather than handle file
 * locations, and given there aren't currently images or other assets, we're just keeping the markdown
 * in a single file.
 */
const copyMarkdownFiles = () => {
    const extensionsDir = path.join(__dirname, './extensions');
    const distDir = path.join(__dirname, './dist/extensions');
    if (!fs.existsSync(extensionsDir) || !fs.existsSync(distDir)) {
        throw new Error('missing extensionsDir or dist directory')
    }
    
    const markdown = fs.readdirSync(extensionsDir).reduce((obj, name) => {
        const extensionPath = path.join(extensionsDir, name);
        if (fs.lstatSync(extensionPath).isDirectory()) {
            const readme = path.join(extensionPath, 'README.md');
            const changelog = path.join(extensionPath, 'CHANGELOG.md');
            obj[name] = {
                readme: fs.readFileSync(readme, 'utf8') ?? '',
                changelog: fs.readFileSync(changelog, 'utf8') ?? '',
            }
        }
        return obj
    }, {})
    fs.writeFileSync(path.join(__dirname, './dist/extensions/markdown.json'), JSON.stringify(markdown, null, 2))
}

copyMarkdownFiles();