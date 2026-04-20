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
this.pb = new PageBuilder(this,null);
this.pb.isView = true;
this.mh = new MediaHandler(this);
this.state = null;
this.cache = {};//important
this.viewCache = {};//
this.posts$ = null;
this.categories$ = null;
this.categoryTitles = null;
this.oldImageIds = [];
this.init();
//
}//
init(){
window.addEventListener('popstate', (e) => {
    e.preventDefault();
   if(e.state){
    console.log(e.state);
    e.state.isPop = true;
    e.state.isInit = false;
    this.navigate(e.state);
   }
});//

let pathname = window.location.pathname;
window.history.replaceState(null,'',pathname);
if(pathname=='/' || pathname==''){
  //isInit: application start
//this.navigate({component:'home',url:'/',isAdmin:false,isInit:true});
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
handleAdmin2(pathname,isInit){
let paths = pathname.split('/');
let loginState = {component:'login',url:'/app/login',isInit:isInit};
  if(paths.length==2){
    //ie. selplat.io/app
    this.navigate(loginState);
  }
  // dashboard/admin
  else if(paths.length==3){
    //eg: app/login or app/register
  let component = paths[2];
  this.navigate({component:component,url:`/app/${component}`,isInit:isInit});
  }else if(paths.length==7){
    //note: admin link starts with app so lenght is 6 as opposed to normal view which is 5
let nextState = this.getState(pathname,true);
if(this.spSid && this.spStp){
  //there may be a browser refresh
nextState.isInit = false;
this.navigate(nextState);
}else{
loginState.nextState = nextState;
this.navigate(loginState);
}
  }else{
    //not found or home or login
    alert('handleAdmin: not found');
  }
}//

/**
 * 
 * @param {string} pathname 
 * @param {boolean} isInit
 */
handleAdmin(pathname,isInit){
let paths = pathname.split('/');
let loginState = {component:'login',url:'/app/login',isInit:isInit};
  if(paths.length==2){
    //ie. selplat.io/app
    this.navigate(loginState);
  }
  // dashboard/admin
  else if(paths.length==3){
    //eg: app/login or app/register
  let component = paths[2];
  this.navigate({component:component,url:`/app/${component}`,isInit:isInit});
  }else if(paths.length==7){
    //recalculate uuid and set on request
    //note: admin link starts with app so lenght is 6 as opposed to normal view which is 5
let nextState = this.getState(pathname,true);
this.navigate(nextState);
// nextState.uuid = this.utils.getUUID();
// //loginState.nextState = nextState;
// let login = new Login(this,nextState);
// login.loginSession();
//getSession(this.utils.getUUID());
// if(session.spSid && session.spStp){
//   this.navigate(nextState);
// }else{
//   loginState.nextState = nextState;
//   this.navigate(loginState);
// }

//nextState.uuid = this.utils.getUUID();
//loginState.nextState = nextState;
//this.navigate(nextState);
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
if(state.cache){
  this.cache = state.cache;
}
switch(component){
case 'home':
new Home(this,state);
break;
case 'login':
this.login = new Login(this,state);
break;
case 'register':
this.register = new Register(this,state);
break;
case 'dashboard':
if(!this.dasboard){
this.dasboard = new Dashboard(this,state);
}
this.dasboard.state = state;
break;
case 'option':
case 'menu':
case 'user':
case 'category':
case 'post':
if(state.isAdmin){
if(!this.dasboard){
  let dashboardState = {component:'dashboard',username:state.username,isAdmin:true, url:`/app/${state.username}/dashboard/page/detail/0`};
  this.dasboard = new Dashboard(this,dashboardState);
  }
this.dasboard.mount(state);
}else if(state.isView){
  //firstly, use existing instance
  if(!this.post){
    this.post = new Post(this,state);
  }
  this.post.state = state;

  //check if its a 404 page
      if(state.hasError){
        await this.post.get404Page(state.error);
        return;
      }

      if(state.isInit){
        await this.post.getClientHome();
      }else if(state.isArchive){
        await this.post.getArchive();
      }else{
        await this.post.getPost();
      }
}

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
if(state.isRoot){
console.error(`#Code: ${state.err.code} #Message: ${state.err.message} #detailedMessage: ${state.err.detailedMessage}`);
}

}//func

/**
 * 
 * @param {any} responseJson 
 * @param {any} state
 */
handleError(responseJson,state){
  if(import.meta.env.MODE=='development'){
    console.error(responseJson.errorMessage);
  }
switch (Number(responseJson.id)){
                case 401:
                    //Unauthorized
                    break;
                case 403:
                    //
                    break;
                case 404:
                    //Guest
                    this.navigate({component:'post',url:`${state.username}/404`,isView:true,hasError:true,error:responseJson});
                    break;
                    case 804:
                    //Not Deleted
                    this.utils.notify(responseJson.message,1,'d');
                    break;
                case 805:
                    //Session timedout
                    let loginState = {component:'login',url:'/app/login',nextState:state};
                    this.navigate(loginState);
                    this.utils.notify(responseJson.message,1,'m');
                    break;
                case 806:
                    //Limit Exceeded
                    this.utils.notify(responseJson.message,1,'d');
                    break;
                    case 811:
                    //Record exists
                    this.utils.notify(responseJson.message,1,'m');
                    break;
                default:
                    this.utils.notify(responseJson.message,2,'m');
            }//
            throw new Error();
}//func

/**
 * 
 * @param {string} name 
 */
setTheme(name){
let theme = this.config.THEMES[name.toLowerCase()];
for (let property in theme) {
    document.documentElement.style.setProperty(property, theme[property]);
  }
}

async setPosts(){
if(!this.posts$){
let state = this.utils.clone(this.state);
state.type = 'list';
state.postType = 'post';
state.isAdmin = false;
state.isGuest = true;
state.isMainPost = true;
state.link = this.fu.getApi(state.username,false)+ `/home/posts/post`;
let r = await this.fu.fetch(state);
  if(r){
    this.posts$ = r.posts;
    this.categories$ = r.categories;
    this.categoryTitles = this.categories$.map(c=>c.title);
  }
}
  this.posts$ = this.posts$.filter(p=>p.contentStatus=='PUBLISH');

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
component:'post',
url:isHome?`/${username}`:`/${username}/${title}/${id}`,
href:'',
type:'detail',
postType:'page',
archiveType:archiveType,
isArchive:archiveType!='s',
title:title,
id:Number(id),
isHome:isHome,
isView:true,
isInit:false,
nextState:null
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
 * @param {string} username 
 * @param {string} title 
 * @param {number} id 
 */
getHomeState2(username,title,id=0){
let isHome = id==0;
let homeState = {
username:username,
component:'post',
url:isHome?`/${username}`:`/${username}/${title}/${id}`,
type:'detail',
postType:'page',
archiveType:'s',
title:title,
id:Number(id),
isHome:isHome,
isView:true,
isInit:false,
nextState:null
};
return homeState;
}//func

}//class
var app = new Main();

