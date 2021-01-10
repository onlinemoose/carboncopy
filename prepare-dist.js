var fs = require('fs');
var path = require('path');
const { minify } = require("terser");
var dir = path.join(__dirname, 'dist');

const prepareDist = async () => {

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(__dirname, 'dist', 'index.html'));

    fs.copyFileSync(path.join(__dirname, 'not-authorized.html'), path.join(__dirname, 'dist', 'not-authorized.html'));

    fs.copyFileSync(path.join(__dirname, 'auth-success.html'), path.join(__dirname, 'dist', 'auth-success.html'));

    fs.copyFileSync(path.join(__dirname, 'sidebar.html'), path.join(__dirname, 'dist', 'sidebar.html'));

    let mainJS = fs.readFileSync(path.join(__dirname, 'main.js'), { encoding: 'utf8' });
    var result = await minify(mainJS);

    fs.writeFileSync(path.join(__dirname, 'dist', 'main.js'), result.code);

    let sidebarJS = fs.readFileSync(path.join(__dirname, 'sidebar.js'), { encoding: 'utf8' });
    var sidebarResult = await minify(sidebarJS);

    fs.writeFileSync(path.join(__dirname, 'dist', 'sidebar.js'), sidebarResult.code);

    let utilJS = fs.readFileSync(path.join(__dirname, 'util.js'), { encoding: 'utf8' });
    var utilResult = await minify(utilJS);

    fs.writeFileSync(path.join(__dirname, 'dist', 'util.js'), utilResult.code);

    console.log("Prepared dist successfully");
}

prepareDist();