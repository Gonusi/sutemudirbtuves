#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");

const ROOTS = ["content"];
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const RESIZED_FLAG = ".resized";
const SKIP_DIRS = new Set(["node_modules", "_site", "_site_en", "_site_lt", ".git"]);

function isOriginalImage(filePath) {
	const parsed = path.parse(filePath);
	const ext = parsed.ext.toLowerCase();
	if (!EXTENSIONS.has(ext)) return false;
	if (parsed.name.includes(RESIZED_FLAG)) return false;
	return true;
}

function toResizedPath(filePath) {
	const parsed = path.parse(filePath);
	const ext = parsed.ext.toLowerCase();
	const outputExt = ext === ".png" || ext === ".jpeg" ? ".jpg" : parsed.ext;
	return path.join(parsed.dir, `${parsed.name}${RESIZED_FLAG}${outputExt}`);
}

async function fileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function processFile(filePath) {
	const absolutePath = path.resolve(filePath);
	if (!isOriginalImage(absolutePath)) return;

	const resizedPath = toResizedPath(absolutePath);
	if (!(await fileExists(resizedPath))) return;

	await fs.unlink(absolutePath);
	console.log(
		`[images] removed original ${path.relative(process.cwd(), absolutePath)}`
	);
}

async function walk(directory) {
	let entries;
	try {
		entries = await fs.readdir(directory, { withFileTypes: true });
	} catch (error) {
		if (error.code === "ENOENT") return;
		throw error;
	}

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name)) continue;
			await walk(fullPath);
			continue;
		}

		if (entry.isFile()) {
			await processFile(fullPath);
		}
	}
}

async function runOnce() {
	for (const root of ROOTS) {
		const rootPath = path.join(process.cwd(), root);
		await walk(rootPath);
	}
}

runOnce().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
