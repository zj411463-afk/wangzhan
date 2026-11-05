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

The MP3 splitter uses the same dataset and endpoint but a separate fixed namespace:
`splitter_page_open`, `splitter_file_ready`, `splitter_preview_started`, and
`splitter_download_started`. Here file_ready means its frame index is ready;
preview_started follows playback of an actual exported part. Downloads include
individual parts and ZIP, deduplicated together per page. Original cutter event
names are unchanged; filter by the exact original names to retain that funnel.
The endpoint still accepts only one event-name field, no filenames or other data.
HTTP fixture tests send no production events.

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
