import fs from "fs-extra";
import { fileURLToPath } from "url";
import { resolve, join } from "path";
import { readPackageAsync } from "read-pkg";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const distDir = join(root, "dist");

const main = async () => {
  await fs.ensureDir(distDir);
  await fs.emptyDir(distDir);
  const pkg = await readPackageAsync({ cwd: root });

  for (let path of pkg.workspaces) {
    const projectDir = join(root, path);
    const projectPackage = await readPackageAsync({ cwd: projectDir });
    await fs.move(join(projectDir, "dist"), join(distDir, projectPackage.name));
  }
};

main();
