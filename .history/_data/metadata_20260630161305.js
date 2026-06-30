import { createI18n } from "./i18n.js";

const siteUrls = {
	lt: "https://sutemudirbtuves.lt",
	en: "https://twilightworkshop.com",
};

export default function() {
	const i18n = createI18n(process.env.ELEVENTY_LANG || "lt");
	const lang = i18n.lang;
	const otherLanguage = lang === "lt" ? "en" : "lt";
	return {
		title: i18n.t("meta.title"),
		url: `${siteUrls[lang]}/`,
		language: lang,
		otherLanguage,
		siteUrls,
		description: i18n.t("meta.description"),
		subtitle: i18n.t("meta.subtitle"),
		author: {
			name: "Kasparas Anusauskas",
			email: "kasparasanusauskas@gmail.com",
			url: `${siteUrls[lang]}/about`
		}
	};
}
