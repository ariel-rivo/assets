(()=>{const go=()=>{const a=document.querySelector('.login__box_saml a[href*="auth/login"]');
if(a&&!sessionStorage.sso){sessionStorage.sso=1;location.href=a.href}};
new MutationObserver(go).observe(document.body,{childList:true,subtree:true});go();})();
