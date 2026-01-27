export default {
	tags: [
		"posts"
	],
	"layout": "layouts/post.njk",
	permalink: (data) => {
		const title = typeof data.title === "string" && data.title.trim().length > 0
			? data.title.trim()
			: data.page?.fileSlug;
		const slugTitle = title ? title.replace(/\s+/g, "-").toLowerCase() : title;
		const sourceDate = data.date;
		const date = sourceDate instanceof Date
			? sourceDate.toISOString().slice(0, 10)
			: typeof sourceDate === "string"
				? sourceDate.split("T")[0]
				: "";

		if(!slugTitle || !date) {
			return `/${slugTitle || "post"}/`;
		}

		return `/${slugTitle}_${date}/`;
	},
};
