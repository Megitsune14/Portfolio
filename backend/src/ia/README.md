# Module IA (Codex OAuth)

Module portable pour appeler l'API Codex via les tokens OAuth ChatGPT.

## Setup

1. Configurer dans `.env` :
   ```
   CODEX_AUTH_FILE=.env.auth
   CODEX_MODEL=gpt-5.4
   ```

2. Se connecter :
   ```bash
   npm run openai:login
   ```
   Crée `backend/.env.auth` à partir du login Codex.

## Usage

```ts
import { structuredCompletion } from './ia/index.js'
import { z } from 'zod'

const result = await structuredCompletion({
  prompt: 'Réponds en JSON: { "mood": "..." }',
  schema: z.object({ mood: z.string() }),
})
```

## Réutilisation

Copier le dossier `src/ia/` dans un autre projet backend Node.js avec Zod.

## Avertissement

Projet non officiel OpenAI. Usage personnel uniquement. Ne pas committer `.env.auth`.
