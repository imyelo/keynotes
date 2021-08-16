import fs from "fs-extra";
import ejs from 'ejs'
import { fileURLToPath } from "url";
import { resolve, join } from "path";
import { readPackageAsync } from "read-pkg";
import { config } from './config.mjs'

const scriptsDir = resolve(fileURLToPath(import.meta.url), "..");
const root = resolve(scriptsDir, "..");
const distDir = join(root, "dist");

const main = async () => {
  await fs.ensureDir(distDir);
  await fs.emptyDir(distDir);
  const outputPaths = new Map()

  // dists
  for (let slide of config.slides) {
    const projectDir = join(root, slide.root);
    const projectPackage = await readPackageAsync({ cwd: projectDir });
    const name = projectPackage.name;
    const targetDir = join(distDir, name);
    await fs.move(join(projectDir, "dist"), targetDir);
    outputPaths.set(slide.root, name)
  }

  const templates = {
    index: await fs.readFile(join(scriptsDir, 'index.ejs'), 'utf8'),
    redirects: await fs.readFile(join(scriptsDir, '_redirects.ejs'), 'utf8'),
  }
  // index
  await fs.writeFile(join(distDir, 'index.html'), ejs.render(templates.index, { config, outputPaths }), 'utf8')
  // cname
  await fs.copy(join(scriptsDir, "CNAME"), join(distDir, 'CNAME'));
  // redirects
  await fs.writeFile(join(distDir, '_redirects'), ejs.render(templates.redirects, { outputPaths }), 'utf8')
};

main();
