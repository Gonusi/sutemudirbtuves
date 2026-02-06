---js
const eleventyNavigation = {
	key: "subscribe",
	order: 5,
	title: "nav.subscribe"
};

const title = "Subscribe";
const lang = "en";
const permalink = "/subscribe/";
const includeMailerLite = true;
---
# {{ title }}

Subscribe to get updates about new tales and maps (not the diary).

I only send an email when a new tale or a new map appears, but never more often than weekly. 

You can unsubscribe at any time. Also, I'm actually a human - a rare trait on the web these days, so you can always write me back at [sutemu.dirbtuves@gmail.com](mailto:sutemu.dirbtuves@gmail.com).

{% include "subscribe-form.njk" %}
