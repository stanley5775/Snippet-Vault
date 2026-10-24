export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/** Your GitHub repository. Replace YOUR-USERNAME (and the repo name, if different). */
export const REPO_URL = 'https://github.com/stanley5775/Snippet-Vault.git';

export const FEEDBACK_URL = `${REPO_URL}/issues/new/choose`;
