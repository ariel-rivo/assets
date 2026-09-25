(()=>{const b="https://cdn.jsdelivr.net/gh/ariel-rivo/assets@main/argocd/favicon/";
document.querySelectorAll("link[rel*='icon'],link[rel='manifest']").forEach(e=>e.remove());
[["icon","favicon-96x96.png","image/png","96x96"],["icon","favicon.svg","image/svg+xml"],
 ["shortcut icon","favicon.ico"],["apple-touch-icon","apple-touch-icon.png",,"180x180"],
 ["manifest","site.webmanifest"]].forEach(([rel,f,type,sizes])=>document.head.append(
 Object.assign(document.createElement("link"),{rel,href:b+f,...(type&&{type}),...(sizes&&{sizes})})));})();
