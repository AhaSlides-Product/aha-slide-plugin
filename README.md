# `cdn` branch — generated asset, do not edit by hand

Holds the built **@aha/standalone** browser global so a public GitHub CDN (jsDelivr)
can serve it. Auto-refreshed by `.github/workflows/build-standalone-cdn.yml` on every
change to the SDK source on `staging`. Force-updated each time.

Load it:

```html
<!-- always the latest staging build (jsDelivr caches ~12h) -->
<script src="https://cdn.jsdelivr.net/gh/AhaSlides-Product/aha-slide-plugin@cdn/aha-slide-plugin.global.js"></script>

<!-- immutable: pin to this branch's commit SHA for a permanent, instantly-fresh link -->
<script src="https://cdn.jsdelivr.net/gh/AhaSlides-Product/aha-slide-plugin@<sha>/aha-slide-plugin.global.js"></script>
```

Source: `packages/standalone/` on `staging`.
