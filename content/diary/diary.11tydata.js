export default {
	layout: "layouts/post.njk",
	permalink: (data) => {
		const stem = data.page?.filePathStem || "";
		const cleaned = stem.replace(/\/index(\.[^/]+)?$/, "/");
		return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
	},
};
