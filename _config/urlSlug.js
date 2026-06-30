function normalizeDatePart(value) {
	if(value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}

	if(typeof value === "string" && value.trim().length > 0) {
		return value.split("T")[0];
	}

	return "";
}

function normalizeSlugSegment(value, fallback = "post") {
	const base = typeof value === "string" && value.trim().length > 0 ? value : fallback;
	const slug = base
		.normalize("NFKC")
		.toLowerCase()
		.replace(/['’`]/g, "")
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");

	return slug || fallback;
}

export function getTalePermalink({ title, date, fallbackSlug = "post" }) {
	const slugTitle = normalizeSlugSegment(title, fallbackSlug);
	const datePart = normalizeDatePart(date);

	if(!datePart) {
		return `/${slugTitle}/`;
	}

	return `/${slugTitle}_${datePart}/`;
}
