// @ts-check
import { Option } from "./option";
import { Menu } from "./menu";
import { User } from "./user";
import { Category } from "./category";
import { Post } from "./post";
import { th } from "intl-tel-input/i18n";
export class Dashboard{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main, state){
this.main = main;
this.state = state;
this.adminUser = this.main.utils.getCache('user');
this.option = this.main.utils.getCache('option');
this.isTenant = this.adminUser?.topRole == 'ADMIN';
///
this.child = null;
this.idsToDelete = [];

document.title = "Dashboard";

this.getTemplate();
}//

getTemplate(){
let $this = this;
//this.promptModalSection = this.dashboardComponent.querySelector('section.promptModalSection');

///
this.dashboardComponent = this.main.pbu.createElement('main',['dashboard-component']);
this.dashboardComponent.innerHTML = 
`
<main class="dashboard position-relative dashboard-component container-fluid p-0">
        <header class="navbar sticky-top bg-dark flex-md-nowrap p-0 shadow" data-bs-theme="dark">
  <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 text-white" href="/${this.state.username}">${this.state.username}</a>

  <ul class="navbar-nav flex-row d-md-none">
    <li class="nav-item text-nowrap">
      <button class="nav-link px-3 text-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSearch" aria-controls="navbarSearch" aria-expanded="false" aria-label="Toggle search">
        <svg class="bi"><use xlink:href="#search"/></svg>
      </button>
    </li>
    <li class="nav-item text-nowrap">
      <button class="nav-link px-3 text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
        <svg class="bi"><use xlink:href="#list"/></svg>
      </button>
    </li>
  </ul>

  <div id="navbarSearch" class="navbar-search w-100 collapse">
    <input class="form-control w-100 rounded-0 border-0" type="text" placeholder="Search" aria-label="Search">
  </div>
</header>

<div class="container-fluid">
  <div class="row">
    <div class="sidebar border border-right col-md-2 col-lg-2 p-0 bg-body-tertiary">
      <div class="offcanvas-md offcanvas-end bg-body-tertiary" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="sidebarMenuLabel">Company name</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
          <ul class="nav flex-column sp-admin-menu">
           
          </ul>


          <hr class="my-3">

          <ul class="nav flex-column mb-auto">
            <li class="nav-item">
              <a id="signout" type="button" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-person"></i>
                Sign out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <main class="col-md-10 ms-sm-auto col-lg-10 px-md-4">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h3>Dashboard<span class="m-x sp-component-title"></span></h3>
      </div>

      <div id="dashboardReplace">
  
      </div>
    </main>
	 
</div>
  </div>
</div>

<section id="promptModalSection"></section>
</main>
`;
this.replace = this.main.pbu.query('#replace');
this.main.pbu.replace(this.replace,this.dashboardComponent);
this.dashboardReplace =  this.dashboardComponent.querySelector('#dashboardReplace');
this.signoutLink = this.dashboardComponent.querySelector('a#signout');
this.adminMenu = this.dashboardComponent.querySelector('ul.sp-admin-menu'); 
this.componentTitle = this.dashboardComponent.querySelector('span.sp-component-title');

//getLink(component,postType='page',type='detail',id=0)
this.main.getLink('menu','page','list',0);
let adminMenuItems = [
{name:'Dashboard',url:this.main.getLink('dashboard'),icon:'bi-menu-button'},
{name:'Settings',url:this.main.getLink('option'),icon:'bi-menu-button',isTenant:true},
{name:'Menu',url:this.main.getLink('menu','page','list',0),icon:'bi-menu-button',isTenant:true},
{name:'Users',url:this.main.getLink('user','page','list',0),icon:'bi-person',isTenant:true},
{name:'Pages',url:this.main.getLink('post','page','list',0),icon:'bi-person',isTenant:true},

{name:'Posts',url:'#',icon:'bi-person',children:
[{name:'All Posts',url:this.main.getLink('post','post','list',0),icon:'bi-person'},{name:'Categories',url:this.main.getLink('category','post','list',0),icon:'bi-person'}]},

{name:'Products',url:'#',icon:'bi-person',children:
[{name:'All Products',url:this.main.getLink('post','product','list',0),icon:'bi-person'},{name:'Categories',url:this.main.getLink('category','product','list',0),icon:'bi-person'}]},

];

if(! this.isTenant){
  adminMenuItems = adminMenuItems.filter(m=>! m.isTenant);
}

for(let m of adminMenuItems ){
let li = this.main.pbu.createElement('li',['nav-item']);
li.innerHTML = `<a type="button" href="${m.url}" class="sp-route-link sp-admin nav-link d-flex align-items-center gap-2><i class="bi ${m.icon}"></i>${m.name}</a> `;
  if(m.children){
li.innerHTML = `<a type="button"  class="px-0 nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi ${m.icon}"></i>${m.name}</a>`;
    this.main.pbu.addClass(li,['dropdown']);
    let subUl = this.main.pbu.createElement('ul',['dropdown-menu']);
    li.appendChild(subUl);
    for(let c of m.children){
      this.main.pbu.appendChild(subUl,`<li><a type="button" href="${c.url}" class="dropdown-item sp-route-link sp-admin nav-link" ><i class="bi ${c.icon}"></i>${c.name}</a></li>`);
    }
  }
  this.main.pbu.appendChild(this.adminMenu,li);
}
///
addEvents();
//finally
function addEvents(){
$this.main.addRouteEvents($this.dashboardComponent); 
$this.main.pbu.listen($this.signoutLink,'click',async(e)=>{
e.preventDefault();
let state = $this.main.utils.clone($this.state);
state.link = $this.main.fu.getApi('/app/logout');
state.method = 'POST';
let r = await $this.main.fu.fetch(state);
if(r==true){
localStorage.clear();
$this.main.navigate($this.main.getLoginState($this.state.username,false));
window.location.reload();
}
});
}//inner
}//func

/**
 * 
 * @param {HTMLElement} component 
 */
addRouteEvents(component){
this.main.addRouteEvents(component);
//MASS ACTION
this.tb = this.main.pbu.query('tbody.mass-action');
if(this.tb){
//MASS ACTION
this.massDeleteButton = this.main.pbu.query('#massDeleteButton');
this.main.pbu.listen(this.massDeleteButton,'click',async()=>{
await this.deleteItems(this.idsToDelete);
this.main.pbu.hide(this.massDeleteButton);
});
//
let deleteLinks = this.tb.querySelectorAll('a.sp-delete[data-pid]');
for(let l of deleteLinks){
this.main.pbu.listen(l,'click',async ()=>{
let id = Number(l.getAttribute('data-pid'));
this.idsToDelete = [id];
await this.deleteItems(this.idsToDelete);
});
}
//
let toDeleteInputs = this.tb.querySelectorAll('[data-pid]');
for(let input of toDeleteInputs){
this.main.pbu.listen(input,'change',(e)=>{
let el = e.target;
let id = Number(el.getAttribute('data-pid'));
if(el.checked){
if(this.idsToDelete.includes(id)){
    return;
}else{
    this.idsToDelete.push(id);
}
}else{
    //not checked
this.main.utils.pop(id,this.idsToDelete);
}
//
if(this.idsToDelete.length>0){
this.main.pbu.show(this.massDeleteButton);
}else{
this.main.pbu.hide(this.massDeleteButton);
}
});
}//for
//
}//for
}//func


/**
 * 
 * @param {any} state 
 */
async mount(state){
//reset media ids 
this.main.media.resetMediaIds();
this.main.log(this.main.media.oldMediaIds,0,'Dashboard.mount(): oldMediaIds reset');
let template = await this.process(state);
this.main.pbu.replace(this.dashboardReplace,template);
this.addRouteEvents(template);
this.componentTitle.textContent = ` - ${this.main.utils.capitalize(state.component)} - ${this.adminUser.topRole}`;
}//func


/**
 * 
 * @param {any} child 
 * @param {any} state
 */
setChild(child,state){
this.child = child;
this.child.state = state;//important, otherwise old state of object will be used when reusing object
this.child.parent = this;
}//func

/**
 * 
 * @param {any} state 
 * @returns 
 */

async process(state){
if(! state.stateObject){
state.link = this.main.fu.getApi(state.url);
state.stateObject = await this.main.fu.fetch(state);
}
this.main.log(state.stateObject,0,`${this.state.component}.process(): stateObject`);
  switch(state.component){
    case 'option':
      //avoid conflict with class member
      let option = new Option(this.main,state);
      this.setChild(option,state);
      break;
/// ########## MENU ##############
    case 'menu':
    this.menu = this.menu || new Menu(this.main,state);
    this.setChild(this.menu,state);
    break;
    case 'user':
/// ########## USER ##############
  this.user = this.user || new User(this.main,state);
  this.setChild(this.user,state);
  break;
 /// ########## CATEGORY ##############
    case 'category':
     this.category = this.category || new Category(this.main,state);
      this.setChild(this.category,state);
      break;
     /// ########## POST ##############
    case 'post':
    this.post= this.post || new Post(this.main,state);
    this.setChild(this.post,state);
    break;
  }//switch
  //finally
if(state.type=='list'){
return await this.child.getListTemplate();
}else if(state.type=='new' || state.type=='edit'){
return await this.child.getFormTemplate();
}else{
return await this.child.getTemplate();
}
}//func

/**
 * 
 * @param {HTMLInputElement} el 
 * @returns 
 */
setItemsToDelete(el){
let state = this.main.getState(el.getAttribute('data-path'),false);
let id = state.id;
if(el.checked){
if(this.idsToDelete.includes(id)){
    return;
}else{
    this.idsToDelete.push(id);
}
}else{
    //not checked
this.main.utils.pop(id,this.idsToDelete);
}
//
if(this.idsToDelete.length>0){
this.main.pbu.show(this.massDeleteButton);
}else{
this.main.pbu.hide(this.massDeleteButton);
}
}//

/**
 * 
 * @param {number[]} ids 
 */
async deleteItems2(ids){
let modal = this.main.utils.setModal('Confirm Deletion','blanc');
this.main.pbu.listen(modal.confirm,'click',async ()=>{
///
let state = this.main.utils.clone(this.child.state);
state.link = this.main.fu.getApi(state.url);
state.body = JSON.stringify(ids);
state.method = "DELETE";
let r = await this.main.fu.fetch(state);
if(r==true){
let updatedItems =[];
let deletedItems =[];
let items = this.child.getItems();
for(let i of items){
if (this.idsToDelete.includes(i.id)){
deletedItems.push(i);
continue;
}else{
updatedItems.push(i);
}
}//for
this.child.setItems(updatedItems);
this.idsToDelete = [];
this.child.setListTable();
this.main.utils.notify("Deleted",0,'d');
this.main.mh.deleteFromServer({items:deletedItems,component:this.child.title});
}
modal.dismiss.click();
});
}//

/**
 * 
 * @param {number[]} ids 
 */
async deleteItems(ids){
let modal = this.main.utils.setModal('Confirm Deletion','blanc');
this.main.pbu.listen(modal.confirm,'click',async ()=>{
//lets extract media ids 
let updatedItems =[];
let deletedItems =[];
let items = this.child.getItems();
for(let i of items){
if (this.idsToDelete.includes(i.id)){
deletedItems.push(i);
continue;
}else{
updatedItems.push(i);
}
}//for
let mediaIds = this.main.media.addMediaIds({items:deletedItems,component:this.child.title});
//
let state = this.main.utils.clone(this.child.state);
state.link = this.main.fu.getApi(state.url,[{n:'mediaIds',v:mediaIds}]);
state.body = JSON.stringify(ids);
state.method = "DELETE";
let r = await this.main.fu.fetch(state);
if(r==true){
this.child.setItems(updatedItems);
this.idsToDelete = [];
this.child.setListTable();
this.main.utils.notify("Deleted",0,'d');
this.main.media.resetMediaIds();
}
modal.dismiss.click();
});
}//
}//#class
