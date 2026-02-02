#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const today = new Date();
const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

const type = process.argv[2];
const slug = process.argv[3] || "new-entry";

const roots = {
	tale: "content/tales",
	diary: "content/diary",
	map: "content/maps",
};

const availableTypes = Object.keys(roots);

function printUsage() {
	console.error("Usage: node scripts/new-content.cjs <tale|diary|map> [slug]");
	console.error(`Available types: ${availableTypes.join(", ")}`);
}

if (!type || !roots[type]) {
	printUsage();
	process.exit(1);
}

const tagByType = {
	tale: "tale",
	diary: "diary",
	map: "map",
};

const frontmatter = (lang) => `---
title:
description:
date: ${dateStr}
tags: ['${tagByType[type]}']
thumb:
draft: true
lang: '${lang}'
---
`;

const root = roots[type];
const dir = path.join(process.cwd(), root, slug);
const enPath = path.join(dir, "index.en.md");
const ltPath = path.join(dir, "index.lt.md");

if (fs.existsSync(enPath) || fs.existsSync(ltPath)) {
	console.error(`Entry already exists: ${dir}`);
	process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(enPath, frontmatter("en"), "utf8");
fs.writeFileSync(ltPath, frontmatter("lt"), "utf8");

console.log(`Created ${type} entry: ${path.relative(process.cwd(), dir)}`);
