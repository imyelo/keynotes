import fs from "fs-extra";
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
  const redirects = []

  for (let path of pkg.workspaces) {
    const projectDir = join(root, path);
    const projectPackage = await readPackageAsync({ cwd: projectDir });
    const name = projectPackage.name;
    const targetDir = join(distDir, name);
    await fs.move(join(projectDir, "dist"), targetDir);
    redirects.push(`/${name}/*\t/${name}/index.html\t200`)
  }

  await fs.copy(join(scriptsDir, "CNAME"), join(distDir, 'CNAME'));
  await fs.writeFile(join(distDir, '_redirects'), redirects.join('\n'), 'utf8')
};

main();
