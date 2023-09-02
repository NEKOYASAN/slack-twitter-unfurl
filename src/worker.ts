import {
	isLinkSharedEvent,
	isUrlVerificationEvent,
	LinkSharedEvent,
	SlackEvent,
} from './slackTypeGuard';
import { LinkUnfurls } from '@slack/types';
import { generateAPIUrl, isTwitterSyndicationAPIJsonResponse } from './twitterHelper';
import dayjs from 'dayjs';

export interface Env {
	readonly SLACK_BOT_TWITTER_UNFURL_TOKEN: string;
	readonly SLACK_TWITTER_UNFURL_QUEUE: Queue<LinkSharedEvent>;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== 'POST' || request.headers.get('content-type') !== 'application/json') {
			return new Response('Method Not Allowed', {
				status: 405,
			});
		}
		const json: SlackEvent = await request.json();
		if (!json) {
			return new Response('Bad Request', {
				status: 400,
			});
		}
		// SlackのUrl Verificationに対するレスポンス定義
		if (isUrlVerificationEvent(json)) {
			return new Response(json.challenge, {
				status: 200,
				headers: {
					'Content-Type': 'text/plain',
				},
			});
		}
		// LinkSharedEventに対して、Queueに格納した後レスポンス
		if (isLinkSharedEvent(json)) {
			await env.SLACK_TWITTER_UNFURL_QUEUE.send(json);
			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
			});
		}
		return new Response('Not Found', {
			status: 404,
		});
	},
	async queue(batch: MessageBatch<LinkSharedEvent>, env: Env): Promise<void> {
		for (const message of batch.messages) {
			if (!message.body.event.links.length) {
				continue;
			}
			const unfurlsProcessingPromiseArray: Promise<
				| ({
						link: string;
				  } & LinkUnfurls[keyof LinkUnfurls])
				| null
			>[] = message.body.event.links.map(async (link) => {
				// tweetId取り出し
				const tweetIdMatch = link.url.match(/\/status\/(?<tweetid>\d+)/i);
				if (tweetIdMatch && tweetIdMatch.groups && tweetIdMatch.groups.tweetid) {
					// apiUrlの作成
					const apiUrl = generateAPIUrl(tweetIdMatch.groups.tweetid);
					const response = await fetch(apiUrl, {
						headers: {
							'Content-Type': 'application/json',
							'User-Agent':
								'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
						},
						method: 'GET',
					});
					const responseJson = await response.json();
					// responseに対して型ガード
					if (isTwitterSyndicationAPIJsonResponse(responseJson)) {
						const { data } = responseJson;
						return {
							link: link.url,
							color: '#8c8c8c',
							author_icon: data.user.profile_image_url_https,
							author_name: `${data.user.name} @${data.user.screen_name}`,
							author_link: `https://twitter.com/i/user/${data.user.id_str}`,
							text: data.text,
							footer_icon: 'https://a.slack-edge.com/bv1-10/twitter_pixel_snapped_32-620d73c.png',
							footer: 'Twitter',
							ts: `${dayjs(data.created_at).unix()}`,
							...(data.mediaDetails &&
							data.mediaDetails[0] &&
							data.mediaDetails[0].media_url_https
								? { image_url: data.mediaDetails[0].media_url_https }
								: {}),
						};
					}
				}
				return null;
			});
			// Promise Allで待機
			const unfurlsProcessingArray = await Promise.all(unfurlsProcessingPromiseArray);
			const unfurls: LinkUnfurls = {};
			unfurlsProcessingArray
				.filter(
					(
						value
					): value is {
						link: string;
					} & LinkUnfurls[keyof LinkUnfurls] => {
						return !!value;
					}
				)
				.forEach(({ link, ...unfurl }) => {
					unfurls[link] = unfurl;
				});
			const body: {
				channel: string;
				ts: string;
				unfurls: LinkUnfurls;
			} = {
				channel: message.body.event.channel,
				ts: message.body.event.message_ts,
				unfurls,
			};
			// Slackに対して返答
			await fetch('https://slack.com/api/chat.unfurl', {
				headers: {
					Authorization: `Bearer ${env.SLACK_BOT_TWITTER_UNFURL_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				method: 'POST',
			});
		}
	},
};
