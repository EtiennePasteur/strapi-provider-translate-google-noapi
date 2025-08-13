# Strapi Provider Translate Google NoApi

This is a provider for Strapi Plugin Translate that use Google Translate without requiring an API key.

## Installing
```bash
$ npm strapi-provider-translate-google-noapi
```

## Usage
Configure the provider through the plugin options of strapi in `config/plugins.js`:

```js
module.exports = {
  // ...
  translate: {
    enabled: true,
    config: {
      provider: "google-noapi",
      translatedFieldTypes: [
        { type: 'string', format: 'plain' },
        { type: 'text', format: 'plain' },
        { type: 'richtext', format: 'markdown' },
      ],
      translateRelations: true,
    },
  },
  // ...
};
```
