const fs = require('fs');
let css = fs.readFileSync('public/css/style.css', 'utf-8');

// Modifiers using string replacement
css = css.replace(/rgba\(255,\s*255,\s*255,/g, 'rgba(0,0,0,');
css = css.replace(/rgba\(15,23,42,0\.8\)/g, 'rgba(255,255,255,0.8)');
css = css.replace(/#334155/g, '#cbd5e1');
css = css.replace(/#475569/g, '#94a3b8');
css = css.replace(/#16a34a/g, '#004d3b');
css = css.replace(/background: rgba\(0,0,0,0\.7\);/g, 'background: rgba(0,0,0,0.4);');
css = css.replace(/opacity: 0\.4/g, 'opacity: 0.15');
css = css.replace(/color: white;/g, 'color: var(--card);');
css = css.replace(/background: transparent;/g, 'background: transparent;'); // noop for testing context

fs.writeFileSync('public/css/style.css', css);
console.log('CSS backgrounds/colors updated for light mode!');
