# AI Safety publishing runbook

This is the existing edition workflow, not a new schedule. The GitHub Actions publication gate validates content and observes the public result; it does **not** research, generate or publish an edition. A successful scheduled validator does not prove a future content-publishing run will succeed. Main-branch publication pushes also run the gate, which waits and retries while GitHub Pages updates, then checks the actual public HTML and feed. This does not depend on a separate Pages completion event.

## Prepare one canonical edition

1. Recover the previous verified edition and the approved versioned methodology. Preserve its JSON, static HTML and assets under a dated archive before replacement. Archived HTML must not use a base URL that redirects same-document fragments to the current edition. Use explicit relative asset paths and retain local fragments. Archived HTML must not fetch `data/latest.json` or run the current edition loader. Keep a rollback commit/reference.
2. Review dated evidence, source independence, claim-to-source mapping, quotes, uncertainties and all required outputs. Do not invent missing news, indices, source links or incident ratings. If the numerical methodology is unavailable, use explicitly unscored qualitative assessments. Keep the five leading cards distinct from the pending six-tier taxonomy migration.
3. Update `ai-safety/data/latest.json` as the canonical object. Include roboticsAssessment, humanAgencyTracker, source IDs, report sourceIds, voices/incidents, investigativeSummary and methodology disclosure. Record manifest status honestly for each destination. A recovery edition retains `scheduledFor` separately from its **actual** Australia/Adelaide publication date. Never backdate a missed publication. Confirm the final timestamp immediately before release.
4. Update the supported HTML template when new fields/sections are required. Remove obsolete optional bindings rather than silently retaining previous text. Every field used by a binding must exist. Maintain logo, navigation, accessibility and historical assets. Current decorative art must not contain old scores or dates.

## Synchronise and validate

From repository root:

    node scripts/sync-ai-safety.mjs
    node --test tests/ai-safety-publication.test.mjs
    node scripts/verify-ai-safety.mjs local

Equivalent focused check: `npm run test:ai-safety`.

The sync script updates bound static text, source row count, structured dates/headline, editorial sections, citations, robotics and agency panels. It does not verify sources, infer content, or fix arbitrary unbound template copy. Review the entire diff and all visible statements. Inspect primary metadata, styles, source imagery and archive links.

Also run the repository's applicable full build/test/lint commands when the complete checkout and dependencies are available. Record separately any checks blocked by environment limitations. Do not relabel a partial focused pass as a full build pass.

Use the supported browser tool to inspect desktop and mobile layouts, keyboard/focus paths, card anchors, source links, panels, absent active threat tier for unscored editions, image integrity, repeated rendering and the frozen archive. Test no-JavaScript fallback where supported. Do not claim accessibility conformance from unit tests alone.

## Publish only through the existing authorised destinations

Use a staging/development branch and review before the normal authorised GitHub/public-route release and existing Sites mirror. Confirm authorisation for each external write; this runbook itself grants no permission. Do not introduce another publishing schedule or duplicate issue workflow.

Verify the expected remote commit and deployment, then run:

    node scripts/verify-ai-safety.mjs public

The command uses `public`, not `--public`. It checks the expected Monday/Thursday06:00 Adelaide freshness without rolling forward old dates, the **actual remote HTML**, and equality of the **entire remote feed** with the approved local feed. It also checks metadata, bound fields, source rows, report citations and rendered editorial/assessment blocks.

For the verified mirror's actual URL, using the same canonical checkout:

    AI_SAFETY_PUBLIC_URL='https://VERIFIED-MIRROR-URL/' node scripts/verify-ai-safety.mjs public

Replace the example with the confirmed existing mirror URL. Mirror layout must expose `data/latest.json` relative to its root. Do not invent a URL or treat a preview as production. Both HTML and feed must represent the same edition, manifest and methodology status. Check rendered production results and assets on both destinations separately.

## Report, recover and continue

Only report full publication after primary and mirror are independently verified. Distinguish research, visual assets, primary publication, mirror publication and scheduled-workflow verification statuses. A Git push, local test, preview or successful validator alone is not complete publication.

On failure preserve the last verified edition and record the exact action, destination, error, known outcome, completed steps and next required check. Do not blindly retry an uncertain write or bypass a denial. Roll back through the normal authorised path if the new release is broken and restoration is permitted. Reverify after any change. A current missing-edition alert may close after the live page and feed are verified. Do not claim future scheduled content publishing is repaired until the actual subsequent content-publishing run succeeds.

## Durable handoff and independent receipts

Before ending a research run, save a portable release outside the checkout:

    node scripts/prepare-ai-safety-release.mjs /tmp/edition-N-release

The output directory must not already exist. It includes the exact validated `site/`
payload (including frozen archives/assets) and a SHA-256 inventory manifest. Save
this release as a retrievable artifact and record its identity in the run result;
a chat response alone is not a durable publishing handoff. A dirty-source flag
must be reconciled to the final pushed commit before release. This preparation
command does not research, approve, upload, push or deploy anything.

Publish `site/` unchanged to the existing GitHub `/ai-safety/` route and the
existing Sites mirror root. Preserve each platform's own hosting configuration.
On an interrupted run, recover the artifact, compare the inventory and current
remote state, and continue only the missing destination. Never regenerate or
renumber an edition just because one destination failed. Preserve the previous
verified release until the replacement passes local validation.

After deployments, run the independent two-destination check:

    AI_SAFETY_MIRROR_URL='https://dop-ai-safety-observatory.sammielee.chatgpt.site/' \
    AI_SAFETY_RECEIPT_PATH=/tmp/edition-N-receipt.json \
    node scripts/verify-ai-safety-destinations.mjs

This checks each destination even when the other fails. The receipt records
separate results tied to the canonical feed hash. CI retains the receipt and
must not close the missing-edition alert until **both** pass. A 403/timeout means
verification failed, not proof the site is down. Do not add private bypass tokens
to public CI or equate an authenticated read with public visitor acceptance.

### Remaining automation boundary

GitHub's existing workflow is a validator, not a content publisher. Sites mirror
publication currently requires its supported authenticated save/deploy flow;
no unattended CI publisher credential/API has been established here. The scheduled
research executor must possess the publishing tools, persist the handoff artifact,
publish both destinations, retain each deployment result, and deliver any exact
blocker. This bundle and receipt tooling reduce loss and false-success reporting,
but do not prove that the next unattended research-to-publication run will succeed.
Do not call the permanent repair complete until that actual scheduled run succeeds.
