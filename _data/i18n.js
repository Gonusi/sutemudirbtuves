const messages = {
	lt: {
		meta: {
			title: "Sutemų Dirbtuvės",
			description: "Vakaras geriausias su pasaka. O ypač - apie mūsų kraštą, kur giliuose upelių slėniuose siaučia Pinčiukai, raganos ir paslaptingi žvėrys. O dar ir Žiurkėdra!",
			subtitle: "Pasakos vaikams, ir nevaikams. Apie mūsų kraštą, o kartais - ir tolimus kraštus."
		},
		nav: {
			home: "Pasakos",
			tales: "Pasakos",
			maps: "Žemėlapiai",
			diary: "Dienoraštis",
			archive: "Archyvas",
			about: "Apie",
			subscribe: "Prenumerata"
		},
		home: {
			title: "Naujos pasakos",
			archiveLink: "archyve",
			morePosts: {
				one: "Dar {count} pasaka yra {archiveLink}.",
				few: "Dar {count} pasakos yra {archiveLink}.",
				many: "Dar {count} pasakų yra {archiveLink}.",
				other: "Dar {count} pasakų yra {archiveLink}."
			}
		},
		archive: {
			title: "Archyvas"
		},
		tales: {
			title: "Pasakos"
		},
		maps: {
			title: "Žemėlapiai",
			intro: "Čia bus pasakų žemėlapiai."
		},
		diary: {
			title: "Dienoraštis",
			intro: "Čia bus dienoraščio įrašai."
		},
		tags: {
			title: "Žymos",
			taggedTitle: "Žyma „{tag}“",
			allTagsLink: "visas žymas",
			viewAll: "Peržiūrėkite {allTagsLink}."
		},
		post: {
			previous: "Ankstesnė",
			next: "Kita"
		},
		a11y: {
			skip: "Pereiti prie turinio",
			nav: "Pagrindinis navigacijos meniu"
		},
		footer: {
			copyright: "Kasparo Anusausko pasakos ©."
		},
		feed: {
			collectionName: "įrašai"
		}
	},
	en: {
		meta: {
			title: "Twilight Workshop",
			description: "Evenings are best spent with a tale — about deep valleys ravaged by hidden streams, witches, trolls and mysterious beasts. And Ratsnack!",
			subtitle: "Tales from Lithuania, for children and those who are ...mostly grown up."
		},
		nav: {
			home: "Tales",
			tales: "Tales",
			maps: "Maps",
			diary: "Diary",
			archive: "Archive",
			about: "About",
			subscribe: "Subscribe"
		},
		home: {
			title: "New tales",
			archiveLink: "the archive",
			morePosts: {
				one: "{count} more post can be found in {archiveLink}.",
				other: "{count} more posts can be found in {archiveLink}."
			}
		},
		archive: {
			title: "Archive"
		},
		tales: {
			title: "Tales"
		},
		maps: {
			title: "Maps",
			intro: "Tale maps will live here."
		},
		diary: {
			title: "Diary",
			intro: "Diary entries will live here."
		},
		tags: {
			title: "Tags",
			taggedTitle: "Tagged “{tag}”",
			allTagsLink: "all tags",
			viewAll: "Browse {allTagsLink}."
		},
		post: {
			previous: "Previous",
			next: "Next"
		},
		a11y: {
			skip: "Skip to main content",
			nav: "Top level navigation menu"
		},
		footer: {
			copyright: "Tales by Kasparas Anusauskas ©. (AKA /u/rat_at_twilight)"
		},
		feed: {
			collectionName: "posts"
		}
	}
};

const defaultLang = "lt";

const getMessage = (langMessages, key) => {
	if(!langMessages) {
		return null;
	}
	return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), langMessages);
};

const format = (template, vars) => {
	if(typeof template !== "string") {
		return template;
	}
	return template.replace(/\{(\w+)\}/g, (match, key) => {
		if(vars && Object.prototype.hasOwnProperty.call(vars, key)) {
			return String(vars[key]);
		}
		return match;
	});
};

const resolveMessage = (lang, key, vars) => {
	const langMessages = messages[lang] || messages[defaultLang];
	const message = getMessage(langMessages, key);
	if(message && typeof message === "object") {
		if(vars && typeof vars.count === "number") {
			const rule = new Intl.PluralRules(lang).select(vars.count);
			const pluralMessage = message[rule] || message.other || message.one || message.few || message.many;
			return format(pluralMessage, vars);
		}
		const fallbackMessage = message.other || message.one || message.few || message.many;
		return format(fallbackMessage || key, vars);
	}
	return format(message || key, vars);
};

const createI18n = (lang) => {
	const resolvedLang = messages[lang] ? lang : defaultLang;
	return {
		lang: resolvedLang,
		messages,
		t: (key, vars) => resolveMessage(resolvedLang, key, vars),
	};
};

export default function() {
	const lang = process.env.ELEVENTY_LANG || defaultLang;
	return createI18n(lang);
}

export { createI18n };
