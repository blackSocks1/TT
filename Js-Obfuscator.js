const Fs = require("fs");
const Path = require("path");
const Js_obf = require("javascript-obfuscator");

const src = Path.join(__dirname, "/public/js/test/");
const build = Path.join(__dirname, "/build/");

readDirectory(src);

function readDirectory(dirPath) {
  Fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    files.forEach((file) => {
      let path = Path.join(dirPath, file);

      Fs.stat(path, (err, stat) => {
        if (err) {
          console.log("Error stating the file", err);
          return;
        }

        if (stat.isFile()) {
          const newPath = path.replace(src, build);
          Fs.copyFileSync(path, newPath);

          if (newPath.endsWith(".js")) {
            obfuscate(newPath);
          }
        } else if (stat.isDirectory()) {
          var newDir = path.replace(src, build);

          if (!Fs.existsSync(newDir)) {
            Fs.mkdir(newDir, (err) => {
              console.log(err);
            });
          }
          readDirectory(path);
        }
      });
    });
  });
}

function obfuscate(filePath) {
  const content = Fs.readFileSync(filePath).toString();
  var result = Js_obf.obfuscate(content, {
    compact: true,
    controlFlowFlattening: false,
    target: "browser",
  });
  Fs.writeFileSync(filePath, result.getObfuscatedCode());
}
