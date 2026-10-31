# MysteryBox — Every Secret Has a Price

MysteryBox is an interactive mystery-investigation experience. Players examine evidence, interview suspects, develop a theory, and make an accusation to uncover the story behind **The Vanishing Frequency**.

## Live experience
https://mysterybox-oyjg20.v2.appdeploy.ai/

## Current case
**Case 001: The Vanishing Frequency** — a radio station stops broadcasting at 03:17 AM, and seven employees disappear. The case includes six evidence items, five suspects, interview prompts, investigation progress, and multiple accusation outcomes.

## Project structure
- `src/App.tsx` — React application and investigation experience
- `src/index.css` — visual design and responsive styles
- `backend/index.ts` — authenticated progress API
- `backend/realtime*.ts` — realtime subscription support
- `tests/tests.json` — application QA scenarios

## Development
Built and deployed with AppDeploy. The frontend uses React, Vite, TypeScript, and Lucide icons. The backend imports the AppDeploy SDK, and the frontend uses the AppDeploy client for authentication and saved progress. Running outside AppDeploy may require configuring those packages and services.

```bash
npm install
npm run dev
```

## Notes
This repository is public for project visibility and collaboration. No API keys or secret credentials are included in the committed source.
