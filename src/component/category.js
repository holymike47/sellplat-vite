// @ts-check
import { MediaHandler } from "./media-handler";
export class Category {
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
//
/**@type {boolean}*/this.isPartial = false;//when using isPartial
/**@type {any|null}*/this.category$=null;
/**@type {any[]|null}*/this.categories$=null;
/**@type {any[]}*/this.displayCategories = [];
/**@type {string[]}*/this.parentCategoryTitles = [];//for creating new category and assigning parent
this.title = "category";
}//

async getListTemplate(){
await this.setDisplay();
let $this = this;
    //get handles
this.categorySection=this.main.pbu.createElement('main',['category-component']);
this.categorySection.innerHTML =
`
<section>
<div class="container">
<header>
<a type="button" href="/app/${this.state.username}/category/${this.state.postType}/new/-1" class="btn new-category sp-link sp-admin-link sp-route-link">Add Category </a> 
</header>

<div class="d-flex justify-content-end">
<form class="row g-3">
<div class="col-auto">
<input class="form-control search-term" placeholder="search">
</div>
<div class="col-auto">
<button id="searchButton" type="button" class="btn mb-3">Search</button>
</div>
</form>
</div>

<section class="sp-table category-table">
<section>
</div>
</section>
`;

//this.addCategoryButton = this.categoryComponent.querySelector('a.new-category');
this.searchTermControl = this.categorySection.querySelector('input.search-term');
this.searchPostsButton = this.categorySection.querySelector('#searchButton');

updateView();
addEvents();
return this.categorySection;
function updateView(){
///
let titles = ["Title","Description","Post Type"];
let posts = [];
for(let c of $this.displayCategories){
let p = {
id:c.id,
href:`/${$this.state.username}/category/${c.title}/${c.id}`,
titles:[c.title,c.description,c.postType],
editHref:`/app/${$this.state.username}/category/${$this.state.postType}/edit/${c.id}`,
deleteHref:``
};
posts.push(p);
}//for
let menuTable = $this.main.pbu.createTable({username:$this.state.username,titles:titles,posts:posts});
$this.main.pbu.appendChild($this.categorySection,menuTable);

}//inner
function addEvents(){
$this.main.pbu.listen($this.searchPostsButton,'click',()=>{
    let searchTerm = $this.searchTermControl.value;
    //validate();
    $this.searchCategories(searchTerm);
});
}//inner
}//func
async getFormTemplate(){
await this.setDisplay();
let $this = this;
let c =this.category$;
this.categorySection= this.main.pbu.createElement('main',['category']);
this.main.pbu.appendChild(this.categorySection,
`
<section">
<form name="categoryForm" id="categoryForm" class="w-50 m-auto">
${this.main.pbu.createFormControl({title:"Title",value:c.title,clasz:['title'],serialize:true})}
${this.main.pbu.createFormControl({title:"Description",value:c.description,clasz:['description'],serialize:true})}
${this.main.pbu.createSelectElement({title:"Parent",value:c.parentTitle,clasz:['parent'],items:['None',...this.parentCategoryTitles],serialize:true})}
<div class="mb-3 row">
<label for="categoryImageDiv" class="col-sm-2 col-form-label">Image </label>
<div class="col-sm-10" id="categoryImageDiv">

</div>
</div>

<button type="button" id="saveCategoryButton"  class="btn btn-primary float-start">Save</button>
</form>
</section>
`
);

this.categoryTitleControl = this.categorySection.querySelector('input.title');
this.categoryDescriptionControl = this.categorySection.querySelector('input.description');
this.categoryParentSelector = this.categorySection.querySelector('select.parent');//<select>
//image
this.categoryImageDiv = this.categorySection.querySelector('#categoryImageDiv');
this.featuredImageTemplate = this.main.mh.getImageTemplate({src:$this.main.mh.getImageUrl(c.featuredImageUrl,'public')});
this.featuredImageTemplate.insertIcon.remove();
this.main.pbu.replace(this.categoryImageDiv,this.featuredImageTemplate.div);
//
this.saveCategoryButton=this.categorySection.querySelector('#saveCategoryButton');
//
updateView();
addEvents();
return this.categorySection;

function updateView(){
}//inner
function addEvents(){
$this.saveCategoryButton.addEventListener('click',()=>$this.saveCategory());
}//inner
}//func

async setDisplay(){
   //step 1
if(!this.categories$){
let state = this.main.utils.clone(this.state);
state.type = 'list';
let r = await this.main.fu.fetch(state);
if(r){
    this.categories$ = r;
}
}
//step 2
if(this.categories$){
this.displayCategories = this.categories$ || [];
if(this.state.type=='new' || this.state.type=='edit'){
this.parentCategoryTitles = [];
for(let c of this.displayCategories){
if(c.title==this.category$.title){continue;}//cant set parent name to yours
this.parentCategoryTitles.push(c.title);
}
}
}

}//func

/**
 * 
 * @param {string} searchTerm 
 */
searchCategories(searchTerm) {

}//func

async saveCategory(){
if(!this.main.vu.required(this.categoryTitleControl)){
    return;
}
let title = this.categoryTitleControl.value;
let parentTitle = this.categoryParentSelector.value;
let parentId = this.main.utils.getItemIdFromTitle(parentTitle,this.categories$) || -1;
//
let oldImageId;
let newImageId = await this.main.mh.uploadToServer(this.categoryImageDiv.querySelector('div.image-template'));
if(newImageId && newImageId !=this.category$.featuredImageUrl){
   if(this.category$.featuredImageUrl){
    oldImageId = this.main.utils.clone(this.category$.featuredImageUrl);
    }
    this.category$.featuredImageUrl = newImageId; 
}

let category ={
id:this.category$.id,
title:title,
slug:title.toLowerCase(),
description:this.categoryDescriptionControl.value,
postType:this.state.postType,
featuredImageUrl:this.category$.featuredImageUrl,
postIds:[],
parentTitle:parentTitle,
parentId:parentId,
username:this.main.cache.tenant.username,
tenantId:this.main.cache.tenant.tenantId,
tenantUuid:this.main.cache.tenant.tenantUuid,
};

console.log("before submit");
console.log(category);
let state = this.state;
state.body = JSON.stringify(category);
let r = await this.main.fu.fetch(state);
if(r>0){
    this.main.utils.notify('Saved',0,'s');
if(oldImageId){
this.main.mh.deleteFromServer({imageIds:[oldImageId]});
}
    if(this.isPartial){
        category.id = r;
        return category;
    }
this.state = this.main.replaceState(this.category$,this.state,r);
}
}//func

//######
getNewCategory(){
let category = {
id:-1,
title:"",
slug:"",
description:"",
postType: "",
featuredImageUrl:"",
postIds:[],
parentTitle:"None",
parentId:-1,
creationDate:"",
lastUpdate:"",
username:"",
tenantId:-1,
tenantUuid:""
};
return category;
}//func
getItems(){
    return this.categories$;
}
/**
 * 
 * @param {any} items 
 */
async setItems(items){
this.categories$ = items;
await this.setDisplay();
}
}//class
