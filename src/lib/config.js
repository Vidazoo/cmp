import log from './log';

const defaultConfig = {
	customPurposeListLocation: './purposes.json',
	globalVendorListLocation: 'https://vendorlist.consensu.org/vendorlist.json',
	globalConsentLocation: './portal.html',
	storeConsentGlobally: false,
	storePublisherData: false,
	logging: false,
	localization: {},
	forceLocale: null,
	gdprApplies: true,
	allowedVendorIds: null,
	theme: {},
	bannerMessage: `We use cookies to collect and analyse information on site performance and usage, and to
								enhance and customise content and advertisements. By Clicking "OK" or by clicking into
								any content on this site, you agree to allow cookies to be placed. To find out more or
								to change your cookie settings, visit the cookies section of our privacy policy.`,
};

class Config {
	constructor() {
		this.update(defaultConfig);
	}

	update = (updates) => {
		if (updates && typeof updates === 'object') {
			const validKeys = Object.keys(defaultConfig);
			const { validUpdates, invalidKeys } = Object.keys(updates).reduce((acc, key) => {
				if (validKeys.indexOf(key) > -1) {
					acc.validUpdates = {
						...acc.validUpdates,
						[key]: updates[key]
					};
				}
				else {
					acc.invalidKeys.push(key);
				}
				return acc;
			}, { validUpdates: {}, invalidKeys: [] });

			Object.assign(this, validUpdates);
			if (invalidKeys.length) {
				log.warn(`Invalid CMP config values not applied: ${invalidKeys.join(', ')}`);
			}

		}
	};
}

export default new Config();
