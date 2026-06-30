import { getTalePermalink } from "../../_config/urlSlug.js";

export default {
	"layout": "layouts/post.njk",
	lang: "lt",
	permalink: (data) => {
		return getTalePermalink({
			title: data.title,
			date: data.date,
			fallbackSlug: data.page?.fileSlug || "post",
		});
	},
};
