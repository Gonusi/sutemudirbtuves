---js
const eleventyNavigation = {
	key: "subscribe",
	order: 5,
	title: "nav.subscribe"
};

const title = "Prenumerata";
const lang = "lt";
const permalink = "/subscribe/";
const includeMailerLite = true;
---
# {{ title }}

Užsiprenumeruokite pasakų ir žemėlapių naujienas. Šiukšlių nesiųsiu, tik trumpą ištrauką tada, kai atsiranda nauja pasaka ar žemėlapis. Ne dažniau, nei kas savaitę. 

Prenumeratos bet kada galite atsisakyti. Be to, esu žmogus (o internete tai darosi reta). Visada galite man parašyti atgal - [sutemu.dirbtuves@gmail.com](mailto:sutemu.dirbtuves@gmail.com). 

{% include "subscribe-form.njk" %}
