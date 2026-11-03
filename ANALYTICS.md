# Anonymous audio-cutter funnel

The homepage records four event counts in Cloudflare Analytics Engine dataset
`sonic_cutter_funnel`:

| Event | Meaning |
| --- | --- |
| `page_open` | Homepage JavaScript ran |
| `file_ready` | An audio file decoded and the editor became ready |
| `preview_started` | Playback of the selected range started |
| `download_started` | Browser download was triggered; saving to disk cannot be verified |

Each event is sent at most once per page load. There is no user ID, cookie,
filename, audio content, selected time range, or file size in the event body or
dataset. These are action counts, not unique people or a user-level cohort.
Local `file://` previews do not send events. If the Analytics Engine binding is
unavailable, the editor still works but the event is not recorded.

Before the first deployment, enable Analytics Engine for the Cloudflare account
in Workers & Pages > Analytics Engine. The Pages deployment will fail with
`You need to enable Analytics Engine` until this account-level switch is on.
After enabling it, rerun the failed GitHub Actions deployment; the dataset is
created automatically on the first recorded event.

To inspect the last seven days, query the dataset with a Cloudflare API token
that has Account Analytics Read permission:

```sql
SELECT blob1 AS event, SUM(_sample_interval) AS count
FROM sonic_cutter_funnel
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY event
ORDER BY event
```

See the [Cloudflare Analytics Engine SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)
for query setup. Do not put the read token in this repository or browser code.
