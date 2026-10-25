export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');


export const REPO_URL = 'https://github.com/stanley5775/Snippet-Vault';

export const FEEDBACK_URL = `${REPO_URL}/issues/new/choose`;
