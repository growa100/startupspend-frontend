/**
 * Step-by-step API key guides shown inside ProviderConnectionModal's
 * "How to get your API key" view. Each step is one of:
 *   - { kind: "link", url, label }   — open the exact provider URL.
 *   - { kind: "code", code }          — copy/paste shell command.
 *   - { kind: "mockButton", label }  — CSS-drawn pretend button.
 *   - { kind: "mockInput", value }   — CSS-drawn pretend input.
 *   - { kind: "mockSelect", options, selected } — radio/dropdown mock.
 *   - { kind: "note", text }          — small inline note under a step.
 *
 * Provider-specific guides are listed first; falls back to a generic
 * 3-step guide that uses the canonical "create key" URL on file.
 */

export type GuideStep = {
  text: string;
  visual?: GuideVisual;
};

export type GuideVisual =
  | { kind: "link"; url: string; label?: string }
  | { kind: "code"; code: string }
  | { kind: "mockButton"; label: string }
  | { kind: "mockInput"; value: string; placeholder?: string }
  | {
      kind: "mockSelect";
      options: { label: string; selected?: boolean }[];
    }
  | { kind: "note"; text: string };

const GUIDES: Record<string, GuideStep[]> = {
  digitalocean: [
    {
      text: "Go to your DigitalOcean API settings.",
      visual: {
        kind: "link",
        url: "https://cloud.digitalocean.com/account/api/tokens/new",
      },
    },
    {
      text: "Click 'Generate New Token'.",
      visual: { kind: "mockButton", label: "Generate New Token" },
    },
    {
      text: "Give it any name (e.g. 'StartupSpend').",
      visual: {
        kind: "mockInput",
        value: "StartupSpend",
        placeholder: "Token name",
      },
    },
    {
      text: "Select 'Read' scope only — never write access.",
      visual: {
        kind: "mockSelect",
        options: [
          { label: "Read", selected: true },
          { label: "Write" },
        ],
      },
    },
    {
      text: "Copy the token and paste it above.",
      visual: { kind: "mockInput", value: "dop_v1_•••••••••••••••" },
    },
  ],

  openai: [
    {
      text: "Go to your OpenAI Admin keys page.",
      visual: {
        kind: "link",
        url: "https://platform.openai.com/settings/organization/admin-keys",
      },
    },
    {
      text: "This is different from a regular API key — you need an Admin key.",
      visual: { kind: "note", text: "You must be Owner or Admin." },
    },
    {
      text: "Click 'Create new key'.",
      visual: { kind: "mockButton", label: "Create new key" },
    },
    {
      text: "Give it any name and click Create.",
      visual: { kind: "mockInput", value: "StartupSpend" },
    },
    {
      text: "Copy the key — it starts with 'sk-admin-'.",
      visual: { kind: "mockInput", value: "sk-admin-•••••••••••••••" },
    },
  ],

  azure: [
    { text: "Open Azure Cloud Shell or your terminal." },
    {
      text: "Run this command (substitute your subscription ID).",
      visual: {
        kind: "code",
        code: 'az ad sp create-for-rbac --role "Cost Management Reader" \\\n  --scopes /subscriptions/YOUR_SUB_ID',
      },
    },
    { text: "Copy 'appId' as Client ID." },
    { text: "Copy 'password' as Client Secret." },
    {
      text: "Find your Tenant ID at portal.azure.com → Azure Active Directory.",
      visual: {
        kind: "link",
        url: "https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade",
      },
    },
    {
      text: "Find your Subscription ID at portal.azure.com → Subscriptions.",
      visual: {
        kind: "link",
        url: "https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade",
      },
    },
  ],

  stripe_fees: [
    {
      text: "Go to your Stripe API keys page.",
      visual: { kind: "link", url: "https://dashboard.stripe.com/apikeys" },
    },
    {
      text: "Copy your Secret key (starts with sk_live_ or sk_test_).",
      visual: {
        kind: "note",
        text: "Use sk_live_ for real data, sk_test_ for test mode.",
      },
    },
  ],

  exoscale: [
    {
      text: "Go to your Exoscale IAM API Keys.",
      visual: { kind: "link", url: "https://portal.exoscale.com/iam/keys" },
    },
    {
      text: "Click 'Add New API Key'.",
      visual: { kind: "mockButton", label: "Add New API Key" },
    },
    {
      text: "Name it 'StartupSpend' and select the 'Billing' role.",
      visual: {
        kind: "mockSelect",
        options: [
          { label: "Billing", selected: true },
          { label: "Compute" },
          { label: "Storage" },
        ],
      },
    },
    {
      text: "Copy both the API Key and Secret — the secret is shown only once.",
    },
  ],

  anthropic: [
    {
      text: "Go to your Anthropic Admin keys page.",
      visual: {
        kind: "link",
        url: "https://console.anthropic.com/settings/admin-keys",
      },
    },
    {
      text: "You need to be the account owner to create Admin keys.",
      visual: { kind: "note", text: "Regular API keys won't work for usage data." },
    },
    {
      text: "Click 'Create Admin Key', name it, and copy it now.",
      visual: { kind: "mockButton", label: "Create Admin Key" },
    },
  ],

  aws: [
    {
      text: "Go to AWS IAM Console.",
      visual: { kind: "link", url: "https://console.aws.amazon.com/iam/home" },
    },
    {
      text: "Create an IAM user with the 'AWSBillingReadOnlyAccess' policy.",
      visual: {
        kind: "mockSelect",
        options: [
          { label: "AWSBillingReadOnlyAccess", selected: true },
          { label: "ReadOnlyAccess" },
        ],
      },
    },
    {
      text: "Create an access key for that user. Choose 'Third-party service'.",
    },
    {
      text: "Copy the access key ID and secret. The secret is shown once.",
    },
  ],

  gcp: [
    {
      text: "Go to Google Cloud → IAM → Service Accounts.",
      visual: {
        kind: "link",
        url: "https://console.cloud.google.com/iam-admin/serviceaccounts",
      },
    },
    {
      text: "Create a new service account and grant 'Billing Account Viewer'.",
      visual: {
        kind: "mockSelect",
        options: [{ label: "Billing Account Viewer", selected: true }],
      },
    },
    {
      text: "Open the service account → Keys → Add Key → JSON.",
      visual: { kind: "mockButton", label: "Add Key → Create new key" },
    },
    {
      text: "Paste the entire JSON file contents into the field above.",
    },
  ],

  hetzner: [
    {
      text: "Go to your Hetzner Cloud project.",
      visual: { kind: "link", url: "https://console.hetzner.cloud/" },
    },
    { text: "Open Security → API Tokens → Generate API Token." },
    {
      text: "Select 'Read' permission only.",
      visual: {
        kind: "mockSelect",
        options: [
          { label: "Read", selected: true },
          { label: "Read & Write" },
        ],
      },
    },
    {
      text: "Copy the token. It's shown once.",
    },
  ],

  vercel: [
    {
      text: "Go to your Vercel Account Tokens page.",
      visual: { kind: "link", url: "https://vercel.com/account/tokens" },
    },
    {
      text: "Click 'Create Token', name it, and pick a scope.",
      visual: { kind: "mockButton", label: "Create Token" },
    },
    {
      text: "Copy the token and paste it above.",
    },
  ],

  cloudflare: [
    {
      text: "Open Cloudflare → My Profile → API Tokens.",
      visual: {
        kind: "link",
        url: "https://dash.cloudflare.com/profile/api-tokens",
      },
    },
    {
      text: "Click 'Create Token' and use the 'Read all resources' template.",
      visual: { kind: "mockButton", label: "Create Token" },
    },
    { text: "Copy the token shown on the next page." },
  ],

  mistral: [
    {
      text: "Go to the Mistral Console API Keys page.",
      visual: { kind: "link", url: "https://console.mistral.ai/api-keys" },
    },
    {
      text: "Click 'Create new key' and copy it now.",
      visual: { kind: "mockButton", label: "Create new key" },
    },
    {
      text: "Mistral has no usage API yet, so spend will show $0 until it ships.",
      visual: { kind: "note", text: "Validation only." },
    },
  ],

  groq: [
    {
      text: "Go to Groq Console → API Keys.",
      visual: { kind: "link", url: "https://console.groq.com/keys" },
    },
    {
      text: "Click 'Create API Key'.",
      visual: { kind: "mockButton", label: "Create API Key" },
    },
    {
      text: "Groq doesn't expose usage data yet — we validate the key only.",
      visual: { kind: "note", text: "Spend will show $0." },
    },
  ],

  replicate: [
    {
      text: "Go to Replicate Account API Tokens.",
      visual: {
        kind: "link",
        url: "https://replicate.com/account/api-tokens",
      },
    },
    {
      text: "Click 'New token' and copy it.",
      visual: { kind: "mockButton", label: "New token" },
    },
    {
      text: "Replicate's HTTP API doesn't expose billing yet — spend will be $0.",
      visual: { kind: "note", text: "Validation only." },
    },
  ],

  github: [
    {
      text: "Go to GitHub → Settings → Personal access tokens.",
      visual: {
        kind: "link",
        url: "https://github.com/settings/tokens",
      },
    },
    {
      text: "Generate a fine-grained token with read scopes for billing/usage.",
      visual: { kind: "mockButton", label: "Generate new token" },
    },
    { text: "Copy the token (it's shown once)." },
  ],

  netlify: [
    {
      text: "Go to Netlify User Settings → Personal access tokens.",
      visual: {
        kind: "link",
        url: "https://app.netlify.com/user/applications#personal-access-tokens",
      },
    },
    {
      text: "Click 'New access token'.",
      visual: { kind: "mockButton", label: "New access token" },
    },
    { text: "Copy the token and paste it above." },
  ],

  resend: [
    {
      text: "Go to Resend → API Keys.",
      visual: { kind: "link", url: "https://resend.com/api-keys" },
    },
    {
      text: "Create an API Key. Validation only — no billing API yet.",
      visual: { kind: "mockButton", label: "Create API Key" },
    },
  ],
};

const GENERIC_KEY_URLS: Record<string, string> = {
  gemini: "https://aistudio.google.com/app/apikey",
  cohere: "https://dashboard.cohere.com/api-keys",
  together: "https://api.together.xyz/settings/api-keys",
  huggingface: "https://huggingface.co/settings/tokens",
  elevenlabs: "https://elevenlabs.io/app/settings/api-keys",
  deepgram: "https://console.deepgram.com",
  supabase: "https://supabase.com/dashboard/account/tokens",
  railway: "https://railway.app/account/tokens",
  render: "https://dashboard.render.com/u/settings/api-keys",
  flyio: "https://fly.io/user/personal_access_tokens",
  mongodb_atlas: "https://cloud.mongodb.com/v2#/preferences/publicApiAccess",
  upstash: "https://console.upstash.com/account/api",
  algolia: "https://dashboard.algolia.com/account/api-keys",
  twilio: "https://console.twilio.com",
  datadog: "https://app.datadoghq.com/organization-settings/api-keys",
  planetscale: "https://app.planetscale.com/settings/service-tokens",
  neon: "https://console.neon.tech/app/settings/api-keys",
  google_ads: "https://ads.google.com/aw/apicenter",
  meta_ads: "https://developers.facebook.com/apps/",
};

export function guideForProvider(provider: string): GuideStep[] {
  if (GUIDES[provider]) return GUIDES[provider];
  const url = GENERIC_KEY_URLS[provider];
  return [
    {
      text: `Go to ${provider.replace(/_/g, " ")} settings or developer console.`,
      visual: url ? { kind: "link", url } : undefined,
    },
    { text: "Create a new API key with read-only access." },
    { text: "Copy the key and paste it in the field above." },
  ];
}
