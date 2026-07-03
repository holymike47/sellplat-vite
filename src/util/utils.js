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
 * @param {number} length 
 * @returns 
 */
getUUID(length){
let uuid = `${crypto.randomUUID()}`;
if(length){
    uuid = uuid.substring(0,length);
}
return uuid
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
let jsonString = JSON.stringify(value);
let base64String = btoa(jsonString);
localStorage.setItem(name,base64String);
this.main.log(base64String,0,'User data saved');
}//func

/**
 * 
 * @param {string} name 
 * @returns 
 */
getCache(name){
    let base64String = localStorage.getItem(name);
    let jsonString = atob(base64String);
    let data = JSON.parse(jsonString);
    this.main.log(data,0,'User data retrieved from storage');
    return data;
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
}//

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
 * @param {string} message 
 * @param {number} level 
 * @param {string} type 
 * @param {HTMLElement|null} customMessageDiv
 */

//mainNotification
notify(message,level,type='m',customMessageDiv=null){
let clasz;
let fixedClass = (type=='s')?'fixed-bottom':'fixed-top';
if((level>=0) && (level<=2)){
clasz = this.config.ALERT_TYPE[level];
}else{
clasz = this.config.ALERT_TYPE[1];
}
let notificationMessageDiv = document.querySelector('#mainNotification');
if(customMessageDiv){
    notificationMessageDiv = customMessageDiv;
    fixedClass = '';
}
notificationMessageDiv.innerHTML = `
<div class="position-relative mt-2"> 
<div  class="${clasz} ${fixedClass} text-center mt-2 mx-auto w-50 sp-alert alert alert-dismissible fade show role="alert">
<strong>${message}</strong> 
<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
</div>
`;
}//func

/**
 * 
 * @param {string} title 
 * @param {string|HTMLElement} body 
 * @param {boolean} isView
 * @returns 
 */
setModal(title,body,isView=false){
let promptModalSection = document.querySelector('section#promptModalSection');

this.main.pbu.replace(promptModalSection,this.main.tu.getModalTemplate());
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
let i = array.indexOf(element);
if(i >-1){
array.splice(i, 1);
}
}//func

}//class