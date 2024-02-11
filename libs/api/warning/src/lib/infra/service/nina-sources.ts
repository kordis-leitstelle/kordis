// this is for easier testing and for possible future dynamic sources
export const NINA_SOURCES_TOKEN = Symbol('NINA_SOURCES');
export const NINA_SOURCES = Object.freeze([
	'https://nina.api.proxy.bund.dev/api31/katwarn/mapData.json',
	'https://nina.api.proxy.bund.dev/api31/biwapp/mapData.json',
	'https://nina.api.proxy.bund.dev/api31/mowas/mapData.json',
	'https://nina.api.proxy.bund.dev/api31/dwd/mapData.json',
	'https://nina.api.proxy.bund.dev/api31/lhp/mapData.json',
	'https://nina.api.proxy.bund.dev/api31/police/mapData.json',
]);
