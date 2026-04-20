import { th } from "intl-tel-input/i18n";

// @ts-check
export class PbUtils{
/**
 * 
 * @param {any} main 
 */
constructor(main){
  this.main = main;
  this.isRoot = false;
  this.err = 'Not Found';
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
 */
createButton(title,href,clasz=[],isView){
  let div = this.createElement('div',['d-flex']);
  div.contentEditable = false;
  div.innerHTML = 
  `
  <a class="sp-cm ${this.showIf(!isView)}" style="cursor: pointer;"><i class="bi bi-three-dots-vertical"></i></a>
  <a type="button" href="${href}" class="btn sp-button ${this.addClassIf(clasz.length>0,clasz)}">${title?title:'Title'}</a>
  <a><i class="bi bi-link ${this.showIf(! this.main.utils.isNull(href))}"></i></a>
  `;

  let button = div.querySelector('.sp-button');
  if(!isView){
    //handle
  let cm = div.querySelector('.sp-cm');
  let linkIcon = div.querySelector('.bi-link');
  //

  this.listen(cm,'click',()=>{
    let form = this.createElement('form',['search-post','position-relative']);
    form.innerHTML = 
    `
    <div class="sp-form-control">
    <input type="text" value="${button.textContent}" class="form-control sp-validation-required sp-title my-2" placeholder="Title"/>
    </div>
    <div class="sp-form-control">
    <input type="url" value="${button.href}" class="form-control sp-link" placeholder="Link"/>
    </div>
    `
    let titleControl = form.querySelector('.sp-title');
    let linkControl = form.querySelector('.sp-link');
    let modal = this.main.utils.setModal('Link',form);

    this.listen(modal.confirm,'click',()=>{
      //validate title
      if(!this.main.vu.validate(titleControl,linkControl)){
        return;
      }
      button.textContent = titleControl.value;
      //############## link 
      let href = linkControl.getAttribute('data-href');//set if validation passes
      if(href){
          button.href = href;
          this.show(linkIcon);
      }else{
        //link removed
        button.removeAttribute('href');
        this.hide(linkIcon);
      }
      modal.dismiss.click();
    });
    //search
  this.main.pbu.listen(linkControl,'input',()=>{
    this.main.utils.searchPosts(linkControl,false);
  });//
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
  this.appendChild(tr,`<td><a class="sp-link sp-route-link sp-detail" target="_blank" href= "${p.href}"> ${p.titles[0]}</a> </td>`);
  for(let i=1;i<l;i++){
    this.appendChild(tr,`<td>${p.titles[i]}</td>`);
  }
  this.appendChild(tr,`<td><a class="sp-link sp-route-link sp-edit sp-admin-link"  href="${p.editHref}" ><i class="bi bi-pencil-square"></i>Edit</a></td>`);
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
<input type="${data.type}" ${(isCheck &&(data.value==true || data.value=='true'))?'checked':''}  class="sp-form-control ${this.addClassIf(isCheck,['form-check-input'],['form-control'])} ${data.clasz?.join(' ')}"  id="${data.id}">
 `
let input = row.querySelector('input');
if(data.divClasz){
  this.addClass(row,data.divClasz);
}

if(data.value){
input.setAttribute('value',data.value);
//input.value = data.value;
}

if(data.name){
input.name = data.name;
}

if(data.placeholder){
input.placeholder = data.placeholder;
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
for(let i of data.items){
let option = `<option ${(i==data.value)?'selected':''}>${i}</option>`;
this.appendChild(select,option);
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
let row = this.createElement('div',['row','mb-3']);
row.innerHTML = 
 `
<div class="mb-3 row">
<label for="${data.id}" class="col-sm-2 col-form-label ${this.showIf(data.title!=undefined)}">${data.title}</label>
<div class="col-sm-10 sp-items" id="${data.id}">
</div>
</div>
 `
let itemsDiv = row.querySelector('.sp-items');
for(let i of data.items){
let item = 
`
<div class="form-check">
<input type="${data.type}" ${data.value==i?'checked':''} class="form-check-input" name="${data.id}" type="radio" value="${i}" id="${data.id}-${i}">
<label class="form-check-label" for="${data.id}-${i}">${i}</label>
</div>
`;
this.appendChild(itemsDiv,item);
}//for
return row;
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
 * @param {HTMLElement} parent 
 * @param  {...HTMLElement} els 
 */
appendChild2(parent,...els){
for(let el of els){
parent.appendChild(el);
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
 * @param  {...string[]} attrs 
 */
// setAttributes(el, ...attrs){
// 	for(let attr of attrs){
// el.setAttribute(attr[0],attr[1]);
// 	}
// }
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
 * @param {any[]|undefined} elseAttr - attributes to add if false (*optional)
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
 * 
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
 * @param {string} element
 * @param {string[]} array 
 */
pop(element,array){
let i = array.indexOf(element);
if(i >-1){
array.splice(i, 1);
}
}//func
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
 */
mount(component){
let replace = this.query('#replace');
this.replace(replace,component);
}//

/**
 * 
 * @param {HTMLElement} el 
 */
outerHTML(el){
return el.outerHTML;
}//func

/**
 * 
 * @param {HTMLElement} section - where to append
 * @returns 
 */
getLoginForm(){
let loginForm = this.createElement('form',['login-form']);
let controls = `
      <div class="form-floating">
        <input id="email" name="Email" type="email" class="form-control sp-form-control sp-validation-required sp-email">
        <label for="email">Email address</label>
      </div>

      <div class="form-floating">
        <input type="password" name="password" class="form-control sp-form-control sp-validation-required sp-password" id="password">
        <label for="password">Password</label>
      </div>
`;
loginForm.innerHTML = controls;
return loginForm;
}//func

}//class