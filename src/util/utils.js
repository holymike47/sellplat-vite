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
}

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
 * @param {HTMLInputElement} input 
 * @param {boolean} isView 
 */
async searchPosts(input,isView){
let $this = this;
let form = input.closest('form.search-post');
let searchTerm = input.value;
if(!searchTerm){
let div = form.querySelector('.sp-div');
div?.remove();
}
searchTerm = searchTerm.trim().toLowerCase();
if(searchTerm.length<2){
return;
}
await this.main.setPosts();
//let regex = new RegExp(`${searchTerm}`, "i");
   let displayPosts = $this.main.posts$.filter(p=>p.title.toLowerCase().includes(searchTerm));
    //let displayPosts = this.main.posts$.filter(p=>regex.test(p.title));
        if(displayPosts && displayPosts.length>0){
            form.querySelector('.sp-div')?.remove();
            /**@type {HTMLElement}*/ let div = $this.main.pbu.createElement('div',['position-absolute','sp-div']);
                div.style.zIndex = '2001';
                div.innerHTML = 
                `
                <ul class="list-group mt-2 post-selected" style="cursor: pointer;">
                </ul>
                `;
        let postSelectedList = div.querySelector('ul.post-selected');
        for(let p of displayPosts){
          //getHomeState(username,title,id=0,archiveType='s')
        let state = $this.main.getHomeState(p.username,p.title,p.id,'s');
        let li = $this.main.pbu.createElement('li',['list-group-item'],`${p.title} (${p.postType})`,[{n:'data-url',v:state.url}]);
        postSelectedList.appendChild(li);
        //
        $this.main.pbu.listen(li,'click',()=>{
            let url = li.getAttribute('data-url');
            if(isView){
                $this.main.handleView(url,false);
            }else{
                input.value= $this.main.config.HOSTNAME + url;
            }
          div.remove();
        });
      }
      let rect = input.getBoundingClientRect();
      div.style.left =  "0px";
      //div.style.left = rect.left + "px";
      if(isView){
        div.style.top =  rect.bottom  + "px";
      }
     
     form.appendChild(div);
      //
      $this.main.pbu.listen(input,'blur',(e)=>{
        if(e.rangeParent.parentElement.nodeName=='LI'){
            return;
        }
        div?.remove();
      });
        }

        
}//func

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
default :
    notificationMessageDiv = document.querySelector('#mainNotification');
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
 * @param {string} title 
 * @param {string|HTMLElement} body 
 * @returns 
 */
setModal(title,body){
let promptModalTrigger = this.pbu.query('#promptModalTrigger');//<button>
//let promptModal = this.pbu.query('#promptModal');
let modalTitle = this.pbu.query('#promptModal .modal-title');//<h5>
let modalBody = this.pbu.query('#promptModal .modal-body');//<div>
let modalDismiss = this.pbu.query('#promptModal .btn-close');

modalTitle.textContent = title;
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
let cancelButton = this.pbu.createElement('button',['btn','float-start'],'Cancel');
let confirmButton = this.pbu.createElement('button',['btn','float-end'],'OK');
this.pbu.appendChild(actionDiv,cancelButton,confirmButton);

this.pbu.listen(cancelButton,'click',()=>{
modalDismiss.click();
});
let modal = {
title:modalTitle,
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
 * @param {any[]} array 
 * @returns
 */
getItemIdFromTitle(title,array){
/**@type {any|null}*/let id;
for(let arr of array){
    if(arr.title.toLowerCase()==title.toLowerCase()){
        id = arr.id;
        break;
    }
}//for
return id;
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