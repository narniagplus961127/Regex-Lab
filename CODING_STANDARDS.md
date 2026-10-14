# Coding standards

- Use Next.js and TypeScript for the application, with Vercel as the intended hosting target and Groq for AI generation.
- Format authored text files with Prettier where supported. Use CRLF line endings for all authored text files, including source, styles, configuration, tests, and Markdown.
- Split components and CSS when doing so keeps responsibilities understandable and changes localized.
- Implement the seven approved core tickets. Browser-local saved patterns and the cheatsheet are optional drafts outside this implementation.
- Verify behavior through the browser workflow and the existing local regex-evaluation interface. Keep provider fixtures in tests; production generation calls Groq.
- Keep AI credentials on the server.
- Do not deploy as part of this implementation.
