export interface TwitterSyndicateAPIUser {
	id_str: string;
	name: string;
	profile_image_url_https: string;
	screen_name: string;
	verified: boolean;
	is_blue_verified: boolean;
	profile_image_shape: string;
}

export interface TwitterSyndicateAPIMediaDetail {
	media_url_https: string;
	type: string;
	[key: string]: any;
}

export interface TwitterSyndicationAPIJsonResponse {
	id_str: string;
	text: string;
	created_at: string;
	user: TwitterSyndicateAPIUser;
	mediaDetails: TwitterSyndicateAPIMediaDetail[];
}

export const isTwitterSyndicationAPIJsonResponse = (
	responseJson: unknown
): responseJson is TwitterSyndicationAPIJsonResponse => {
	return (
		!!responseJson &&
		typeof responseJson === 'object' &&
		!!(responseJson as TwitterSyndicationAPIJsonResponse).text &&
		!!(responseJson as TwitterSyndicationAPIJsonResponse).user &&
		!!(responseJson as TwitterSyndicationAPIJsonResponse).id_str
	);
};

const SYNDICATION_URL = 'https://cdn.syndication.twimg.com';

// Original: https://github.com/vercel-labs/react-tweet/blob/main/packages/react-tweet/src/api/get-tweet.ts#L38-L58
export const generateAPIUrl = (id: string): string => {
	const url = new URL(`${SYNDICATION_URL}/tweet-result`);

	url.searchParams.set('id', id);
	url.searchParams.set('lang', 'ja');
	url.searchParams.set(
		'features',
		[
			'tfw_timeline_list:',
			'tfw_follower_count_sunset:true',
			'tfw_tweet_edit_backend:on',
			'tfw_refsrc_session:on',
			'tfw_show_business_verified_badge:on',
			'tfw_duplicate_scribes_to_settings:on',
			'tfw_show_blue_verified_badge:on',
			'tfw_legacy_timeline_sunset:true',
			'tfw_show_gov_verified_badge:on',
			'tfw_show_business_affiliate_badge:on',
			'tfw_tweet_edit_frontend:on',
		].join(';')
	);
	return url.toString();
};
