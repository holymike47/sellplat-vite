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
import { Login } from './component/login.js';
import { Register } from './component/register.js';
import { Dashboard } from './component/dashboard.js';
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
this.siteDomains = ['localhost:5173','localhost:4173','senplat.com','sp.senplat.com','sp2.senplat.com'];
this.sitename = 'senplat';
this.siteDomain = 'senplat.com';
this.host = 'senplat.com';
this.username = '';
this.isSiteDomain = false;
this.isSite = false;
this.isSiteHome = false;
this.isInit = false;
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
this.host = window.location.host;
//this.host='godlysensation.senplat.com';
this.log(this.host,0,'Main.init(): host');
this.isSite = this.host == this.siteDomain;
this.isSiteDomain = this.host.endsWith('senplat.com');
if(this.isSiteDomain){
  if(this.isSite){
      //root or =
      this.username = this.sitename;
  }else{
    this.username = this.host.split('.')[0];
  }
}else{
    this.username = this.host;
}

// if(this.isDev()){
// this.username = 'sp';
// }

this.isInit = true;
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
 * @param {string} pathname
 * @param {boolean} isInit  
 */
handleView(pathname,isInit){
this.navigate(this.getHomeState(pathname,isInit));
}//func

/**
 * 
 * @param {string} pathname 
 * @param {boolean} isInit
 */
handleAdmin(pathname,isInit){
let paths = pathname.split('/');
let length = paths.length;
let state;
 if(length==3){
  //eg: senplat.com/app/login 
    if(paths[2]=='register'){
      state = {component:'register',url:pathname,isInit:isInit}; 
    }else{
      //this is for a tenant or its user to login from their site eg: app/login 
    state = this.getLoginState(isInit);
    
    }

  }else if(length==6){
    //note: admin link starts with app so lenght is 6 as opposed to normal view which is 5
    state = this.getState(pathname,isInit);
  }else{
    //not found or home or login
    state = this.getLoginState(isInit);
  }
  this.navigate(state);
}//

/**
 * 
 * @param {Event|string} input - Event or pathname
 * @param {boolean} isInit
 * @returns 
 */
getState(input,isInit=false){
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
//note: path[1] = app
let state =
{
username : this.username,
component : paths[2],
postType:paths[3],
type : paths[4],
id : Number(paths[5]),
url: pathname,
isInit:isInit,
isAdmin:true,
nextState:null
};
return state;
}//func

/**
 * 
 * @param {string} pathname 
 * @param {boolean} isInit 
 * @returns 
 */
getHomeState(pathname,isInit){
let postType = 'page';
let archiveType = 's';
let title,id;
if(pathname=='/' || pathname==''){
title = 'home';
id = 0;
}else{
let paths = pathname.split('/');
let length = paths.length;
if(length==5){//i.e localhost/page/s/about/4
postType = paths[1];
archiveType = paths[2];
title = paths[3];
id = paths[4];
}else{
  this.navigate({component:'home',url:`${this.username}/404`,isView:true,hasError:true});
}
}
let homeState = {
username:this.username,
component:'home',
type:'detail',
postType:postType,
archiveType:archiveType,
isArchive:archiveType!='s',
title:title,
id:Number(id),
isHome:id==0,
isView:true,
isInit:isInit,
nextState:null,
url:pathname,
};
this.log(homeState,0,'Main.homeState(): homeState');
return homeState;
}//func
/**
 * @param {string} postType
 * @param {string} archiveType
 * @param {string} title 
 * @param {number|string} id 
 * @returns 
 */
getHomeLink(postType,archiveType,title,id){
return  `/${postType}/${archiveType}/${title}/${Number(id)}`;
}//func

/**
 * 
 * @param {string} component 
 * @param {string} postType 
 * @param {string} type 
 * @param {number|string} id 
 * @returns 
 */
getLink(component,postType='page',type='detail',id=0){
return  `/app/${component}/${postType}/${type}/${Number(id)}`;
}//func

/**
 * 
 * @param {HTMLAnchorElement} link 
 */
makeLink(link){
this.pbu.listen(link,'click',(e)=>{
e.preventDefault();
let pathname = link.pathname;
if(pathname.startsWith('/app')){
this.handleAdmin(pathname,false);
}else{
this.handleView(pathname,false);
}
})
}
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
await this.home.get404Page(state.message,state.responseJson);
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
  let dashboardState = this.getState(this.getLink('dashboard'),false);
  this.dasboard = new Dashboard(this,dashboardState);
  }
this.dasboard.mount(state);
break; 
}//switch
//finally
if(state.isPop){//??
//do nothing
}else{
this.pushState(state);
}
}//func

/**
 * 
 * @param {any} message 
 * @param {string} title
 * @param {number} level 
 * @param {boolean} save - wether to save to backend
 */
log(message,level=0,title='Log Title',save=false){
//if(import.meta.env.MODE=='development'){  
if(true){
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
                    this.navigate({component:'home',url:'page/404',isView:true,hasError:true,message:responseJson.message,responseJson:responseJson});
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
 * @param {*} isInit 
 * @returns 
 */
getLoginState(isInit,nextState=null){
let loginState = {component:'login',url:'/app/login',isInit:isInit,nextState:nextState};
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

isDev(){
return import.meta.env.MODE=='development';
}//func

/**
 * 
 * @param {HTMLElement} component 
 */
addRouteEvents(component){
let links = component.querySelectorAll('a.sp-route-link');
for(let link of links){
  this.pbu.listen(link,'click',(e)=>{
    e.preventDefault();
    let isInit = link.classList.contains('sp-slug-link');
    if(link.classList.contains('sp-admin')){
      this.handleAdmin(link.pathname,isInit);
    }else if(link.classList.contains('sp-detail')){
    this.handleView(link.pathname,isInit);
    }
  });
}
}//func

}//class
var app = new Main();

