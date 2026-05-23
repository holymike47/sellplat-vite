// @ts-check
import '/node_modules/bootstrap/dist/css/bootstrap.min.css';
import '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';//??
import '/node_modules/bootstrap-icons/font/bootstrap-icons.min.css';
import '/node_modules/intl-tel-input/build/css/intlTelInput.min.css';
import './style.css';
import './sp.css';
import intlTelInput from 'intl-tel-input';
import { config} from './config/config.js';
import { Utils } from './util/utils.js';
import { PbUtils } from './util/pb-utils.js';
import { FetchUtils } from './util/fetch-utils.js';
import {ValidationUtils} from './util/validation-utils.js';
import { TemplateUtils } from './util/template-utils.js';
import { Home } from './component/home.js';
import { Post } from './component/post.js';
import { Login } from './component/login.js';
import { Register } from './component/register.js';
import { Dashboard } from './component/dashboard.js';
import { PageBuilder } from './component/page-builder.js';
import { MediaHandler } from './component/media-handler.js';
import { th } from 'intl-tel-input/i18n';

class Main{
constructor(){
this.intlTelInput = intlTelInput;
this.config = config;
this.utils = new Utils(this);//??
this.pbu =  new PbUtils(this);
this.fu = new FetchUtils(this);
this.vu = new ValidationUtils(this);
this.tu = new TemplateUtils(this);
// this.pb = new PageBuilder(this,null);
// this.pb.isView = true;
this.mh = new MediaHandler(this);
this.oldImageIds = [];
this.state = null;

this.init();
//
}//
init(){
window.addEventListener('popstate', (e) => {
    e.preventDefault();
   if(e.state){
    this.log(e.state,0,'Main.init(): popstate - evt.state');
    e.state.isPop = true;
    e.state.isInit = false;
    this.navigate(e.state);
   }
});//

let pathname = window.location.pathname;
window.history.replaceState(null,'',pathname);
if(pathname=='/' || pathname==''){
//isInit: application start
let homeState = this.getHomeState('sellplat','home',0);
homeState.isInit = true;
this.navigate(homeState);
return;
}
  //remove last string i.e '/'
if(pathname.endsWith('/')){
pathname = pathname.slice(0, -1);
}

if(pathname.startsWith('/app')){
this.handleAdmin(pathname,true);
}else{
this.handleView(pathname,true);
}

}//func
/**
 * 
 * @param {string} pathname 
 * @param {boolean} isInit
 */
handleView(pathname,isInit){
let paths = pathname.split('/');
let length = paths.length;
let username,archiveType,title,id;
username = paths[1];
let homeState;
if(length==2){//i.e localhost/sellplat
title = 'home';
homeState = this.getHomeState(username,title,0);
}else if(paths.length==4){//i.e localhost/sellplat/about/4
title = paths[2];
id = Number(paths[3]);
homeState = this.getHomeState(username,title,id);
}else if(paths.length=5){//i.e localhost/sellplat/category/auto/4
archiveType = paths[2];
title = paths[3];
id = Number(paths[4]);
homeState = this.getHomeState(username,title,id,archiveType);
}
else{
  alert('handleView :not found');
}
if(homeState){
homeState.isInit = isInit;
this.navigate(homeState);
}
}//

/**
 * 
 * @param {string} pathname 
 * @param {boolean} isInit
 */
handleAdmin(pathname,isInit){
let paths = pathname.split('/');
let loginState,username;
  if(paths.length==2){
    //ie. sellplat.io/app
    username = 'sellplat';
    loginState = this.getLoginState(username,isInit);
    this.navigate(loginState);
  }
  // dashboard/admin
  else if(paths.length==3){
    //eg: app/login or app/register
  let component = paths[2];
  if(component=='register'){
    this.navigate({component:'register',url:'/app/register',isInit:isInit});
  }else{
    username = 'sellplat';
    loginState = this.getLoginState(username,isInit);
    this.navigate(loginState);
  }
  
  }else if(paths.length==4 && paths[3]=='login'){
    //this is for a tenant or its user to login from their site eg: app/sp/login 
    username = paths[2];
    loginState = this.getLoginState(username,isInit);
    this.navigate(loginState);
  }else if(paths.length==7){
    //recalculate uuid and set on request
    //note: admin link starts with app so lenght is 6 as opposed to normal view which is 5
let nextState = this.getState(pathname,true);
this.navigate(nextState);
  }else{
    //not found or home or login
    alert('handleAdmin: not found');
  }
}//

/**
 * 
 * @param {Event|any} state 
 */
async navigate(state){
this.state = state;
let component = state.component;
switch(component){
case 'home':
this.home = this.home || new Home(this,state);
this.home.state = state;
//check if its a 404 page
if(state.hasError){
await this.home.get404Page(state.error);
return;
}

if(state.isInit){
await this.home.getClientHome();
}else if(state.isArchive){
this.home.getArchive();
}else{
this.home.getPost();
}
break;
case 'login':
new Login(this,state);
break;
case 'register':
new Register(this,state);
break;
case 'dashboard':
this.dasboard = new Dashboard(this,state);
break;
case 'option':
case 'menu':
case 'user':
case 'category':
case 'post':
if(!this.dasboard){
  //let dashboardState = {component:'dashboard',username:state.username,isAdmin:true, url:`/app/${state.username}/dashboard/page/detail/0`};
  let dashboardState = this.getState(`/app/${state.username}/dashboard/page/detail/0`,true);
  this.dasboard = new Dashboard(this,dashboardState);
  }
this.dasboard.mount(state);
break; 
case '404':
this.nav404(state);
break;
}//switch
//finally
if(state.isPop || state.isInit){//??
//do nothing
}else{
this.pushState(state);
}
}//func

/**
 * 
 * @param {any} state 
 */
nav404(state){
let errorMessage = state.err.message || "Something went wrong";
let div= this.pbu.createElement('div');
div.innerHTML=
`
<h3>Not Found</3>
<p>${errorMessage}</p>
`;
let replace = this.pbu.query('#replace');
this.pbu.replace(replace,div);
this.log(`#Code: ${state.err.code} #Message: ${state.err.message} #detailedMessage: ${state.err.detailedMessage}`,0,'Main.nav404(): Resource not found');
}//func

/**
 * 
 * @param {any} message 
 * @param {string} title
 * @param {number} level 
 * @param {boolean} save - wether to save to backend
 */
log(message,level=0,title='Log Title',save=false){
if(import.meta.env.MODE=='development'){
console.log(title);
if(level==0){
  console.log(message);
}else if(level==1){
  console.warn(message);
}else{
  console.error(message);
}
if(save){
  //send 
}
}else{
  //in prod
  if(save){
    //send
  }
}


}//func

/**
 * 
 * @param {any} responseJson 
 * @param {any} state
 */
handleError(responseJson,state){
this.log(responseJson,0,'Main.handleError(): Response with error');
let errorCode = Math.abs(Number(responseJson.id));
let modalNotice;
if(state.isModal){
  modalNotice = this.pbu.query('#promptModal .modal-notice');
}
switch (errorCode){
                case 401://Unauthorized
                case 403:
                case 807://forbidden
                    break;
                case 404://Guest
                    this.navigate({component:'home',url:`${state.username}/404`,isView:true,hasError:true,error:responseJson});
                    return;
                    case 804://Not Deleted
                    break;
                case 805://Session timedout
                case 405://not authenticated
                    this.navigate(this.getLoginState(state.username,false,state));
                    break;
                case 806://Limit Exceeded
                    break;
                    case 811://Record exists
                    break;
            }//
            this.utils.notify(responseJson.message,1,'m',modalNotice);
            throw new Error();
}//func

/**
 * 
 * @param {any} option 
 */
async setTheme(option){
let theme = this.config.THEMES[option.activeTheme.toLowerCase()];
for (let property in theme) {
    document.documentElement.style.setProperty(property, theme[property]);
  }
  if(option.iconUrl){
    let icon = document.querySelector("link[rel='icon']");
    icon.href = this.mh.getImageUrl(option.iconUrl,'public')  + "?v=" + Date.now();;
  }
  
}//func
/**
 * 
 * @param {any} state 
 */
pushState(state){
if(!state.url.startsWith('/')){
state.url = '/'+state.url;
}
window.history.pushState(state,'',state.url);
}//func
/**
 * 
 * @param {any} o 
 * @param {any} state 
 * @param {number} r
 */
replaceState(o,state,r){
if(!state.url.startsWith('/')){
state.url = '/'+state.url;
}
if(state.id==-1 && state.type=='new'){
o.id = state.id = r;
state.type = 'edit';
state.url = `/app/${state.username}/${state.component}/${state.postType}/edit/${r}`;
}
window.history.replaceState(state,'',state.url);
return state;
}//func
/**
 * 
 * @param {Event|string} input - Event or pathname
 * @param {boolean} isAdmin
 * @returns 
 */
getState(input,isAdmin=true){
let pathname;
if(input instanceof Event){
let el = input.target;
let url = new URL(el.href);
pathname = url.pathname;
}else{
    pathname = input;
}
let paths = pathname.split('/');//check url segments
//note: path[0] returns an empty string
let state;

if(isAdmin){
//note: path[1] = app
state =
{
username : paths[2],
component : paths[3],
postType:paths[4],
type : paths[5],
id : Number(paths[6]),
url: pathname,
isInit:false,
isAdmin:true,
isRoot:false,
nextState:null
};
}else{
let isArchive;
if(paths[4]=='s'){
isArchive=false;
}else{
  isArchive = true;
}
state =
{
username : paths[1],
component: paths[2],
postType : paths[3],
archiveType:paths[4],
title:paths[5],
id : Number(paths[6]),
postId : Number(paths[6]),
type : 'detail',
isArchive:isArchive,
url: pathname,
isInit:false,
isAdmin:false,
isRoot:false,
nextState:null
};
}
return state;
}//func

/**
 * 
 * @param {string} username 
 * @param {string} title 
 * @param {number} id 
 */
getHomeState(username,title,id=0,archiveType='s'){
let isHome = id==0;
let homeState = {
username:username,
component:'home',
type:'detail',
postType:'page',
archiveType:archiveType,
isArchive:archiveType!='s',
title:title,
id:Number(id),
isHome:isHome,
isView:true,
isGuest:true,
isInit:false,
nextState:null,
url:'',
href:''
};
if(isHome){
  homeState.url = `/${username}`;
}else if(archiveType=='s'){
  homeState.url = `/${username}/${title}/${id}`;
}else {
  homeState.url = `/${username}/${archiveType}/${title}/${id}`;
}
homeState.href = this.config.HOSTNAME + homeState.url;
return homeState;
}//func

/**
 * 
 * @param {*} username 
 * @param {*} isInit 
 * @returns 
 */
getLoginState(username,isInit,nextState=null){
let loginState = {component:'login',username:username,url:`/app/${username}/login`,isInit:isInit,nextState:nextState};
return loginState
}//func

/**
 * 
 * @param {HTMLInputElement} input 
 * @param {boolean} isView 
 * @param {any[]} items 
 * @param {string} type 
 * @returns 
 */
async autoComplete(input,isView,items,type='post'){
let form = input.closest('form.auto-complete');
let searchTerm = input.value;
if(!searchTerm){
//dynamically created, populated with search
let div = form.querySelector('.sp-div');
div?.remove();
}
if(!this.vu.sanitize([input])){
    return;
}
if(searchTerm.length<2){
return;
}

        if(items && items.length>0){
            form.querySelector('.sp-div')?.remove();
           let div = this.pbu.createElement('div',['position-absolute','sp-div']);
                div.style.zIndex = '2001';
                div.innerHTML = 
                `
                <ul class="list-group mt-2 item-selected" style="cursor: pointer;">
                </ul>
                `;
        let selectedList = div.querySelector('ul.item-selected');
        let li;
        for(let i of items){
            if(type=='post'){
                let state = this.getHomeState(i.username,i.title,i.id,'s');
               li = this.pbu.createElement('li',['list-group-item'],`${i.title} (${i.postType})`,[{n:'data-url',v:state.url}]);
            }else{
                li = this.pbu.createElement('li',['list-group-item'],`${i}`);
            }
        
        selectedList.appendChild(li);
        //event
        this.pbu.listen(li,'click',()=>{
            if(type=='post'){
                let url = li.getAttribute('data-url');
            if(isView){
                this.handleView(url,false);
            }else{
                input.value= this.config.HOSTNAME + url;
            }
            }else{
                input.value = li.textContent;
            }
            
          div.remove();
        });
      }
      
     form.appendChild(div);
      //
      this.pbu.listen(input,'blur',(e)=>{
        if(e.rangeParent.parentElement.nodeName=='LI'){
            return;
        }
        div?.remove();
      });
        }

        
}//func

}//class
var app = new Main();

