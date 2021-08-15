var fs = require('fs');
var path = require('path');
const { minify } = require("terser");
var dir = path.join(__dirname, 'dist');

const prepareDist = async () => {

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const files = ['index.html', 'feedback-modal.html', 'bottom-panel.html', 'styles.css'];

    files.forEach(file => fs.copyFileSync(path.join(__dirname, file), path.join(__dirname, 'dist', file)))

    let mainJS = fs.readFileSync(path.join(__dirname, 'main.js'), { encoding: 'utf8' });
    var result = await minify(mainJS);

    fs.writeFileSync(path.join(__dirname, 'dist', 'main.js'), result.code);

    console.log("Prepared dist successfully");
}

prepareDist();