// @ts-check
import { th } from "intl-tel-input/i18n";
export class PbUtils{
/**
 * 
 * @param {any} main 
 */
constructor(main){
  this.main = main;
}
/**
 * 
 * @param {string} selector 
 * @returns 
 */
query(selector){
return document.querySelector(selector);
}//
/**
 * 
 * @param {string} selector 
 * @returns 
 */
queryAll(selector){
return document.querySelectorAll(selector);
}//
/**
 * 
 * @param {string} tag 
 * @param  {string[]} clasz 
 * @param  {string} text
 * @param  {any[]} attr
 * @returns 
 */
createElement(tag,clasz=[],text='',attr=[]){
let el = document.createElement(tag);
if(text){
  el.textContent = text;
}
el.classList.add(...clasz);
if(el.classList.length==0){
  //because created element without class still have class = ""
  el.removeAttribute('class');
}
if(attr.length>0){
  this.setAttribute(el,attr);
}
return el;
}//
/**
 * 
 * @param {string} text 
 * @returns 
 */
createText(text){
return document.createTextNode(text);
}//func

/**
 * 
 * @param {string} title 
 * @param {string} href 
 * @param {string[]} clasz 
 * @param {boolean} isView
 * @param {any|null} parent
 */
createButton(title,href,clasz=[],isView,parent=null){
  let div = this.createElement('div',['d-flex']);
  div.contentEditable = false;
  div.innerHTML = 
  `
  <a class="sp-cm ${this.showIf(!isView)}" style="cursor: pointer;"><i class="bi bi-three-dots-vertical"></i></a>
  <a type="button" ${this.main.pbu.setAttributeIf(href,[{n:"href",v:href}])}  class="btn sp-button btn-primary ${this.addClassIf(clasz.length>0,clasz)}">${title?title:'Title'}</a>
  `;
  let button = div.querySelector('.sp-button');
  let linkIcon = `<a class="link-icon"><i class="bi bi-link"></i></a>`;
  if(!isView){
    if(href){
     this.appendChild(div,linkIcon);
    }
    //handle
  let cm = div.querySelector('.sp-cm');
  this.listen(cm,'click',()=>{
    let form = this.createElement('form',['search-post', 'auto-complete','position-relative']);
    form.innerHTML = 
    `
    ${this.main.pbu.createFormControl({serialize:true,placeholder:"Email",value:`${button.textContent}`,clasz:['sp-title','sp-validation-required']})}
   ${this.main.pbu.createFormControl({serialize:true,type:"url",placeholder:"Link",value:`${button.href}`,clasz:['sp-link']})}
    
    `
    let titleControl = form.querySelector('.sp-title');
    let linkControl = form.querySelector('.sp-link');
    let modal = this.main.utils.setModal('Link',form);
    //search
    if(parent){
    this.main.pbu.listen(linkControl,'input',()=>{
    if(!this.main.vu.sanitize([linkControl])){return;}
    let regex = new RegExp(`${linkControl.value}`, "i");
    let posts = parent.posts$.filter(p=>regex.test(p.title));
    this.main.autoComplete(linkControl,false,posts,'post');
  });//
    }

    this.listen(modal.confirm,'click',()=>{
      //validate title
      if(!this.main.vu.validate(titleControl,linkControl)){
        return;
      }
      button.textContent = titleControl.value;
      //############## link 
      let href = linkControl.getAttribute('data-path');//set if validation passes
      if(href){
        button.href = href;
        this.appendChild(button.parentElement,linkIcon);;
      }else{
        //link removed
        button.removeAttribute('href');
        button.parentElement.querySelector('a.link-icon')?.remove();
      }
      modal.dismiss.click();
    });
  });//cm
  }
  return (isView)?button:div;
}//func

/**
 * 
 * @param {any} data 
 */
createTable(data){
let section = this.createElement('section');
section.innerHTML = 
`
<div  class="table-responsive small">
<table class="table table-striped table-sm">
  <thead class="sp-th">
  <tr class="sp-tr"><th scope="col"></th></tr>
  </thead>
       <tbody class="mass-action sp-tb">
       </tbody>
     </table>
     <button id="massDeleteButton" class="btn btn-primary d-none"  type="button">Trash</button>
   </div>
`;
let tr = section.querySelector('.sp-tr');
let tb = section.querySelector('.sp-tb');
let l = data.titles.length;
for(let t of data.titles){
this.appendChild(tr,` <th scope="col">${t}</th>`);
}
this.appendChild(tr,
`
<th scope="col">Edit</th>
<th scope="col" >Delete</th>
`
);
for(let p of data.posts){
  let tr = this.createElement('tr');
  tb.appendChild(tr);
  this.appendChild(tr,`<td><input type = "checkbox" class="sp-checkbox" data-pid="${p.id}"></td>`);
  //NOTE: Element [0] serves as the href title
  this.appendChild(tr,`<td><a class="sp-route-link sp-detail" target="_blank" href= "${p.href}"> ${p.titles[0]}</a> </td>`);
  for(let i=1;i<l;i++){
    this.appendChild(tr,`<td>${p.titles[i]}</td>`);
  }
  this.appendChild(tr,`<td><a class="sp-route-link sp-admin"  href="${p.editHref}" ><i class="bi bi-pencil-square"></i>Edit</a></td>`);
  this.appendChild(tr,`<td><a data-pid="${p.id}" type="button" class="sp-delete btn-danger"  style="cursor: pointer;"><i class="bi bi-trash" style="color: #FF0000;"></i>Delete</a></td>`);
}
return section;
}//
/**
 * 
 * @param {any} data 
 * @returns 
 */
createFormControl(data){
let isCheck = data.type=='radio' || data.type=='checkbox';
data.type = (data.type)?data.type:'text';
let row = this.createElement('div',['row','mb-3',isCheck?'form-check':'sp-form-control']);
data.id = (data.id)?data.id:`id${this.main.utils.getRandomInt(100)}`;
row.innerHTML =
 `
<label for="${data.id}" class="sp-form-label ${this.addClassIf(isCheck,['form-check-label'],['form-label'])}  ${this.showIf(data.title)}">${data.title?data.title:''}</label>
<input type="${data.type}" ${(isCheck &&(data.value==true || data.value=='true'))?'checked':''}  class="sp-form-control sp-validation ${this.addClassIf(isCheck,['form-check-input'],['form-control'])} ${data.clasz?.join(' ')}"  id="${data.id}">
 `
let input = row.querySelector('input');
if(data.divClasz){
  this.addClass(row,data.divClasz);
}

if(data.value){
input.setAttribute('value',data.value);
}

if(data.name){
input.name = data.name;
}

if(data.placeholder){
input.placeholder = data.placeholder;
}
if(data.required){
this.main.pbu.addClass(input,['sp-validation-required']);
}
if(data.withSubmit){
  this.appendChild(row,'<button class="btn btn-primary w-100 my-2 sp-button" type="button">Submit</button>');
}

if(data.serialize){
return row.outerHTML;
 }else{
return row;
 }

}//

/**
 * 
 * @param {any} data 
 * @returns 
 */
createSelectElement(data){
data.id = (data.id)?data.id:`id${this.main.utils.getRandomInt(100)}`;
let row = this.createElement('div',['row','mb-3']);
row.innerHTML =
 `
<label for="${data.id}" class="sp-form-label form-label ${this.showIf(data.title)}">${data.title?data.title:''}</label>
<div class="col-sm-10">
<select id="${data.id}"  class="form-select sp-select">
</select>
</div>
 `;
let select = row.querySelector('.sp-select');

if(data.items){
for(let i of data.items){
let option = `<option ${(i==data.value)?'selected':''}>${i}</option>`;
this.appendChild(select,option);
}
}else if(data.postItems){
if(data.default){
  this.appendChild(select,`<option value=null>${data.default}</option>`);
}
for(let i of data.postItems){
let option = `<option value="${i.id}" ${(i.id==data.value)?'selected':''}>${i.title}</option>`;
this.appendChild(select,option);
}
}



if(data.clasz){
  this.addClass(select,data.clasz);
}
if(data.serialize){
  return row.outerHTML;
}else{
return row;
}
}//


/**
 * 
 * @param {any} data 
 */
//name used for id generation
createCheckedInputElement(data){
data.id = (data.id)?data.id:`id${this.main.utils.getRandomInt(100)}`;
data.type = (data.type)?data.type:'radio';
let row = this.createElement('div',['row','mb-3']);
row.innerHTML = 
 `
<div class="mb-3 row">
<label for="${data.id}" class="col-sm-2 col-form-label ${this.showIf(data.title!=undefined)}">${data.title}</label>
<div class="col-sm-10 sp-items" id="${data.id}">
</div>
</div>
 `
//note: all element have same name
//concatenate name to id to enable lable click
let itemsDiv = row.querySelector('.sp-items');
for(let i of data.items){
let item = 
`
<div class="form-check">
<input id="${i}-${data.id}" type="${data.type}" ${(i==data.value)?'checked':'notchecked'} class="form-check-input ${data.clasz?.join(' ')}"  name="${data.id}" value="${i}">
<label for="${i}-${data.id}" class="form-check-label">${i}</label>
</div>
`;
this.appendChild(itemsDiv,item);
}//for

if(data.serialize){
  return row.outerHTML;
}else{
return row;
}
}//func

createHr(){
  let div = this.createElement('div',['my-4','w-25','d-block','mx-auto']);
  div.innerHTML = 
  `
  <hr class="sp-hr"/>
  `;
  return div;
}
/**
 * 
 * @param {HTMLElement} parent 
 * @param  {...HTMLElement} els 
 */
appendChild(parent,...els){
for(let el of els){
 if(typeof el=='string'){
  parent.insertAdjacentHTML('beforeend', el);
 }else{
parent.appendChild(el);
 }
}
}//

/**
 * 
 * @param {HTMLElement} parent 
 * @param  {...HTMLElement} els 
 */
prependChild(parent,...els){
for(let el of els){
 if(typeof el=='string'){
  parent.insertAdjacentHTML('afterbegin', el);
 }else{
parent.prepend(el);
 }
}
}//

/**
 * 
 * @param {HTMLElement} el 
 * @param {string} eventType 
 * @param {Function} func 
 */
listen(el,eventType,func){
 el.addEventListener(eventType,(e)=>{
		func(e);
	});
}//
/**
 * 
 * @param {HTMLElement} el 
 * @param {string[]} clasz 
 */
addClass(el,clasz=[]){
for(let c of clasz){
  if(c){
    el.classList.add(c);
  }
}
}//
/**
 * 
 * @param {HTMLElement} el
 * @param {any[]} attr
 */
setAttribute(el,attr){
for(let a of attr){
  el.setAttribute(a.n,a.v);
}
}//func

/**
 * 
 * @param {HTMLElement} el 
 * @param {string} name 
 */
getAttribute(el,name){
let attr = el.getAttribute(name);
if(attr==null){
  attr = '';
}
if(attr=='null'){
  attr = '';
}
return attr;
}//func

/**
 * 
 * @param {HTMLElement} el 
 * @param {string} type 
 */
removeAttribute(el,type){
el.removeAttribute(type);
}//func

/**
 * 
 * @param {HTMLElement} el 
 * @param {string[]} clasz 
 */
removeClass(el,clasz=[]){
for(let c of clasz){
  if(c){
el.classList.remove(c);
  }
}
}//
/**
 * 
 * @param {HTMLElement} el 
 * @param {string} oldClass 
 * @param {string|string[]} newClasz 
 */
replaceClass(el,oldClass,newClasz){
el.classList.remove(oldClass);
if(typeof newClasz=='string'){
el.classList.add(newClasz);
}else{
for(let c of newClasz){
el.classList.add(c);
}
}
}//
/**
 * 
 * @param  {...HTMLElement} els 
 */
hide(...els){
for(let el of els){
el.classList.add('d-none');
}

}//
/**
 * 
 * @param  {...HTMLElement} els 
 */
show(...els){
for(let el of els){
el.classList.remove('d-none');
}
}//

/**
 * 
 * @param {boolean|any} condition 
 */
showIf(condition){
if(condition==false || this.main.utils.isNull(condition)){
  return 'd-none'
}else{
  return '';
}
}

/**
 * 
 * @param {boolean} condition - the condition to test
 * @param {string[]} clasz - class to add if true
 * @param {string[]|null} elseClasz - class to add if false (*optional)
 * @returns 
 */
addClassIf(condition,clasz,elseClasz=null){
if(condition){
  return clasz.join(" ")
}else{
  if(elseClasz){
    return elseClasz.join(" ")
  }else{
return '';
  }
  
}
}//
/**
 * this is a template helper methos
 * @param {boolean} condition - the condition to test
 * @param {any[]} attr - attributes to add if true
 * @param {any[]|undefined|null} elseAttr - attributes to add if false (*optional)
 * @returns string
 */
setAttributeIf(condition,attr,elseAttr){
let r = '';
if(condition){
  for(let a of attr){
r = r + `${a.n}="${a.v}" `;
}
}else{
  if(elseAttr){
  for(let a of attr){
r = r + `${a.n}=${a.v} `;
}
  }else{
r= '';
  }
  
}
return r;
}

/**
 * for display only
 * @param {HTMLElement} el 
 */
toggle(el){
if(el.classList.contains('d-none')){
this.show(el);
}else{
this.hide(el);
}
}//
/**
 * 
 * @param {HTMLElement} el 
 * @param {string} clasz 
 */
toggleClass(el,clasz){
if(el.classList.contains(clasz)){
el.classList.remove(clasz);
}else{
el.classList.add(clasz);
}
}//

/**
 * 
 * @param {HTMLElement} parent 
 * @param {HTMLElement|string} child 
 */
replace(parent,child){
parent.innerHTML = '';
if(typeof child=='string'){
  parent.innerHTML = child;
}else{
parent.appendChild(child);
this.show(child);
}
}//func

/**
 * 
 * @param {HTMLElement} component 
 * @param {string} type
 */
mount(component,type='b'){
let section;
if(type=='b'){
section = this.query('#replace');
}else if(type=='h'){
section = this.query('#mainHeader');
}else if(type=='f'){
section = this.query('#mainFooter');
}
this.replace(section,component);
}//

/**
 * 
 * @param {HTMLElement} el 
 */
outerHTML(el){
return el.outerHTML;
}//func

}//class