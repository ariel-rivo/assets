# ariel-rivo/assets — Argo CD customization

Customizes the Argo CD UI (v3.4.5, deployed via the `argo-cd` Helm chart, managed by Argo CD itself — no Helm CLI).
User prefers: concise answers, short snippets, claims backed by docs/source.

## Repo layout
```
argocd/
├── argologo.svg          # sidebar/login text logo ("argo-dr"), fill #f37430
├── logo.png              # sidebar character (octopus)
├── style.css             # custom UI CSS, loaded via ui.cssurl
├── favicon/              # RealFaviconGenerator pack (svg, ico, 96px png, apple-touch, webmanifest, 192/512 pngs)
└── extensions/           # UI extensions (TypeScript → JS)
    ├── package.json      # esbuild + tsc
    ├── tsconfig.json
    └── src/
        ├── favicon.ts    # replaces <link rel=icon/manifest> with the favicon/ pack from jsDelivr
        └── sso.ts        # auto-clicks "Log in via Okta" (.login__box_saml a[href*="auth/login"]), once per tab via sessionStorage
.github/workflows/argocd-extensions.yml   # on tag argocd-extensions-v*: build, pack, gh release
```

## Build & release (extensions)
- `npm run pack` (in argocd/extensions): typecheck → esbuild `--bundle --minify --format=iife --outdir=dist/resources --entry-names=extension-[name]` → `tar czf extensions.tar.gz -C dist resources`.
- Tarball MUST contain top-level `resources/` (installer does `cp -Rf resources/*`) and must be .tar/.tar.gz (installer checks mime; plain .js rejected).
- Release: `git tag argocd-extensions-vX.Y.Z && git push origin argocd-extensions-vX.Y.Z` → workflow publishes `extensions.tar.gz`.
- Don't commit tarballs (`*.tar.gz`, `dist/`, `node_modules/` gitignored); commit `package-lock.json`.
- Pushing workflow files needs the `workflow` token scope: `gh auth refresh -h github.com -s workflow && gh auth setup-git --hostname github.com` (or SSH remote).

## Helm values (argo-cd chart)
```yaml
configs:
  cm:
    ui.cssurl: https://cdn.jsdelivr.net/gh/ariel-rivo/assets@main/argocd/style.css
server:
  extensions:
    enabled: true
    extensionList:
      - name: extensions
        env:
          - { name: EXTENSION_NAME, value: extensions }
          - { name: EXTENSION_VERSION, value: v1.0.0 }
          - { name: EXTENSION_URL, value: https://github.com/ariel-rivo/assets/releases/download/argocd-extensions-v1.0.0/extensions.tar.gz }
          - { name: IGNORE_FAILURE, value: "true" }
```
Legacy to remove: ConfigMap `argocd-favicon-ext` + its `server.volumes`/`volumeMounts` at `/tmp/extensions/favicon`.
Restart `argocd-server` after extension changes (loaded at startup).

## style.css (current)
- `.sidebar__logo`: flex column, centered. `.sidebar__collapse-button`: align-self flex-end, margin-top 0, margin-right -0.5em, margin-bottom 4em.
- `.sidebar__logo-container`: flex column, centered, margin 0. `.sidebar__version`: hidden.
- `.sidebar__logo__character`: `content:url(.../logo.png)!important`, width 50px, order 3.
- `.sidebar__logo__text-logo`: `content:url(.../argologo.svg)!important; filter:none!important` (Argo applies invert filter to it).
- `.login__logo img`: argologo.svg, `height:48px!important; width:auto!important`.
- Expanded-only rule via `.sidebar__logo:has(.fa-arrow-left){padding-left:inherit}` (collapsed = `.fa-arrow-right`).

## Hard-won facts
- Can't override built-in UI files (e.g. assets/images/argologo.svg, favicon) by mounting over /shared/app: server uses `NewComposableFS(embedded, disk)`, embedded wins. Only NEW paths are served from disk.
- CSS can't set favicon or trigger navigation → use extension JS (any `extension*.js` under /tmp/extensions runs on page load).
- `.Files.Get` doesn't work inside chart `extraObjects` (tpl runs in argo-cd chart context).
- SVG in `content:url()` needs explicit width/height attrs or CSS height, else may collapse to 0.
- jsDelivr: `@main` is cached; purge via `https://purge.jsdelivr.net/gh/...` (throttles) or pin `@<sha>`. jsDelivr can't serve release assets. raw.githubusercontent serves SVG as text/plain (won't render).

## Open items
- Verify extension JS loads on the login page pre-auth (needed for sso.ts). If not: redirect `/login` → `/auth/login` at proxy/ingress.
- Login page logo visibility (was "gone" — sizing/color to confirm).
