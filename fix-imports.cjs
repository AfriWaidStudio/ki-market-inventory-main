const fs = require("fs");
const path = require("path");

function resolveImport(filePath, importPath) {
  const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
  const srcPath = path.resolve(__dirname, "src");
  if (absoluteImportPath.startsWith(srcPath)) {
    const relativeToSrc = path.relative(srcPath, absoluteImportPath);
    return "@/" + relativeToSrc.replace(/\\/g, "/");
  }
  return importPath;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");

      let changed = false;
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match import or export statements with relative paths
        const match =
          line.match(/^(import|export)\s+.*from\s+['"](\.\.[\w\/\.\-]+)['"];?\s*$/) ||
          line.match(/^(import)\s+['"](\.\.[\w\/\.\-]+)['"];?\s*$/);

        if (match) {
          const importPath = match[match.length - 1]; // The path is the last capture group
          if (importPath.startsWith("..")) {
            const newPath = resolveImport(fullPath, importPath);
            if (newPath !== importPath) {
              lines[i] = line.replace(importPath, newPath);
              changed = true;
            }
          }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, lines.join("\n"));
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, "src"));
