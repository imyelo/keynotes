import fs from "fs-extra";
import ejs from 'ejs'
import { fileURLToPath } from "url";
import { resolve, join } from "path";
import { readPackageAsync } from "read-pkg";

const scriptsDir = resolve(fileURLToPath(import.meta.url), "..");
const root = resolve(scriptsDir, "..");
const distDir = join(root, "dist");

const main = async () => {
  await fs.ensureDir(distDir);
  await fs.emptyDir(distDir);
  const pkg = await readPackageAsync({ cwd: root });
  const names = []

  // dists
  for (let path of pkg.workspaces) {
    const projectDir = join(root, path);
    const projectPackage = await readPackageAsync({ cwd: projectDir });
    const name = projectPackage.name;
    const targetDir = join(distDir, name);
    await fs.move(join(projectDir, "dist"), targetDir);
    names.push(name)
  }
  names.reverse(); // desc

  const templates = {
    index: await fs.readFile(join(scriptsDir, 'index.ejs'), 'utf8'),
    redirects: await fs.readFile(join(scriptsDir, '_redirects.ejs'), 'utf8'),
  }
  // index
  await fs.writeFile(join(distDir, 'index.html'), ejs.render(templates.index, { names }), 'utf8')
  // cname
  await fs.copy(join(scriptsDir, "CNAME"), join(distDir, 'CNAME'));
  // redirects
  await fs.writeFile(join(distDir, '_redirects'), ejs.render(templates.redirects, { names }), 'utf8')
};

main();
