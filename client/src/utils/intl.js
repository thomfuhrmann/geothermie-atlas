import * as intl from "@arcgis/core/intl";

intl.registerMessageBundleLoader({
  pattern: "assets/",
  async fetchMessageBundle(bundleId, locale) {
    const [, filename] = bundleId.split("/t9n/");

    const knownLocale = intl.normalizeMessageBundleLocale(locale);
    const bundlePath = `./assets/t9n/${filename}_${knownLocale}.json`;

    const response = await fetch(bundlePath);
    return response.json();
  },
});

export const fetchMessageBundle = async () => {
  const bundle = await intl.fetchMessageBundle("assets/t9n/geothermie");
  return bundle;
};
