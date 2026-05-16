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
this.title = "category";
//
/**@type {boolean}*/this.isPartial = false;//when using isPartial
/**@type {any|null}*/this.category$=null;
/**@type {any[]|null}*/this.categories$=null;
/**@type {any[]}*/this.displayCategories = [];
/**@type {string[]}*/this.parentCategoryTitles = [];//for creating new category and assigning parent

}//
async setDisplay(){
if(this.state.stateObject){
this.categories$ = this.state.stateObject.categories;
if(this.state.type=='list'){
//do nothing
}else{
if(this.state.type=='new' && this.state.id==-1){
this.category$ = this.getNewCategory();
}else if(this.state.type=='edit'){
this.category$ = this.state.stateObject.category;
}
}
}//
//step 2
if(this.categories$){
this.displayCategories = this.categories$;
if(this.state.type=='new' || this.state.type=='edit'){
this.parentCategoryTitles = [];
for(let c of this.displayCategories){
if(c.id==this.category$.id){continue;}//cant set parent name to yours
if(c.id==this.category$.parentId){
    this.category$.parent = c;
}
this.parentCategoryTitles.push(c.title);
}
}
}

}//func
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
<a type="button" href="/app/${this.state.username}/category/${this.state.postType}/new/-1" class="btn btn-primary new-category sp-admin sp-route-link">Add Category </a> 
</header>

<div class="d-flex justify-content-end">
<form class="row g-3">
<div class="col-auto sp-form-control">
<input class="form-control search-term" placeholder="search">
</div>
<div class="col-auto">
<button id="searchButton" type="button" class="btn btn-primary mb-3">Search</button>
</div>
</form>
</div>

<section class="sp-table category-list-table">
</section>
</div>

</section>
`;

this.searchTermControl = this.categorySection.querySelector('input.search-term');
this.searchPostsButton = this.categorySection.querySelector('#searchButton');
this.categoryListTableSection = this.categorySection.querySelector('.category-list-table');
updateView();
addEvents();
return this.categorySection;
function updateView(){
$this.setListTable();
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
${this.main.pbu.createFormControl({title:"Title",value:c.title,clasz:['title'],required:true,serialize:true})}
${this.main.pbu.createFormControl({title:"Description",value:c.description,clasz:['description'],serialize:true})}
${this.main.pbu.createSelectElement({title:"Parent",value:c.parent?.id,default:'None',postItems:[...this.categories$],clasz:['parent'],serialize:true})}
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
this.featuredImageTemplate = this.main.mh.getImageTemplate({src:$this.main.mh.getImageUrl(c.featuredImageUrl,'grid')});
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
setListTable(){
//let isPost = this.state.postType=='post';
let titles = ["Title","Description","Post Type"];
let posts = [];
for(let c of this.displayCategories){
let p = {
id:c.id,
href:`/${this.state.username}/category/${c.title}/${c.id}`,
titles:[c.title,c.description,c.postType],
editHref:`/app/${this.state.username}/category/${this.state.postType}/edit/${c.id}`,
deleteHref:``
};
posts.push(p);
}//for
let menuTable = this.main.pbu.createTable({username:this.state.username,titles:titles,posts:posts});
this.main.pbu.replace(this.categoryListTableSection,menuTable);
}//func
/**
 * 
 * @param {string} searchTerm 
 */
searchCategories(searchTerm) {
if(!this.main.vu.validate(this.searchTermControl)){
    return;
}
let regex = new RegExp(`${searchTerm}`, "i");
this.displayCategories = this.categories$.filter(i=>regex.test(i.title));
this.setListTable();
}//func

async saveCategory(){
if(!this.main.vu.validate(this.categoryTitleControl,this.categoryDescriptionControl)){
    return;
}
let title = this.categoryTitleControl.value;
let parentId = this.categoryParentSelector.value;
let imageId = await this.main.mh.uploadToServer(this.categoryImageDiv.querySelector('div.image-template'));
//
let category ={
id:this.category$.id,
title:title,
slug:title.toLowerCase(),
description:this.categoryDescriptionControl.value,
postType:this.state.postType,
featuredImageUrl:imageId,
postIds:[],
parentId:this.main.utils.isNull(parentId)?null:parentId,
};
this.main.utils.sign(category);
console.log("before submit");
console.log(category);
let state = this.state;
state.body = JSON.stringify(category);
let r = await this.main.fu.fetch(state);
if(r>0){
    if(this.isPartial){
        category.id = r;
        return category;
    }else{
        this.main.utils.notify('Saved',0,'s');
        this.state = this.main.replaceState(this.category$,this.state,r);
    }
//always
this.main.mh.deleteFromServer(null);
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
parentId:null,
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
this.state.stateObject.categories = items;
await this.setDisplay();
}
}//class
