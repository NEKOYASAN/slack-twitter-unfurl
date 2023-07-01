# slack-twitter-unfurl

## Why?
Since Twitter no longer offers OGP and we can't see tweets when not logged in.
So, use the Twitter API to expand the link on slack.

## How to Use
1. Create a slack app
   1. Create a slack app
   2. Add the event subscriptions
      1. Open `Event Subscriptions` page (in side navigation)
      2. Change Enable Events to On
      3. Subscribe to bot events
         - `link_shared`
      4. App unfurl domains
				 - `twitter.com`
   3. Add the OAuth scopes
      1. Open `OAuth & Permissions` page (in side navigation)
      2. Add the Bot Token Scopes (in Scopes Section)
        - `links:read`
        - `links:write`
        - `links.embed:write`
   4. Install app to workspace
      1. Open `Install App` page (in side navigation)
      2. Click `Install to Workspace` button
      3. Click `Allow` button
      4. Copy `Bot User OAuth Access Token`
2. Deploy this app
	 1. Clone this repository
   2. Create Queues
      1. Create a queue named `slack-twitter-unfurl`
         ```shell
         $ wrangler queues create slack-twitter-unfurl
         ```
   3. Set the Secret Variables
      1. Set the Secret Variables
         ```shell
         $ wrangler secret put SLACK_BOT_TWITTER_UNFURL_TOKEN
         ```
         - `SLACK_BOT_TWITTER_UNFURL_TOKEN`: Bot User OAuth Access Token (in 1.4.4)
	 4. Deploy
      ```shell
			$ wrangler publish
      ```
