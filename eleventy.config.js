import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import fs from "fs";
import path from "path";

import pluginFilters from "./_config/filters.js";
import { getTalePermalink } from "./_config/urlSlug.js";
import getMetadata from "./_data/metadata.js";
import { createI18n } from "./_data/i18n.js";

// Key: absolute directory path  ->  Value: { lt?: url, en?: url }
const translationMap = new Map();

function parseSimpleFrontmatter(fileContent) {
	const match = fileContent.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
	if(!match) {
		return {};
	}

	const result = {};
	for(const line of match[1].split(/[\r\n]+/)) {
		const parsed = line.match(/^(\w+):\s*(.*)$/);
		if(parsed) {
			result[parsed[1]] = parsed[2].trim().replace(/^['"]|['"]$/g, "");
		}
	}

	return result;
}

function talesUrlFromFrontmatter(frontmatter, fileSlug) {
	return getTalePermalink({
		title: frontmatter.title,
		date: frontmatter.date,
		fallbackSlug: fileSlug || "post",
	});
}

function computeTranslatedUrl(inputDir, filePath, subdir, lang) {
	const relativePath = path.relative(inputDir, filePath).replace(/\\/g, "/");

	if(subdir === "tales") {
		const fileContent = fs.readFileSync(filePath, "utf8");
		const frontmatter = parseSimpleFrontmatter(fileContent);
		return talesUrlFromFrontmatter(frontmatter, `index.${lang}`);
	}

	if(subdir === "diary") {
		return `/${relativePath.replace(/\/index\.[^./]+\.md$/, "/")}`;
	}

	// maps keep /index.{lang}/ in current permalink structure
	return `/${relativePath.replace(/\.md$/, "/")}`;
}

function buildTranslationMap(inputDir) {
	translationMap.clear();

	for(const subdir of ["tales", "diary", "maps"]) {
		const subdirPath = path.join(inputDir, subdir);
		if(!fs.existsSync(subdirPath)) {
			continue;
		}

		for(const entry of fs.readdirSync(subdirPath, { withFileTypes: true })) {
			if(!entry.isDirectory()) {
				continue;
			}

			const dirPath = path.join(subdirPath, entry.name);
			const urls = {};

			for(const lang of ["lt", "en"]) {
				const filePath = path.join(dirPath, `index.${lang}.md`);
				if(!fs.existsSync(filePath)) {
					continue;
				}

				urls[lang] = computeTranslatedUrl(inputDir, filePath, subdir, lang);
			}

			if(Object.keys(urls).length > 0) {
				translationMap.set(dirPath, urls);
			}
		}
	}
}

const defaultLang = "lt";
const supportedLangs = new Set(["lt", "en"]);
const envLang = process.env.ELEVENTY_LANG;
const buildLang = supportedLangs.has(envLang) ? envLang : defaultLang;
const i18n = createI18n(buildLang);
const siteMetadata = getMetadata();

export default async function(eleventyConfig) {
	eleventyConfig.addNunjucksGlobal("t", (key, vars) => i18n.t(key, vars));

	// Build translation URL mapping before each build/watch pass.
	eleventyConfig.on("eleventy.before", ({ directories } = {}) => {
		const rawInputDir = directories?.input || "content";
		const inputDir = path.isAbsolute(rawInputDir)
			? rawInputDir
			: path.resolve(process.cwd(), rawInputDir);
		buildTranslationMap(inputDir);
	});

	// Drafts/todos, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		const isDraft = data.draft || data.todo;
		const inputPath = data.page?.inputPath || "";

		if(data.lang && data.lang !== buildLang) {
			data.eleventyExcludeFromCollections = true;
			return false;
		}

		if(/\/content\/(tales|diary|maps)\//.test(inputPath)) {
			const basename = path.basename(inputPath);
			if(/^index\.(lt|en)\.md$/.test(basename)) {
				const absoluteInputPath = path.resolve(process.cwd(), inputPath);
				const dirPath = path.dirname(absoluteInputPath);
				const otherLanguage = buildLang === "lt" ? "en" : "lt";
				const urls = translationMap.get(dirPath);

				if(urls && urls[otherLanguage]) {
					data.translationUrl = urls[otherLanguage];
				}
			}
		}

		if(isDraft && process.env.ELEVENTY_RUN_MODE === "build") {
			data.eleventyExcludeFromCollections = true;
			return false;
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/"
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Adds the {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "RSS",
				order: 6
			}
		},
		collection: {
			name: i18n.t("feed.collectionName"),
			limit: 10,
		},
		metadata: {
			language: siteMetadata.language,
			title: siteMetadata.title,
			subtitle: siteMetadata.subtitle,
			base: siteMetadata.url,
			author: siteMetadata.author
		}
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		widths: [480, 960, 1920],
		htmlOptions: {
			imgAttributes: {
				sizes: "(max-width: 62em) 100vw, 960px",
				loading: "lazy",
				decoding: "async",
			},
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	const isInContentSubdir = (item, subdir) => {
		return typeof item.inputPath === "string" && item.inputPath.startsWith(`./content/${subdir}/`);
	};

	const sortByDate = (items, newestFirst = true) => {
		return [...items].sort((a, b) => {
			const dateA = a.data?.date ? new Date(a.data.date).getTime() : 0;
			const dateB = b.data?.date ? new Date(b.data.date).getTime() : 0;
			return newestFirst ? dateB - dateA : dateA - dateB;
		});
	};

	// Sort oldest-first so that postslist.njk's | reverse displays newest first
	const sortOldestFirst = (items) => sortByDate(items, false);

	eleventyConfig.addCollection("tales", (collectionApi) => {
		return sortOldestFirst(
			collectionApi.getAll().filter((item) => isInContentSubdir(item, "tales"))
		);
	});

	eleventyConfig.addCollection("diaryEntries", (collectionApi) => {
		return sortOldestFirst(
			collectionApi.getAll().filter((item) => isInContentSubdir(item, "diary"))
		);
	});

	eleventyConfig.addCollection("maps", (collectionApi) => {
		return sortOldestFirst(
			collectionApi.getAll().filter((item) => isInContentSubdir(item, "maps"))
		);
	});

	eleventyConfig.addCollection("allEntries", (collectionApi) => {
		const diaryItems = collectionApi.getAll().filter((item) => isInContentSubdir(item, "diary"));
		const taleItems = collectionApi.getAll().filter((item) => isInContentSubdir(item, "tales"));
		const mapItems = collectionApi.getAll().filter((item) => isInContentSubdir(item, "maps"));
		return sortOldestFirst([...diaryItems, ...taleItems, ...mapItems]);
	});

	eleventyConfig.addCollection("tagList", (collectionApi) => {
		const tagSet = new Set();
		collectionApi.getAll().forEach((item) => {
			if(!isInContentSubdir(item, "tales") && !isInContentSubdir(item, "diary") && !isInContentSubdir(item, "maps")) {
				return;
			}
			(item.data.tags || []).forEach((tag) => {
				if(tag === "all" || tag === "posts") {
					return;
				}
				tagSet.add(tag);
			});
		});
		return Array.from(tagSet).sort();
	});

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: process.env.ELEVENTY_OUTPUT_DIR || "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
