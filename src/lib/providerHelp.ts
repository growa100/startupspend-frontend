/**
 * Onboarding helpers for each provider.
 *
 * FIELD_HELP holds tooltip text per credential field. Plain English.
 * Assumes the user has never used an API key before. Goal: zero support
 * requests about "where do I find my API key."
 *
 * Newlines (\n) in the help text are rendered as line breaks by HelpTip
 * (white-space: pre-line). Use them sparingly for multi-step instructions.
 *
 * Field names match the `name` on each CredentialField in the Python
 * provider classes — keep these in sync if a credential field is renamed.
 */
export const FIELD_HELP: Record<string, string> = {
  // DigitalOcean
  "digitalocean.api_token":
    "Click 'Generate New Token', give it any name, select 'Read' scope only. Copy the token — you won't see it again.",

  // OpenAI
  "openai.admin_api_key":
    "This is NOT a regular API key. Go to platform.openai.com → Settings → Organization → Admin keys. You need Owner or Admin role. Click 'Create new key'.",

  // Anthropic
  "anthropic.admin_api_key":
    "Go to console.anthropic.com → Settings → API Keys. Create a new key. Make sure you're logged in as the account owner.",

  // Azure
  "azure.tenant_id":
    "Go to portal.azure.com → Azure Active Directory → Overview. Your Tenant ID is shown on the main page.",
  "azure.subscription_id":
    "Go to portal.azure.com → Subscriptions. Copy the Subscription ID from the list.",
  "azure.client_id":
    "Run in Azure CLI:\naz ad sp create-for-rbac --role 'Cost Management Reader' --scopes /subscriptions/YOUR_SUB_ID\n\nCopy the appId field as client_id.",
  "azure.client_secret":
    "Run in Azure CLI:\naz ad sp create-for-rbac --role 'Cost Management Reader' --scopes /subscriptions/YOUR_SUB_ID\n\nCopy the password field as client_secret.",

  // Exoscale
  "exoscale.api_key":
    "Go to portal.exoscale.com → IAM → API Keys → Add. Select 'Read' permissions. Copy both the key and secret.",
  "exoscale.api_secret":
    "Shown once, alongside the key, when you create it. Copy it now — you can't see it again.",
  "exoscale.zone":
    "Your default zone, e.g. ch-gva-2 (Geneva), de-fra-1 (Frankfurt), at-vie-1 (Vienna). Check which zone your resources are in.",
  "exoscale.organization_id":
    "Go to portal.exoscale.com → Organization → Settings. Copy the Organization ID.",

  // AWS
  "aws.access_key_id":
    "Go to AWS Console → IAM → Your username → Security credentials → Create access key. Choose 'Third-party service' use case.",
  "aws.secret_access_key":
    "Shown once when you create the IAM access key. Copy it now — AWS won't show it again.",
  "aws.region":
    "Cost Explorer is global, but pick your primary region (e.g. us-east-1).",

  // GCP
  "gcp.service_account_json":
    "Go to GCP Console → IAM → Service Accounts → Create. Grant 'Billing Account Viewer' role. Click the account → Keys → Add Key → JSON. Paste the entire JSON file contents here.",
  "gcp.billing_account_id":
    "Cloud Console → Billing → Manage Billing Accounts → copy the ID (format: 01ABCD-234567-89EFGH).",

  // Hetzner
  "hetzner.api_token":
    "Go to console.hetzner.cloud → Your project → Security → API Tokens → Generate API Token. Select 'Read' permission.",

  // Vercel
  "vercel.api_token":
    "Go to vercel.com → Settings → Tokens → Create. Give it any name and no expiry.",
  "vercel.team_id":
    "Optional. Go to your Vercel team settings — the team ID is in the URL: vercel.com/teams/YOUR_TEAM_ID/settings",

  // Netlify
  "netlify.api_token":
    "Go to app.netlify.com → User settings → Applications → Personal access tokens → New access token.",
  "netlify.account_slug":
    "Your team URL slug — the part after netlify.com/teams/ in the URL.",

  // GitHub
  "github.api_token":
    "Click the link to create a token with the right scopes pre-selected. Choose 'No expiration' or set a long expiry.",
  "github.account": "Your GitHub username or org login (e.g. growa100).",
  "github.account_type":
    "Type 'user' for a personal account or 'org' for a GitHub organization.",

  // Stripe Fees
  "stripe_fees.restricted_api_key":
    "Use your Secret key (starts with sk_live_ or sk_test_). Find it at dashboard.stripe.com → Developers → API keys.",
  "stripe_fees.api_key":
    "Use your Secret key (starts with sk_live_ or sk_test_). Find it at dashboard.stripe.com → Developers → API keys.",

  // Google Ads
  "google_ads.developer_token":
    "Go to Google Ads → Tools → API Center. Apply for a developer token (takes a few days).",
  "google_ads.customer_id":
    "Your Customer ID is shown in the top right of your Google Ads account (format: XXX-XXX-XXXX). Enter without dashes.",
  "google_ads.refresh_token":
    "OAuth refresh token from a one-time consent flow. See the Google Ads API quickstart for the OAuth playground walkthrough.",
  "google_ads.client_id": "OAuth client ID from Google Cloud Console.",
  "google_ads.client_secret": "OAuth client secret from Google Cloud Console.",

  // Meta Ads
  "meta_ads.access_token":
    "Create a Meta app at developers.facebook.com → Create App → Business type. Add Marketing API product. Generate a User access token with ads_read permission.",
  "meta_ads.ad_account_id":
    "Ad Account ID starts with 'act_' — find it in Meta Ads Manager. Enter the digits only, no act_ prefix.",

  // Cloudflare
  "cloudflare.api_token":
    "Go to dash.cloudflare.com → My Profile → API Tokens → Create Token. Use the 'Read all resources' template, or grant 'Account: Read' + 'User: Read' + 'User: Billing Read'.",
  "cloudflare.account_id":
    "Optional. Find it on the right sidebar of any zone overview, or under Account Home.",

  // Mistral
  "mistral.api_key":
    "Go to console.mistral.ai → API Keys → Create new key. Copy it now — you won't see it again. Note: Mistral has no usage API yet, so we can validate the key but not yet pull spend.",

  // Groq
  "groq.api_key":
    "Go to console.groq.com → API Keys → Create API Key. Note: Groq has no usage API today, so we validate the key but spend will show $0 until they ship one.",

  // Replicate
  "replicate.api_token":
    "Go to replicate.com/account/api-tokens → New token. Note: Replicate's HTTP API doesn't yet expose billing, so the connection will validate but spend stays at $0.",

  // Resend
  "resend.api_key":
    "Go to resend.com/api-keys → Create API Key. 'Sending access' or 'Full access' both work for validation. Resend has no billing API, so this is for tracking the connection only.",

  // Vercel (real billing)
  // (vercel.api_token / vercel.team_id already covered above; FOCUS-format
  // /v1/billing/charges is now wired in.)

  // Stub providers — short hints only; UI shows "Soon" badge.
  "gemini.api_key":
    "Get a key from aistudio.google.com/app/apikey. Coming soon — no Gemini usage API yet.",
  "cohere.api_key":
    "Get a key from dashboard.cohere.com/api-keys. Coming soon — no Cohere billing API yet.",
  "together.api_key":
    "Get a key from api.together.xyz/settings/api-keys. Coming soon.",
  "huggingface.api_token":
    "Generate a token at huggingface.co/settings/tokens. Coming soon.",
  "elevenlabs.api_key":
    "Find it under Profile + API key in the ElevenLabs app. Coming soon.",
  "deepgram.api_key":
    "Console → Project → API Keys at console.deepgram.com. Coming soon.",
  "supabase.access_token":
    "Generate a personal access token at supabase.com/dashboard/account/tokens. Coming soon.",
  "supabase.organization_id":
    "Found in Organization → Settings on the Supabase dashboard. Coming soon.",
  "railway.api_token":
    "Account → Tokens at railway.app/account/tokens. Coming soon.",
  "render.api_key":
    "Settings → API Keys at dashboard.render.com. Coming soon.",
  "flyio.api_token":
    "Run `flyctl auth token` in your terminal, or generate one at fly.io/user/personal_access_tokens. Coming soon.",
  "mongodb_atlas.public_key":
    "Org → Access Manager → API Keys → Create. Coming soon.",
  "mongodb_atlas.private_key":
    "Shown once when you create the API key. Save it then. Coming soon.",
  "mongodb_atlas.organization_id":
    "Org → Settings → ID. Coming soon.",
  "upstash.email":
    "Email of your Upstash account. Coming soon.",
  "upstash.api_key":
    "Account → Management API at console.upstash.com/account/api. Coming soon.",
  "algolia.application_id":
    "Found in dashboard.algolia.com under Settings → Team & Access → API Keys. Coming soon.",
  "algolia.admin_api_key":
    "Admin API Key from the same page. Coming soon.",
  "twilio.account_sid":
    "Top of console.twilio.com — starts with 'AC'. Coming soon.",
  "twilio.auth_token":
    "Same console page, hidden under 'View'. Coming soon.",
  "datadog.api_key":
    "Org Settings → API Keys at app.datadoghq.com. Coming soon.",
  "datadog.app_key":
    "Org Settings → Application Keys. Coming soon.",
  "datadog.site":
    "Your Datadog site — datadoghq.com (US1), datadoghq.eu (EU1), us3.datadoghq.com, etc.",
  "planetscale.service_token_id":
    "Org settings → Service tokens → Create. Coming soon.",
  "planetscale.service_token":
    "Shown once when you create the service token. Coming soon.",
  "neon.api_key":
    "console.neon.tech → Account settings → API keys. Coming soon.",
};

export function fieldHelpFor(
  providerName: string,
  fieldName: string,
): string | undefined {
  return FIELD_HELP[`${providerName}.${fieldName}`];
}
