// @ts-check
import { config } from "../config/config";
import { PbUtils } from "./pb-utils";

export class Utils {
/**
 * 
 * @param {any} main 
 */
constructor(main) { 
this.main = main;
this.config = config;
this.pbu = new PbUtils(null);
}//

/**
 * 
 * @param {any} item 
 * @param {any} state
 */
sign(item,state){
let user = this.getCache('user');
item.username= user.username;
item.tenantId=user.tenantId;
item.tenantUuid=user.tenantUuid;
if(state?.type=='new' && state?.component=='post'){
    item.authorId = user.id;
}
}
getUUID(){
return crypto.randomUUID();
//const components = [];
    
    // User agent
    //components.push(navigator.userAgent);
    
    // Screen resolution
    //components.push(`${screen.width}x${screen.height}`);
    
    // Timezone
    //components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Language
    //components.push(navigator.language);
    
    // Canvas fingerprinting
    //components.push(await getCanvasFingerprint());
    
    // WebGL fingerprint
    //components.push(await getWebGLFingerprint());
    
    //return CryptoJS.SHA256(components.join('|')).toString();
}//

/**
 * 
 * @param {string} name 
 * @param {any} value 
 */
async setCache(name,value){
    //maybe encrypt
localStorage.setItem(name,JSON.stringify(value));
}//func

/**
 * 
 * @param {string} name 
 * @returns 
 */
getCache(name){
    return JSON.parse(localStorage.getItem(name));
}//

/**
 * save or return subscription cookie
 * @param {boolean} save - if true, save cookie, else check existence
 * @param {string} username
 */
genCookie(save,username){
if(save){
document.cookie = `${username}_subscribed=true; max-age=` + (365 * 24 * 60 * 60) + "; path=/";
}else{
    let subscribed = document.cookie.split('; ').find(row => row.startsWith(`${username}_subscribed`));
    console.log('subscribed');
    console.log(subscribed);
    return subscribed == `${username}_subscribed=true`;
}
}//

/**
 * 
 * @param {string} input 
 * @returns 
 */
capitalize(input){
let inputToLowerCase = input.trim().toLowerCase();
let result = inputToLowerCase[0].toUpperCase();
if(input.length>1){
result += inputToLowerCase.substring(1);
}
return result;
}// # capitalize()

/**
 * 
 * @param {any} value 
 */
isNull(value){
    if(!value){
        return true;
    }
    if(typeof value=='undefined' || value==undefined){
        return true;
    }
    if(value=='null' || value==null){
        return true;
    }
    if(value){
        return false;
    }
}

/**
 * 
 * @param {number} max 
 * @returns 
 */
getRandomInt(max=100) {
  return Math.floor(Math.random() * max);
}
/**
 * 
 * @param {object} o 
 * @returns 
 */
clone(o){
let serial = JSON.stringify(o);
return JSON.parse(serial);
}//   

/**
 * 
 * @param {boolean} show 
 */
getSpinner(show){
let spinner= this.pbu.query('#spinner');
if(show){
this.pbu.show(spinner);
}else{
this.pbu.hide(spinner);
}
}//

/**
 * 
 * @param {string} message 
 * @param {number} level 
 * @param {string} type 
 * @param {HTMLElement|null} customMessageDiv
 */
//s = status: default location
//v = validation
//mainNotification
notify(message,level,type='s',customMessageDiv=null){
// s=statusMessage, v=validationMessage
//validationMessage
//statusMessage
let notificationMessageDiv;
if(customMessageDiv){
    notificationMessageDiv = customMessageDiv;
}
else{
switch(type){
case 'm':
    notificationMessageDiv = document.querySelector('#mainNotification');
    break;
case 'd':
    notificationMessageDiv = document.querySelector('#dashboardNotification');
    break;
case 's':
    notificationMessageDiv = document.querySelector('#statusMessage');
    break;
// case 'c':
// notificationMessageDiv = customMessageDiv;
// break;
default :
    notificationMessageDiv = document.querySelector('#mainNotification');
}
}




//this.pbu.toggleClass(notificationMessageDiv,'text-success');

//let ALERT_TYPE = ["bg-success", "bg-warning", "bg-danger"];
let clasz;
if((level>=0) && (level<=2)){
clasz = this.config.ALERT_TYPE[level];
}else{
clasz = this.config.ALERT_TYPE[1];
}

// notificationMessageDiv.innerHTML = 
// `
// <div class="${clasz}">
// <p class="sp-alert"><strong>${message}</strong><button class="sp-btn btn btn-sm ms-2">X</button></p>
// </div>
// `;

notificationMessageDiv.innerHTML = `
<div class="container position-relative mt-2"> 
<div  class="${clasz} sp-alert alert alert-dismissible fade show role="alert">
<strong>${message}</strong> 
<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
</div>
`;



// this.pbu.listen(closeButton,'click',()=>{
//     notificationMessageDiv.innerHTML = '';
// });

}//;//?

/**
 * 
 * @param {boolean} serialize 
 */
getModalTemplate(serialize=false){
let div = this.main.pbu.createElement('div',['prompt-modal']);
div.innerHTML = 
`
<button id="promptModalTrigger" data-bs-toggle="modal" data-bs-target="#promptModal"></button>
<div class="modal fade" id="promptModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <p class="modal-notice"></p>
        <div class="modal-body">

        </div>
        <div class="modal-footer">
          <span id="modalButton"></span>
        </div>
      </div>
    </div>
  </div>
`;
return serialize?div.outerHTML:div;
}
/**
 * 
 * @param {string} title 
 * @param {string|HTMLElement} body 
 * @param {boolean} isView
 * @returns 
 */
setModal(title,body,isView=false){
let promptModalSection = document.querySelector('section#promptModalSection');
this.main.pbu.replace(promptModalSection,this.main.utils.getModalTemplate());
let promptModalTrigger = this.pbu.query('#promptModalTrigger');//<button>
//let promptModal = this.pbu.query('#promptModal');
let modalTitle = this.pbu.query('#promptModal .modal-title');//<h5>
let modalNotice = this.pbu.query('#promptModal .modal-notice');//<p> 
let modalBody = this.pbu.query('#promptModal .modal-body');//<div>
let modalDismiss = this.pbu.query('#promptModal .btn-close');

modalTitle.textContent = title;
modalBody.innerHTML = modalNotice.innerHTML = ''
if(body){
if(body=='blanc'){
    modalBody.innerHTML = '';
}else{
this.main.pbu.replace(modalBody,body);
}
}else{
    this.main.pbu.replace(modalBody,this.main.pbu.createFormControl({clasz:['sp-modal-input']}));
}

let input = modalBody?.querySelector('input.sp-modal-input');
let actionDiv = this.pbu.createElement('div',['mt-2']);
modalBody.appendChild(actionDiv);
let cancelButton = this.pbu.createElement('button',['btn','btn-primary','float-start'],'Cancel');
let confirmButton = this.pbu.createElement('button',['btn','btn-primary','float-end'],'OK');
this.pbu.appendChild(actionDiv,cancelButton,confirmButton);
//events
this.pbu.listen(modalDismiss,'click',()=>{;
promptModalSection.innerHTML = '';
});
//
this.pbu.listen(cancelButton,'click',()=>{
modalDismiss.click();
});
let modal = {
init:()=>{modalNotice.innerHTML = ''},
title:modalTitle,
notice:modalNotice,
body:modalBody?modalBody:null,
input:input,
confirm:confirmButton,
cancel:cancelButton,
dismiss:modalDismiss
};
promptModalTrigger.click();
return modal;
}//func


/**
 * 
 * @returns 
 */
getModal(){
/**@type {HTMLDivElement} */let div = this.pbu.createElement('div',['container','mt-2','position-absolute']);
div.style.width = '40vw';
let dataInput = this.pbu.query('#dataInput');
dataInput.innerHTML = '';
dataInput.appendChild(div);
let validationMessage = this.pbu.createElement('p',['d-none']);
let row = this.pbu.createElement('div',['row']);
this.pbu.appendChild(div,validationMessage,row);
let col1 = this.pbu.createElement('div',['col-8']);
let col2 = this.pbu.createElement('div',['col-2']);
let col3 = this.pbu.createElement('div',['col-2']);
this.pbu.appendChild(row,col1,col2,col3);
/**@type {HTMLInputElement} */let input = this.pbu.createElement('input',['form-control']);
col1.appendChild(input);
/**@type {HTMLButtonElement} */let saveButton = this.pbu.createButton('Save');
col2.appendChild(saveButton);
/**@type {HTMLElement} */let closeButton = this.pbu.createButton('X',['btn-sm']);
col3.appendChild(closeButton);
//
this.pbu.listen(closeButton,'click',()=>{
div.parentElement.removeChild(div);
});

return {
div:div,
input:input,
save:saveButton,
close:closeButton,
validationMessage:validationMessage,
};
}//func


/**
 * 
 * @param {string} element
 * @param {string[]} array 
 */
deleteItem(element,array){
let i = array.indexOf(element);
if(i >-1){
array.splice(i, 1);
}
}//func
/**
 * 
 * @param {string} title 
 * @param {any[]} item 
 * @returns
 */
getItemIdFromTitle(title,item){
/**@type {any|null}*/let id = null;
for(let i of item){
    if(i.title.toLowerCase()==title.toLowerCase()){
        id = i.id;
        break;
    }
}//for
return id;
}//func

/**
 * 
 * @param {string|number} id
 * @param {any[]} item 
 * @returns
 */
getItemTitleFromId(id,item){
/**@type {any|null}*/let title = null;
for(let i of item){
    if(i.id==id){
        title = i.title;
        break;
    }
}//for
return title;
}//func
/**
 * 
 * @param {string} element
 * @param {string[]} array 
 */
pop(element,array){
this.deleteItem(element,array)
}//func

}//class