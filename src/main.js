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
this.sitename = 'sentplat';
this.host = 'sentplat.com';
this.isSiteDomain = false;
this.isSite = false;
this.isSiteHome = false;
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
this.isSiteDomain = this.host=='localhost:5173' || this.host=='localhost:4173' || this.host=='sentplat.com';
let username;
if(this.isSiteDomain && (pathname=='' || pathname=='/')){
  this.isSiteHome = this.isSite = true;
  username = this.sitename;
}
//remove last string i.e '/'
if(pathname.endsWith('/')){
pathname = pathname.slice(0, -1);
}

if(pathname.startsWith('/app')){
this.handleAdmin(pathname,true);
}else{
this.handleView(true,pathname,username);
}

}//func
/**
 * 
 * @param {boolean} isInit 
 * @param {string} pathname
 * @param {string|null} username 
 */
handleView(isInit,pathname,username=null,){
this.navigate(this.getHomeState(isInit,pathname,username));
}//func

/**
 * 
 * @param {string} pathname 
 * @param {boolean} isInit
 */
handleAdmin(pathname,isInit){
let paths = pathname.split('/');
let length = paths.length;
let state,username;
 if(length==4){
  username = paths[2];
    if(paths[3]=='register'){
      state = {username:this.sitename,component:'register',url:'/app/register',isInit:isInit}; 
    }else{
      //this is for a tenant or its user to login from their site eg: app/sp/login 
    state = this.getLoginState(username,isInit);
    
    }

  }else if(length==7){
    //note: admin link starts with app so lenght is 6 as opposed to normal view which is 5
    state = this.getState(pathname,isInit);
  }else{
    //not found or home or login
    username=this.sitename
    state = this.getLoginState(username,isInit);
  }
  if(state.username==this.sitename){
    this.isSite = true;
  }
  this.navigate(state);
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
 * @param {any|null} state 
 * @param {any|null} responseJson
 */
nav404(state=null,responseJson = null){
let message = state?.message || "Something went wrong";
let div= this.pbu.createElement('div');
div.innerHTML=
`
<h3>Not Found</3>
<p>${message}</p>
`;
this.pbu.mount(div);
this.log( state?.responseJson,0,'Main.nav404(): responseJson');
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
                    this.navigate({component:'home',url:`${state.username}/404`,isView:true,
                      hasError:true,message:responseJson.message,responseJson:responseJson});
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
username : paths[2],
component : paths[3],
postType:paths[4],
type : paths[5],
id : Number(paths[6]),
url: pathname,
isInit:isInit,
isAdmin:true,
nextState:null
};
return state;
}//func

/**
 * 
 * @param {boolean} isInit
 * @param {string} pathname
 * @param {string} username
 */
getHomeState(isInit,pathname,username){
let title,id;
let archiveType = 's';
if(pathname=='/' || pathname==''){
username = this.sitename;
title = 'home';
id = 0;
}else{
let paths = pathname.split('/');
let length = paths.length;
username = paths[1];
if(length==2){//i.e localhost/sentplat
title = 'home';
id=0;
}else if(paths.length==4){//i.e localhost/sentplat/about/4
title = paths[2];
id = paths[3];
}else if(paths.length=5){//i.e localhost/sentplat/category/auto/4
archiveType = paths[2];
title = paths[3];
id = paths[4];
}
else{
  this.navigate({component:'home',url:`${username}/404`,isView:true,hasError:true});
}
}

let isHome = id==0;
let homeState = {
username:username,
host:this.host,
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
isInit:isInit,
nextState:null,
url:pathname,
href:window.location.href
};
if(homeState.username==this.sitename){
  this.isSite = true;
}
this.log(homeState,0,'Main.homeState(): homeState');
return homeState;
}//func

/**
 * 
 * @param {boolean} isInit
 * @param {string} pathname
 * @param {string} username
 */
getHomeState3(isInit,pathname,username){
let title,id;
let archiveType = 's';
if(this.isSiteDomain){
if(pathname=='/' || pathname==''){
username = this.sitename;
this.isSite = true;
title = 'home';
id = 0;
}else{
let paths = pathname.split('/');
let length = paths.length;
username = paths[1];
if(username==this.sitename){
  this.isSite = true;
}
if(length==2){//i.e localhost/sentplat
title = 'home';
id=0;
}else if(paths.length==4){//i.e localhost/sentplat/about/4
title = paths[2];
id = paths[3];
}else if(paths.length=5){//i.e localhost/sentplat/category/auto/4
archiveType = paths[2];
title = paths[3];
id = paths[4];
}
else{
  this.navigate({component:'home',url:`${state.username}/404`,isView:true,hasError:true,error:responseJson});
}
}

}else{
  //tenants have setup their domain or our site
  //no concept of username
username = (this.isSite)?this.sitename : 'sp';
if(pathname=='/' || pathname==''){
//i.e godlysensation.com
title = 'home';
id = 0;
}else{
let paths = pathname.split('/');
let length = paths.length;
//username = paths[1];
if(length==2){//i.e godlysensation.com/about
// not yet implemented
}else if(paths.length==3){//i.e godlysensation.com/about/4
title = paths[1];
id = paths[2];
}else if(paths.length=4){//i.e godlysensation.com/category/auto/4
archiveType = paths[1];
title = paths[2];
id = Number(paths[3]);
}
else{
  alert('handleView :not found');
}
}
}
let isHome = id==0;
let homeState = {
username:username,
host:this.host,
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
isInit:isInit,
nextState:null,
url:pathname,
href:window.location.href
};
this.log(homeState,0,'Main.homeState(): homeState');
return homeState;
}//func

/**
 * 
 * @param {string} username 
 * @param {string} title 
 * @param {number|string} id 
 * @returns 
 */
getHomeLink(username, title,id){
return  `/${username}/${title}/${Number(id)}`;
}//func

/**
 * 
 * @param {string} username 
 * @param {string} title 
 * @param {number} id 
 */
getHomeState2(username,title,id=0,archiveType='s'){
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

