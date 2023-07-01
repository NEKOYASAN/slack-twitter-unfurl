export interface SlackEvent {
	token: string;
	type: 'event_callback' | 'url_verification';
}

export interface UrlVerificationEvent extends SlackEvent {
	type: 'url_verification';
	challenge: string;
}

export const isUrlVerificationEvent = (json: SlackEvent): json is UrlVerificationEvent => {
	return json.type === 'url_verification';
};

export interface LinkSharedEvent extends SlackEvent {
	type: 'event_callback';
	event: {
		channel: string;
		message_ts: string;
		links: {
			domain: string;
			url: string;
		}[];
	};
}

export const isLinkSharedEvent = (json: SlackEvent): json is LinkSharedEvent => {
	return json.type === 'event_callback';
};
