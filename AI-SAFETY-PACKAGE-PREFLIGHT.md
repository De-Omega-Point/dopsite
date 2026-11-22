# AI Safety package preflight

Run existing renderer/synchronisation checks first: `npm run test:ai-safety`. Then run `node scripts/check-ai-safety-package.mjs /path/to/manifest.json` for the editorial packet before deploying. Never report publication from a local pass.

The manifest object has numeric `edition`, relative `feed` pointing at the approved canonical JSON, `review: {"editorial":"passed","visualBrand":"passed"}` (set only after editorial and approved brand/visual inspection), and `artifacts` objects containing `role`, relative `file`, and exact lowercase `sha256`. Required roles: `report`, `linkedinArticle`, `banner`, `infographic`, and exactly one of `whitePaper` or `researchContinuity`. Add `podcastSynthesis` only for a Thursday edition. The approved feed must contain a zoned `edition.scheduledFor`; the required roles use its Adelaide calendar day, not the publication or executor day. Banner and infographic are distinct PNG files. Visually inspect them; a PNG header does not guarantee visual quality. Record the actual package delivery in Chat separately.

After authorised deployment, run the same command with `--verify-live`. It checks each destination's independent HTTPS HTML/date and full JSON against the approved feed, emitting an endpoint receipt only when both pass. Run the existing rendered-page verifier too; basic receipt HTML is not the full renderer or browser check. Preserve the returned receipts along with the platform deployment IDs and Chat delivery evidence. An older successful deployment, a completed research run or the mere existence of a branch is not successful publication.

## Operator commands

```sh
npm run test:ai-safety-package
npm run test:ai-safety
npm run preflight:ai-safety-package -- /path/to/manifest.json
# After authorised deployments:
npm run preflight:ai-safety-package -- /path/to/manifest.json --verify-live
```

Integrate first without gating ordinary site maintenance or deploying in CI: run the unit-test script in the existing AI Safety checks, then require packet preflight in the recurring publication instructions. Keep private package paths outside public build inputs. Reassess automated enforcement after an unattended end-to-end release records valid Chat and both production receipts; do not describe the workflow as permanently fixed based on this local test.
