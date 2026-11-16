const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const prettier = require('prettier');
const names = {API:'API_URL',page:'currentPage',privatePages:'protectedPages',user:'currentUser',esc:'escapeHtml',msg:'showMessage',input:'renderInput',area:'renderTextarea',select:'renderSelect',bind:'bindForm',auth:'setupAuthForm',card:'renderVacancyCard',search:'renderVacancySearch',detail:'renderVacancyDetails',profile:'renderCandidateProfile',employer:'renderVacancyEditor',employerTabs:'renderEmployerTabs',myVacancies:'renderMyVacancies',applications:'renderApplications',resumeDetail:'renderResumeDetails',candidates:'renderCandidateSearch',vs:'vacancies',cs:'companies',rs:'resumes',apps:'applications',reg:'isRegistration',q:'searchText',p:'params',el:'element',fn:'handler',err:'error',k:'fieldName',c:'company',a:'application',v:'vacancy',r:'response',d:'formData',b:'button',f:'form',n:'name',l:'label'};
function quasi(text,tail){
 const raw=text.replaceAll('\\','\\\\').replaceAll(String.fromCharCode(96),'\\'+String.fromCharCode(96)).replaceAll('$'+'{','\\$'+'{').replaceAll('><','>\n<');
 return types.templateElement({raw,cooked:text},tail);
}
(async()=>{
 for(const file of ['js/script.js','js/home.js','js/header.js','server.cjs']){
  const ast=parser.parse(fs.readFileSync(file,'utf8'),{sourceType:'unambiguous'});
  traverse(ast,{Scope(path){
   for(const [oldName,binding] of Object.entries(path.scope.bindings)){
    let newName=names[oldName];
    const initializer=binding.path.isVariableDeclarator()?generate(binding.path.node.init||types.nullLiteral()).code:'';
    if(oldName==='r'&&(initializer.includes('|| {}')||initializer.includes('/resumes/')))newName='resume';
    if(oldName==='b'&&initializer.includes('Object.fromEntries'))newName='payload';
    if(oldName==='d'&&binding.path.isVariableDeclarator())newName='data';
    if(newName&&newName!==oldName&&!path.scope.hasBinding(newName))path.scope.rename(oldName,newName);
   }
  }});
  traverse(ast,{BinaryExpression(path){
   if(path.node.operator!=='+'||path.parentPath.isBinaryExpression({operator:'+'}))return;
   const parts=[];
   function flatten(node){if(types.isBinaryExpression(node,{operator:'+'})){flatten(node.left);flatten(node.right);}else parts.push(node);}
   flatten(path.node);
   if(!parts.some(part=>types.isStringLiteral(part)&&/<[a-z]/i.test(part.value)))return;
   const quasis=[],expressions=[];let text='';
   for(const part of parts){if(types.isStringLiteral(part))text+=part.value;else{quasis.push(quasi(text,false));expressions.push(part);text='';}}
   quasis.push(quasi(text,true));path.replaceWith(types.templateLiteral(quasis,expressions));
  }});
  fs.writeFileSync(file,await prettier.format(generate(ast).code,{parser:'babel',tabWidth:4,singleQuote:true,printWidth:100}));
 }
})();

