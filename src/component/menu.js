import { th } from "intl-tel-input/i18n";

// @ts-check
export class Menu{    
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
this.title = 'menu';
//
this.maxId = 0;
//
//this.menuBuildData$ = null;
this.selectedMenu = null;//temporary hold
//
this.menu$ = null;
this.menus$ = null;

/**@type {any}*/this.displayMenus = null;
}//
async setDisplay(){
if(this.state.stateObject){
if(this.state.type=='list'){
this.menus$ = this.state.stateObject.menus;
this.displayMenus = this.menus$;
}else{
if(this.state.type=='new' && this.state.id==-1){
this.menu$ = this.getNewMenu();
}else if(this.state.type=='edit'){
this.menu$ = this.state.stateObject.menu;
}
}
}//
}//func

async getListTemplate(){
await this.setDisplay();
let $this = this;
    //get handles
this.menuComponent= this.main.pbu.createElement('main',['menu-component']);
this.menuComponent.innerHTML =
`
<section>
<header>
    <a type="button" href="/app/${this.state.username}/menu/page/new/-1" class="btn btn-primary new-menu sp-admin sp-route-link">Add Menu </a> 
</header>

<section class="sp-table menu-list-table">
</section>

</section>
`;
//handle
this.menuTable = this.menuComponent.querySelector('.menu-table');
this.menuListTableSection = this.menuComponent.querySelector('.menu-list-table'); 
updateView();
addEvents();
return this.menuComponent;
function updateView(){
$this.setListTable();
}//inner
function addEvents(){

}//inner
}//func
setListTable(){
let titles = ["Title","Description"];
let posts = [];
for(let m of this.displayMenus){
let p = {
id:m.id,
href:`/app/${this.state.username}/menu/page/edit/${m.id}`,
titles:[m.title,m.description],
editHref:`/app/${this.state.username}/menu/page/edit/${m.id}`,
deleteHref:`/app/${this.state.username}/menu/page/delete/${m.id}`,
};
posts.push(p);
}//for
let menuTable = this.main.pbu.createTable({titles:titles,posts:posts});
this.main.pbu.replace(this.menuListTableSection,menuTable);
}//func
async getFormTemplate(){
await this.setDisplay();
let $this = this;
this.menuComponent= this.main.pbu.createElement('main',['menu-component']);
this.main.pbu.appendChild(this.menuComponent,
`
<div class="container">
${this.main.pbu.createFormControl({title:"Title",value:this.menu$.title,clasz:['title'],required:true,serialize:true})}
${this.main.pbu.createFormControl({title:"Description",value:this.menu$.description,clasz:['description'],serialize:true})}
 <!--##########-->
<div class="row">
    <div id = "editSection" class="col-12">
      <h5>Build Section</h5>
      <div class="row menu-row">
        <div class="col-2">
<select class="form-select menu-post-type">
  <option value="page" selected>Pages</option>
  <option value="post">Posts</option>
  <option value="post category">Post Categories</option>
  <option value="product category">Product Categories</option>
  <option value="custom">Custom</option>
</select>
        </div>
        <div class="col-6">
          <div class="sp-form-control">
          <input class="form-control menu-search sp-validation-required" placeholder="Search">
        <input class="form-control menu-custom-link sp-validation-required d-none" placeholder="Link">
          </div>
          <div class="position-relative">
          <ul class="list-group mt-2 menu-selected d-none position-absolute" style="z-index: 101;">
          </ul>
          </div>
        </div>
        <div class="col-2 sp-form-control"><input class="form-control menu-label sp-validation-required" placeholder="Label"></div>
        <div class="col-2"><button class="menu-add">Add</button></div>
      </div>
    </div>

    <!--Selected Menu-->
    <div>
      <ul id = "displaySection" class="list-group">
      <h5>Selected Menu</h5>
    </ul>
<p><button class="btn btn-primary float-start menu-save" type="button">Save</button></p>
    </div>
    
    <!--#Selected Menu--> 
    </div>
      </div>
`
);
//edit section
this.menuTitleControl = this.menuComponent.querySelector('input.title');
this.menuDescriptionControl = this.menuComponent.querySelector('input.description');
this.menuPostTypeSelector = this.menuComponent.querySelector('.menu-post-type');
this.menuSearchControl = this.menuComponent.querySelector('.menu-search');
this.menuCustomLinkControl = this.menuComponent.querySelector('.menu-custom-link');
this.menuSelectedList = this.menuComponent.querySelector('.menu-selected');
this.menuLabelControl = this.menuComponent.querySelector('.menu-label');
//to add selected menu
this.menuAddButton = this.menuComponent.querySelector('.menu-add'); 

//display section
this.displaySection = this.menuComponent.querySelector('#displaySection');
this.menuSaveButton = this.menuComponent.querySelector('.menu-save');
this.draggingItem = null;

//
updateView();
addEvents();
return this.menuComponent;
function updateView(){
if($this.menu$.menuItems){
   console.log($this.menu$.menuItems);
let menuItems = JSON.parse($this.menu$.menuItems) || [];//string array
let maxIds = menuItems.map(mi=>mi.menuId);
$this.maxId =  Math.max(...maxIds);
  console.log("Updateview(): selectedMenus");
  console.log(menuItems);
  for(let m of menuItems){
    let li = addMenus(m);
    $this.displaySection.appendChild(li);
    let children = m.children;
    if(children.length>0){
    let dropZone = li.querySelector('div.drop-section');
    let submenu = li.querySelector('ul.submenu');
    $this.main.pbu.show(dropZone);
   for(let c of children){
    li = addMenus(c);
    dropZone = li.querySelector('div.drop-section');
    $this.main.pbu.removeClass(dropZone,['drop-zone']);
    $this.main.pbu.hide(dropZone);
    submenu.appendChild(li);
  }
}
  }
  }
  
}

function addEvents(){
  $this.main.pbu.listen($this.menuPostTypeSelector,'change',()=>{
    if($this.menuPostTypeSelector.value=='custom'){
      $this.main.pbu.show($this.menuCustomLinkControl);
      $this.main.pbu.hide($this.menuSearchControl);
    }else{
      $this.main.pbu.show($this.menuSearchControl);
      $this.main.pbu.hide($this.menuCustomLinkControl);
    }
  });
  
  //search
  $this.main.pbu.listen($this.menuSearchControl,'input',()=>{
    $this.menuSelectedList.innerHTML = '';
    let searchTerm = $this.menuSearchControl.value;
    if(searchTerm){
    let regex = new RegExp(`^${searchTerm}`, "i");
    let postType = $this.menuPostTypeSelector.value;
    let items;
    switch(postType){
      case 'page':
      case 'post':
        items = $this.state.stateObject.posts.filter(p=>p.postType==postType);
        break;
      case 'post category':
        items = $this.state.stateObject.categories.filter(c=>c.postType=='post');
      case 'product category':
        items = $this.state.stateObject.categories.filter(c=>c.postType=='product');
        break;
    }
    
      //clear existing search
        //let regex = new RegExp(`^${searchTerm}`, "i");
        //let pattern = /`searchTerm`/i;
        //items = items.filter(i=>i.name.startsWith(searchTerm));
        items = items.filter(i=>regex.test(i.title));
        if(items){
        for(let i of items){
        let li = $this.main.pbu.createElement('li',['list-group-item'],i.title);
        $this.menuSelectedList.appendChild(li);
        //
        $this.main.pbu.listen(li,'click',()=>{
          $this.selectedMenu = {
                            menuId:++$this.maxId,
                            postId:i.id,
                            title:i.title,
                            slug:i.slug,
                            postType:postType,
                            parentId:0,
                            children:[]
                            };
console.log($this.selectedMenu);

          $this.menuSearchControl.value= $this.selectedMenu.title;
          $this.menuSelectedList.innerHTML = '';
          $this.main.pbu.hide($this.menuSelectedList);
        });
      }
      $this.main.pbu.show($this.menuSelectedList);
        }
    }
  });
  //
$this.main.pbu.listen($this.menuAddButton,'click',()=>{
let postType = $this.menuPostTypeSelector.value;
let isCustom = postType=='custom';
let menuControl;
if(isCustom){
  menuControl = $this.menuCustomLinkControl;
}else{
  menuControl = $this.menuSearchControl;
}
if(!$this.main.vu.validate(menuControl,$this.menuLabelControl)){
  return;
}
if(isCustom){
  $this.selectedMenu = {
                            menuId:++$this.maxId,
                            postId:null,
                            title:$this.menuLabelControl.value,
                            link:menuControl.value,
                            postType:'custom',
                            parentId:0,
                            children:[]
                            };
}else{
//note: if not isCustom, selected menu is the previously saved menu
$this.selectedMenu.title = $this.menuLabelControl.value;
}

//add to display section
let li = addMenus($this.selectedMenu);
$this.displaySection.appendChild(li);
//reset forms
menuControl.value = '';
$this.menuLabelControl.value = '';
$this.main.pbu.removeClass(menuControl,$this.main.config.VALIDATION_REQUIRED_CLASS);
$this.main.pbu.removeClass($this.menuLabelControl,$this.main.config.VALIDATION_REQUIRED_CLASS);
$this.selectedMenu = null;
});//addMenu click

//save
$this.main.pbu.listen($this.menuSaveButton,'click', ()=>{
$this.saveMenu();
});
}//inner


/**
 * 
 * @param {any} selectedMenu 
 * @param {boolean} top 
 */
function addMenus(selectedMenu){
let smd = JSON.stringify(selectedMenu);
let row = $this.main.pbu.createElement('li',['drag-item','list-group-item']);
row.style.cursor='move';
row.innerHTML = 
`
<div class="d-flex my-2">
<p class="me-4 menu-label">${selectedMenu.title}</p>
<button class="mx-2 menu-edit">Edit</button>
<button class="mx-2 menu-delete">Delete</button>
</div>

 <div class="drop-zone drop-section w-100 my-1 d-none" style="border: 1px dashed blue;">
  <ul class="list-group submenu" style="margin-left: 50px;border: 1px dashed blue;">
  <li class="list-group-item">SubMenu</li>
  </ul>
  </div>
`;
row.setAttribute("draggable","true");
row.setAttribute("data-selected-menu",smd);
//handle
let menuLabel = row.querySelector('.menu-label');
let menuEdit = row.querySelector('.menu-edit');
let menuDelete = row.querySelector('.menu-delete');
let dropZone = row.querySelector('div.drop-zone');

//Edit
$this.main.pbu.listen(menuEdit,'click',()=>{
let modal = $this.main.utils.setModal('Change Label',null);
//
$this.main.pbu.listen(modal.confirm,'click', ()=>{
  if(!$this.main.vu.validate(modal.input)){
  return;
}
let newLabel = modal.input.value;
//validate
  selectedMenu.title = newLabel;
  menuLabel.textContent = newLabel;
  let smd = JSON.stringify(selectedMenu);
  row.setAttribute('data-selected-menu',smd);
  modal.dismiss.click();
});
});

//delete
$this.main.pbu.listen(menuDelete,'click',()=>{
let modal = $this.main.utils.setModal('Deletion Menu','blanc');
$this.main.pbu.listen(modal.confirm,'click', ()=>{
let submenu = row.closest('ul.submenu');
if(submenu){
let subMenuItems = submenu.querySelectorAll('li.drag-item');
if(subMenuItems.length==1){//row inclusive
$this.main.pbu.hide(submenu.parentElement);
}
}
row.remove();
modal.dismiss.click();
});
});

//drag
$this.main.pbu.listen(row,'dragstart',(e)=>{
$this.draggingItem = e.target;
$this.draggingItem.style.cursor='move';
$this.main.pbu.addClass($this.draggingItem,['dragging']);
let  draggableItems = [...$this.displaySection.querySelectorAll(".drag-item:not(.dragging)")];
for(let di of draggableItems){
  let dropZone = di.querySelector('div.drop-zone');
  if(dropZone){
    $this.main.pbu.show(dropZone);
  }
  
}
});
//
$this.main.pbu.listen(row,'dragend',(e)=>{
$this.main.pbu.removeClass(e.target,['dragging']);
setTimeout(() => {
let  draggableItems = [...$this.displaySection.querySelectorAll(".drop-zone")];
for(let di of draggableItems){
  let ul = di.querySelector('ul');
  //dont hide drop zone, when an item has been added to sub menu
  if(ul.children.length==1){
    $this.main.pbu.hide(di);
  }
  
}
}, 2000);

});
//
//
$this.main.pbu.listen(row,'dragover',(e)=>{
e.preventDefault();
});
//
$this.main.pbu.listen(row,'drop',(e)=>{
e.preventDefault();
let dropZoneDiv = row.querySelector("div.drop-zone");
let dropZoneRect = dropZoneDiv.getBoundingClientRect();
let dropZoneTop = dropZoneRect.top;

let ul = row.querySelector("ul");
let ulRect = ul.getBoundingClientRect();

let yPos = e.clientY;
let xPos = e.clientX;
if(yPos>dropZoneTop){
  if(xPos<ulRect.left){
    row.after($this.draggingItem);
    $this.main.pbu.addClass($this.draggingItem.querySelector('div.drop-section'),['drop-zone']);
  }else{
    ul.appendChild($this.draggingItem);
    $this.main.pbu.removeClass($this.draggingItem.querySelector('div.drop-section'),['drop-zone']);
  }
  
}
})
return row;
}//inner
}//func

async saveMenu(){
if(!this.main.vu.validate(this.menuTitleControl,this.menuDescriptionControl)){
return;
}
let title = this.menuTitleControl.value;
  let displayMenu = [];
  //let selectedMenuLi = this.displaySection.querySelectorAll('li[data-selected-menu]')||[];
  let selectedMenuLi = this.displaySection.querySelectorAll(':scope > li')||[];
  //querySelectorAll(':scope > p')
  for(let li of selectedMenuLi){
    let dmd = this.main.pbu.getAttribute(li,'data-selected-menu');//displayMenuData
    let dm = JSON.parse(dmd);
    displayMenu.push(dm);
    let subMenuLi = li.querySelectorAll('li.drag-item');
      for(let i=0;i<subMenuLi.length;i++){
        let smd = this.main.pbu.getAttribute(subMenuLi[i],'data-selected-menu');//subMenuData
        let sm = JSON.parse(smd);
        sm.parentId = dm.menuId;
        dm.children.push(sm);
      }
    
  }

let menu = {
id: this.state.id,
title:title,
slug:title.toLowerCase(),
description:this.menuDescriptionControl.value,
menuItems:JSON.stringify(displayMenu),
};
this.main.utils.sign(menu);
// if(!this.validate(menu)){
// return;
// }
console.log(menu);
let state = this.state;
state.handler = 'save';
state.body = JSON.stringify(menu);
let r = await this.main.fu.fetch(state);
if(r>0){
this.state = this.main.replaceState(this.menu$,this.state,r);
this.main.utils.notify('Saved',0,'s');
}
}//func

/**
 * 
 * @param {any} menu 
 * @returns 
 */
validate(menu){
let valid = true;
 if(this.state.id==-1){
  //firstly check if user has any menu
  if(this.menus$){
    for (let m of this.menus$) {
					if (m.title.toLowerCase()==menu.title.toLowerCase()) {
                        valid = false;
						// user exists
						this.main.utils.notify("Title already used",1,'d');
						break;
					}
				}
  }
        
    }else{
      if(this.menus$){
        let otherUsersEmail = this.menus$.filter(m => m.id!=menu.id).map(m => m.title);
				if (otherUsersEmail.includes(menu.title)) {
                    valid = false;
					// cant use an email of an existing user
					this.main.utils.notify("Title already used",1,'d');
				}
      }
        
    }
return valid;
}//

//######
getNewMenu(){
let menu = {
id:-1,
title:"",
slug:"",
description:"",
menuItems:"",
username:"",
tenantId:-1,
tenantUuid:""
};
return menu;
}//func
getItems(){
    return this.menus$;
}
/**
 * 
 * @param {any} items 
 */
async setItems(items){
this.state.stateObject.menus = items;
await this.setDisplay();
}
}//class
