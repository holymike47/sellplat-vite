// @ts-check
import { Option } from "./option";
import { Menu } from "./menu";
import { User } from "./user";
import { Category } from "./category";
import { Post } from "./post";
export class Dashboard{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main, state){
this.main = main;
this.state = state;
///
this.child = null;
this.idsToDelete = [];

this.title = "Dashboard";
document.title = "Dashboard";
this.getTemplate();
}//

getTemplate(){
  let $this = this;
  this.dashboardComponent = this.main.pbu.query('#dashboardComponent').cloneNode(true);
  this.replace = this.main.pbu.query('#replace');
  this.main.pbu.replace(this.replace,this.dashboardComponent);
  this.dashboardReplace =  this.dashboardComponent.querySelector('#dashboardReplace');
  //
  this.clientHome = this.dashboardComponent.querySelector('#leftSidebar .sp-home-link');
  this.clientHome.href= '/'+this.state.username;

  this.sidebarlinks = this.dashboardComponent.querySelectorAll('#leftSidebar .sp-admin-link');
  for(let link of this.sidebarlinks){
  let href = `/app/${this.state.username}${link.getAttribute('data-href')}`;
  link.href = href;
  //link.setAttribute('data-href',href);
}//for

this.signoutLink = this.dashboardComponent.querySelector('#leftSidebar #signoutLink');
addEvents();
//finally
//this.mount(this.dashboardComponent);

 
function addEvents(){
  //prevent dropdown from responding to clicks
  let dropdownToggles = $this.dashboardComponent.querySelectorAll('#leftSidebar .dropdown-toggle');
  for(let dt of dropdownToggles){
    $this.main.pbu.listen(dt,'click',(e)=>{
  e.preventDefault();
});
  }

$this.main.pbu.listen($this.signoutLink,'click',async(e)=>{
e.preventDefault();
let url = $this.main.fu.getApi($this.state.username,true)+'/logout';
let r = await $this.main.fu.fetch({url:url,isAdmin:true,method:'POST',body:JSON.stringify({})});
if(r===true){
$this.main.navigate({component:'login',url:'/app/login'});
}else{
$this.main.utils.notify("Error",2,'s');
}
});

$this.addRouteEvents($this.dashboardComponent);
}//inner
}//func

/**
 * 
 * @param {HTMLElement} component 
 */
addRouteEvents(component){
let links = component.querySelectorAll('.sp-route-link');
for(let link of links){
  this.main.pbu.listen(link,'click',(e)=>{
    e.preventDefault();
    let state;
    if(link.classList.contains('sp-admin-link')){
      state = this.main.getState(e,true);
      this.main.navigate(state);
    }else if(link.classList.contains('sp-detail')){
    this.main.handleView(link.pathname,false);
    }
  });
}
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
this.main.utils.deleteItem(id,this.idsToDelete);
}
//
if(this.idsToDelete.length>0){
this.main.pbu.show(this.massDeleteButton);
}else{
this.main.pbu.hide(this.massDeleteButton);
}
console.log(this.idsToDelete);
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
let template = await this.process(state);
  //fix later
  if(!template){
    this.main.utils.notify("Template not found",2,'s');
    return;
  }
let div = this.main.pbu.createElement('div');
div.innerHTML=
`
<section class="position-relative my-2">
<section class="position-absolute z-10" style="left: 30vw;top: -40px;">
<div class="d-flex align-items-center justify-content-center">
<div id="dashboardNotification" class="notification"></div>
</div>
</section>
</section>

<section id="mountPoint"></section>
`;
let mountPoint = div.querySelector('#mountPoint');
this.main.pbu.appendChild(mountPoint,template);
this.getTemplate();
this.main.pbu.replace(this.dashboardReplace,div);
this.addRouteEvents(template);
}//func

/**
 * 
 * @param {any} state 
 * @returns 
 */
async process(state){
  let r;
  let stateObject = state.stateObject;
  switch(state.component){
    case 'option':
      if(!this.option){
      this.option = new Option(this.main,state);
      }
      //if there is an existing instance, update the state object
     this.child = this.option;
     this.child.state = this.option.state = state;
     //now process
     this.option.option$ = state.stateObject || await this.main.fu.fetch(state);
    console.log(this.option.option$);
    return this.option.getTemplate();
      //break;
/// ########## MENU ##############
    case 'menu':
      if(!this.menu){
      this.menu = new Menu(this.main,state);
      }
     this.child = this.menu;
     this.child.state = this.menu.state = state;
     //now proces

if(state.type=='list'){
  this.menu.menus$ = state.stateObject || await this.main.fu.fetch(state);
    await this.menu.setDisplay();
    return this.menu.getListTemplate();
}else{
  //not list
this.menu.menuBuildData$ = stateObject || await this.main.fu.fetch(state);
if(state.type=='new' && state.id==-1){
this.menu.menu$ = this.menu.getNewMenu();
}else if(state.type=='edit'){
this.menu.menu$ = this.menu.menuBuildData$.menu;
}
return this.menu.getFormTemplate();
}
      //break;
    case 'user':
         /// ########## USER ##############
if(!this.user){
this.user = new User(this.main,state);
}
//
this.child = this.user;
this.child.state = this.user.state = state;
if(state.type=='list'){
this.user.users$ = state.stateObject || await this.main.fu.fetch(state);
console.log('users$');
console.log(this.user.users$);
await this.user.setDisplay();
return this.user.getListTemplate();
}else{
    //not list
if(state.type=='new' && state.id==-1){
this.user.user$ = this.user.getNewUser();
}else if(state.type=='edit'){
this.user.user$ = stateObject || await this.main.fu.fetch(state);
}//#edit
return this.user.getFormTemplate();
}
        //break;
 /// ########## CATEGORY ##############
    case 'category':
      if(!this.category){
      this.category= new Category(this.main,state);
      }
     this.child = this.category;
     this.child.state = this.category.state = state;
     //now process
      if(state.type=='list'){
this.category.categories$ = stateObject || await this.main.fu.fetch(state);
return this.category.getListTemplate();

}else{
if(state.type=='new' && state.id==-1){
this.category.category$ = this.category.getNewCategory();
}else if(state.type=='edit'){
this.category.category$ = stateObject || await this.main.fu.fetch(state);
}
return this.category.getFormTemplate()
}
      //break;
    case 'post':
  if(!this.post){
      this.post= new Post(this.main,state);
    }
     this.child = this.post;
     this.child.state = this.post.state = state;
     //now process
this.post.postDto = state.stateObject || await this.main.fu.fetch(state);
console.log("postDto");
console.log(this.post.postDto);
if(state.type=='list'){
/// set main post to enable update and availability
this.main.posts$ = this.post.postDto.posts;
this.main.categories$ = this.post.postDto.categories;
this.main.categoryTitles = this.main.categories$.map(c=>c.title);
///
//set own post in setDisplay()
return await this.post.getListTemplate();
}else{
    //not list
if(state.type=='new' && state.id==-1){
this.post.post$ = this.post.getNewPost();
}else if(state.type=='edit'){
this.post.post$ = this.post.postDto.posts[0];
}
return await this.post.getFormTemplate();
}
      //break;
  }//switch

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
this.main.utils.deleteItem(id,this.idsToDelete);
}
//
if(this.idsToDelete.length>0){
this.main.pbu.show(this.massDeleteButton);
}else{
this.main.pbu.hide(this.massDeleteButton);
}
console.log(this.idsToDelete);
}//

/**
 * 
 * @param {number[]} ids 
 */
async deleteItems(ids){
let modal = this.main.utils.setModal('Confirm Deletion',null);
this.main.pbu.listen(modal.confirm,'click',async ()=>{
///
let state = this.main.utils.clone(this.child.state);
state.body = JSON.stringify(ids);
state.handler = 'delete';
let r = await this.main.fu.fetch(state);
if(r==true){
let updatedItems =[];
let items = this.child.getItems();
for(let i of items){
if (this.idsToDelete.includes(i.id)){
continue;
}else{
updatedItems.push(i);
}
}//for
this.child.setItems(updatedItems);
this.idsToDelete = [];
let template = this.child.getListTemplate();
//maybe unsubscribe here
this.mount(template);
this.main.utils.notify("Deleted",0,'s');
}
modal.dismiss.click();
});
}//
}//#class
