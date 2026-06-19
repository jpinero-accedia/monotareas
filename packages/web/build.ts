// vim: ft=typescript: ts=3: sw=3: noet:

import esbuild, { type BuildOptions } from 'esbuild';
import { cpSync, mkdirSync } from 'node:fs';

const watch: boolean = process.argv.includes('--watch');

mkdirSync('dist', { recursive: true });
cpSync('public/index.html', 'dist/index.html');
cpSync('public/style.css', 'dist/style.css');

const options: BuildOptions = {
	entryPoints: ['src/main.ts'],
	bundle:      true,
	outfile:     'dist/bundle.js',
	format:      'esm',
	target:      'es2018',
	sourcemap:   true,
};

if (watch) {
	const ctx = await esbuild.context(options);
	await ctx.watch();
	console.log('Watching for changes...');
}
else {
	await esbuild.build(options);
}
