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

    let mainJS = fs.readFileSync(path.join(__dirname, 'main.js'), { encoding: 'utf8' });
    var result = await minify(mainJS, { mangle: { properties: true, } });

    fs.writeFileSync(path.join(__dirname, 'dist', 'main.js'), result.code);

    console.log("Prepared dist successfully");
}

prepareDist();