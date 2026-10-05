import config from "./site-config.json";

export type PrivacyConfig = {
  legalName?: string;
  contactEmail?: string;
  effectiveDate?: string;
};

export type SiteConfig = {
  privacy?: PrivacyConfig;
};

export function loadSiteConfig(): SiteConfig {
  return config as SiteConfig;
}
