export const prerender = true
export const ssr = false

import { PUBLIC_MIXPANEL_TOKEN } from "$env/static/public";
import mixpanel from "mixpanel-browser";

mixpanel.init(PUBLIC_MIXPANEL_TOKEN, {
    // debug: true,
    track_pageview: true,
    ignore_dnt: true,
    disable_persistence: true,
    disable_cookie: true,
    property_blacklist: ["$ip"]
})