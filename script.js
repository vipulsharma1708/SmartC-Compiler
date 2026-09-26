const codeInput = document.getElementById("codeInput");
const lineNumbers = document.getElementById("lineNumbers");
const compileBtn = document.getElementById("compileBtn");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");
const consoleBox = document.getElementById("console");
const tokenBody = document.getElementById("tokenBody");
const parserTrace = document.getElementById("parserTrace");

const KEYWORDS = new Set(["int","float","char","if","else","while","return","print","main"]);
const TYPES = new Set(["int","float","char"]);
const OPS = ["==","!=","<=",">=","+","-","*","/","=","<",">"];
const DELIMS = new Set(["(",")","{","}",";",","]);

function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function updateEditor(){
  const n=codeInput.value.split("\n").length;
  lineNumbers.textContent=Array.from({length:n},(_,i)=>i+1).join("\n");
  document.getElementById("charCount").textContent=codeInput.value.length+" chars";
}
codeInput.addEventListener("input",updateEditor); updateEditor();

function lex(source){
  const tokens=[]; let i=0, line=1, errors=[];
  const push=(lexeme,type,category)=>tokens.push({lexeme,type,category,line});
  while(i<source.length){
    const c=source[i];
    if(/\s/.test(c)){if(c==="\n")line++;i++;continue}
    if(c==="/" && source[i+1]==="/"){while(i<source.length&&source[i]!=="\n")i++;continue}
    if(c==="/" && source[i+1]==="*"){i+=2;while(i<source.length && !(source[i]==="*"&&source[i+1]==="/")){if(source[i]==="\n")line++;i++}i+=2;continue}
    if(/[A-Za-z_]/.test(c)){
      let j=i+1;while(j<source.length&&/[A-Za-z0-9_]/.test(source[j]))j++;
      const w=source.slice(i,j);
      if(KEYWORDS.has(w)) push(w,w==="main"?"MAIN":"KEYWORD","Keyword");
      else push(w,"ID","Identifier");
      i=j;continue;
    }
    if(/\d/.test(c)){
      let j=i+1;while(j<source.length&&/[0-9.]/.test(source[j]))j++;
      const num=source.slice(i,j);
      push(num,"NUM","Number");i=j;continue;
    }
    const two=source.slice(i,i+2);
    if(["==","!=","<=",">="].includes(two)){push(two,"RELOP","Relational Operator");i+=2;continue}
    if(OPS.includes(c)){push(c,["=","+","-","*","/"].includes(c)?"OP":"RELOP",["=","+","-","*","/"].includes(c)?"Operator":"Relational Operator");i++;continue}
    if(DELIMS.has(c)){push(c,c===";"?"SEMICOLON":"DELIM","Delimiter");i++;continue}
    errors.push(`Line ${line}: Unknown symbol '${c}'`);i++;
  }
  return {tokens,errors};
}

function parse(tokens){
  // Recursive-descent implementation equivalent to an LL(1) predictive parser.
  let p=0, trace=[], errors=[];
  const stream=tokens.map(t=>t.lexeme).concat(["$"]);
  function row(stack, action){trace.push({stack:stack.join(" "),input:stream.slice(p,p+7).join(" "),action});}
  function match(x){
    if(stream[p]===x){p++;return true}
    errors.push(`Expected '${x}' but found '${stream[p]}'`);return false;
  }
  function program(){
    row(["Program"],"Program → int main ( ) Block");
    if(!match("int"))return false;if(!match("main"))return false;if(!match("("))return false;if(!match(")"))return false;
    return block();
  }
  function block(){
    if(!match("{"))return false;
    while(stream[p]!=="}"&&stream[p]!=="$"){
      if(!stmt())return false;
    }
    return match("}");
  }
  function stmt(){
    const x=stream[p];
    if(TYPES.has(x)){
      if(!match(x))return false;
      if(!match(stream[p]))return false; // identifier
      if(tokens[p-1] && tokens[p-1].type!=="ID"){errors.push("Declaration requires an identifier");return false}
      if(stream[p]==="="){p++;if(!expr())return false}
      return match(";");
    }
    if(x==="if"){
      p++;if(!match("("))return false;if(!cond())return false;if(!match(")"))return false;return block();
    }
    if(x==="print"){
      p++;if(!match("("))return false;if(!expr())return false;if(!match(")"))return false;return match(";");
    }
    if(x==="return"){
      p++;if(!expr())return false;return match(";");
    }
    if(x==="ID"){
      p++;if(!match("="))return false;if(!expr())return false;return match(";");
    }
    errors.push(`Unexpected '${x}' at token ${p+1}`);return false;
  }
  function cond(){
    if(!expr()) return false;

    const relationalOperators = [">", "<", "==", "!=", ">=", "<="];

    if(!relationalOperators.includes(stream[p])){
      errors.push(`Condition requires a relational operator, found '${stream[p]}'`);
      return false;
    }

    p++;
    return expr();
  }
  function expr(){if(!term())return false;while(["+","-"].includes(stream[p])){p++;if(!term())return false}return true}
  function term(){if(!factor())return false;while(["*","/"].includes(stream[p])){p++;if(!factor())return false}return true}
  function factor(){
    const currentToken=tokens[p];

    if(currentToken?.type==="ID" || currentToken?.type==="NUM"){
      p++;
      return true;
    }

    if(stream[p]==="("){
      p++;
      if(!expr()) return false;
      return match(")");
    }

    errors.push(`Expected identifier, number or '(' but found '${stream[p]}'`);
    return false;
  }

  // Normalize token input to semantic lexemes for grammar decisions.
  const normalized=tokens.map(t=>({...t,lexeme:t.type==="ID"?"ID":t.type==="NUM"?"NUM":t.lexeme}));
  tokens.length=0; normalized.forEach(t=>tokens.push(t));
  // Rebuild stream after normalization.
  p=0; stream.length=0; normalized.forEach(t=>stream.push(t.lexeme)); stream.push("$");
  trace=[]; errors=[]; 
  const ok=program();
  if(ok && stream[p]==="$") trace.push({stack:"$",input:"$",action:"ACCEPT — input belongs to grammar"});
  else if(ok) errors.push(`Unexpected token '${stream[p]}' after complete program`);
  return {ok:ok&&errors.length===0&&stream[p]==="$",trace,errors};
}

function showConsole(lines,status){
  consoleBox.innerHTML=lines.map(x=>`<div class="console-line ${x[0]}">${escapeHTML(x[1])}</div>`).join("");
  const badge=document.getElementById("compileStatus");
  badge.textContent=status;
  badge.className="tag "+(status==="ACCEPTED"?"":"neutral");
}
function renderTokens(tokens){
  document.getElementById("tokenCount").textContent=tokens.length+" TOKENS";
  tokenBody.innerHTML=tokens.length?tokens.map((t,i)=>`<tr><td class="token-id">${i+1}</td><td class="${t.category==="Identifier"?"token-id2":t.category==="Number"?"token-num":t.category.includes("Operator")?"token-op":t.category==="Keyword"?"token-keyword":""}">${escapeHTML(t.lexeme)}</td><td>${t.type}</td><td>${t.category}</td></tr>`).join(""):`<tr><td colspan="4" class="empty">No tokens.</td></tr>`;
}
function renderTrace(trace,errors){
  document.getElementById("stepCount").textContent=trace.length+" STEPS";
  parserTrace.classList.remove("empty");
  parserTrace.innerHTML=trace.map((r,i)=>`<div class="trace-row ${r.action.startsWith("ACCEPT")?"accept":""}"><span class="n">${i+1}</span><span class="stack">Stack: ${escapeHTML(r.stack)}<br>Input: ${escapeHTML(r.input)}</span><span class="action">${escapeHTML(r.action)}</span></div>`).join("")+
  errors.map(e=>`<div class="trace-row error"><span class="n">!</span><span class="stack">Parser</span><span class="action">${escapeHTML(e)}</span></div>`).join("");
}
function compile(){
  const source=codeInput.value;
  const lx=lex(source);
  renderTokens(lx.tokens);
  if(lx.errors.length){
    renderTrace([],lx.errors);showConsole([["err","✗ LEXICAL ANALYSIS FAILED"],...lx.errors.map(e=>["err",e])],"ERROR");
    document.getElementById("insightSyntax").textContent="Lexical error";
    document.getElementById("statTokens").textContent=lx.tokens.length;
    document.getElementById("statIds").textContent=lx.tokens.filter(t=>t.type==="ID").length;
    document.getElementById("statOps").textContent=lx.tokens.filter(t=>["OP","RELOP"].includes(t.type)).length;
    document.getElementById("statStatus").textContent="ERROR";
    return;
  }
  const pr=parse(lx.tokens);
  renderTrace(pr.trace,pr.errors);
  const ids=lx.tokens.filter(t=>t.type==="ID").map(t=>t.lexeme);
  const ops=lx.tokens.filter(t=>["OP","RELOP"].includes(t.type)).map(t=>t.lexeme);
  document.getElementById("insightTokens").textContent=`${lx.tokens.length} lexical units generated`;
  document.getElementById("insightIds").textContent=ids.length?ids.join(", "):"None";
  document.getElementById("insightOps").textContent=ops.length?ops.join("  "):"None";
  document.getElementById("insightSyntax").textContent=pr.ok?"Accepted by LL(1) grammar":"Syntax error";
  document.getElementById("statTokens").textContent=lx.tokens.length;
  document.getElementById("statIds").textContent=ids.length;
  document.getElementById("statOps").textContent=ops.length;
  document.getElementById("statStatus").textContent=pr.ok?"ACCEPTED":"ERROR";

  if(pr.ok) showConsole([["ok","✓ LEXICAL ANALYSIS COMPLETE"],["info",`  ${lx.tokens.length} tokens classified successfully.`],["ok","✓ LL(1) PREDICTIVE PARSING COMPLETE"],["info","  Grammar match confirmed."],["ok","✓ COMPILATION PIPELINE ACCEPTED"],["info","  No syntax errors detected in C-Lite source."]],"ACCEPTED");
  else showConsole([["ok","✓ LEXICAL ANALYSIS COMPLETE"],["info",`  ${lx.tokens.length} tokens classified successfully.`],["err","✗ LL(1) PARSING FAILED"],...pr.errors.map(e=>["err","  "+e]),["info","  Fix the syntax and compile again."]],"ERROR");
}
compileBtn.onclick=compile;
sampleBtn.onclick=()=>{codeInput.value=`int main() {
    int voltage = 230;
    int load = 120;
    int total = voltage + load * 2;

    if (total >= 400) {
        print(total);
    }

    return 0;
}`;updateEditor();compile()};
clearBtn.onclick=()=>{codeInput.value="";updateEditor();tokenBody.innerHTML='<tr><td colspan="4" class="empty">Compile code to generate tokens.</td></tr>';parserTrace.className="trace empty";parserTrace.textContent="Compile code to see predictive parsing steps.";
document.getElementById("statTokens").textContent="0";document.getElementById("statIds").textContent="0";document.getElementById("statOps").textContent="0";document.getElementById("statStatus").textContent="—";showConsole([["muted","SmartC Compiler Lab"],["muted","Workspace cleared."]],"WAITING")};
