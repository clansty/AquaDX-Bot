import esbuild from 'esbuild';
import packageJson from './package.json';

esbuild.buildSync({
  bundle: true,
  entryPoints: ['src/index.ts'],
  outdir: 'build',
  sourcemap: true,
  platform: 'node',
  external: Object.keys(packageJson.dependencies),
});
