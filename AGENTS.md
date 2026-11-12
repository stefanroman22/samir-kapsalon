<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Display options (CMS, ADR-0013)

Each page reads one `<page>_page_options` service (`home`, `services`, `team`, `gallery`, `contact`, `book`; listed in `cms.config.json`). `lib/cms-content.ts` passes the raw services through `messages.site.pageOptions`; `lib/page-options.ts` validates them with the kit's `readOptions` against per-page defaults that are the designed look, and `pageSurface()` turns them into the page wrapper's classes and CSS variables (rules at the end of `app/globals.css`). Colours apply to the light theme only; text on them is picked for >= 4.5:1. `content_width` changes `.container` (not the hero). Never fade CMS rich text with `opacity`; use a `color-mix(...)` muted colour so client span colours stay readable.
