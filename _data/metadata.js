import { createI18n } from "./i18n.js";

export default function() {
	const i18n = createI18n(process.env.ELEVENTY_LANG || "lt");
	return {
		title: i18n.t("meta.title"),
		url: "https://sutemudirbtuves.lt/",
		language: i18n.lang,
		description: i18n.t("meta.description"),
		subtitle: i18n.t("meta.subtitle"),
		author: {
			name: "Kasparas Anusauskas",
			email: "kasparasanusauskas@gmail.com",
			url: "https://sutemudirbtuves.lt/apie"
		}
	};
}
