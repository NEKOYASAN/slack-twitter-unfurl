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

const SYNDICATION_URL = 'https://react-tweet.vercel.app';

// Original: https://github.com/vercel-labs/react-tweet/blob/main/packages/react-tweet/src/api/get-tweet.ts#L38-L58
export const generateAPIUrl = (id: string): string => {
	return `${SYNDICATION_URL}/api/tweet/${id}`;
};
