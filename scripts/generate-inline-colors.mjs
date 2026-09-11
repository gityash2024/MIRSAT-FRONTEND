import fs from 'fs'; import path from 'path';
const files=[]; (function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())w(p);else if(/\.jsx?$/.test(f)&&!/\.test\./.test(f)&&!/\.bak/.test(f)&&!/backup/.test(f))files.push(p);}})('src');
const tokRe=/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b|var\(--color-[a-z-]+\)/gi;
const lists={bg:new Set(),text:new Set(),border:new Set()};
const classify=(prop)=>/^(background|backgroundColor|bgColor|bg|backgroundImage|accentColor)$/i.test(prop)?['bg']:/^(color|fill|stroke|caretColor|textColor)$/i.test(prop)?['text']:/^(border|borderColor|borderTop|borderBottom|borderLeft|borderRight|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|outline|outlineColor)$/i.test(prop)?['border']:null;
const norm=v=>v.toLowerCase().replace(/\s+/g,' ').replace(/\(\s+/,'(').replace(/\s+\)/,')').replace(/\s*,\s*/g,', ');
for(const f of files){ const t=fs.readFileSync(f,'utf8');
  const code=t.replace(/`(?:[^`\\]|\\.)*`/g,'``');
  const re=/(['"])((?:(?!\1)[^\\\n]|\\.)*)\1/g; let m;
  while((m=re.exec(code))){ const str=m[2]; const toks=str.match(tokRe); if(!toks) continue;
    const before=code.slice(Math.max(0,m.index-200),m.index);
    const last=[...before.matchAll(/\b([A-Za-z]+)\s*[:=]/g)].pop();
    let props=last?classify(last[1]):null;
    if(!props && /gradient/.test(str)) props=['bg'];
    if(!props && /solid|dashed|dotted/.test(str)) props=['border'];
    if(!props) props=['bg','text'];
    for(const tok of toks){ const v=norm(tok); if(/^#[0-9a-f]{3,8}$/.test(v)||/^rgba?\(/.test(v)||/^(white|black)$/.test(v)||/^var\(/.test(v)) props.forEach(k=>lists[k].add(v)); } }
}
const out=Object.fromEntries(Object.entries(lists).map(([k,s])=>[k,[...s].sort()]));
console.error(Object.entries(out).map(([k,v])=>k+':'+v.length).join(' '));
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
