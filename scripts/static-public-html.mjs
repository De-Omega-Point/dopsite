// GitHub Pages has no RSC navigation endpoint. Keep marketing links browser-native.
export function staticPublicHtml(html) {
  if (!html.includes('class="site-header"') || !html.includes('interactive-particles')) return html;
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, script =>
      script.includes('__VINEXT_RSC_') || script.includes('id="_R_"') ? '' : script)
    .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '')
    .replace('</body>', '<script src="/assets/public-particles.js" defer></script></body>');
}
