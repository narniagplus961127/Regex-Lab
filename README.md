# RegexLab

A JavaScript regex playground built with Next.js 16.4 and TypeScript.

## Run locally

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Visit http://localhost:3000. The playground works without an API key. Test text stays in the browser, in an isolated worker. Tests stop after 1.5 seconds; patterns accept up to 2,000 characters and test text up to 30,000. The first 500 matches are displayed, with clipping clearly identified.

## Verify

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run typecheck
npm run build
npm run format:check
npm run eol:check
```

Use `npm run format` and `npm run eol:fix` after edits. All authored text uses CRLF. Run a production build locally with `npm run build` followed by `npm start`. The explicit webpack scripts bundle the isolated regex worker using Next.js worker support. No deployment is performed.
