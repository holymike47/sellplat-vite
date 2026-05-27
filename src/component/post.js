// @ts-check
import { th } from "intl-tel-input/i18n";
import { Category } from "./category";
import { PageBuilder } from "./page-builder";
import { Widget } from "./widget";
export class Post{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;//used when using this component to create another
this.state = state;
//let controller = new AbortController();
/**@type {any|null}*/this.postViewDto = null;//guest
/**@type {number}*/this.homePageId;
/**@type {any[]|null}*/this.posts$ = null;
/**@type {any|null}*/this.post$ = null;
//list
/**@type {any[]|null}[*/this.categories$ = null;
/**@type {any|null}*/this.category$ = null;
/**@type {string[]}*/this.categoryTitles = [];
//
/**@type {string[]|null}*/this.postTags = null;
/**@type {string[]|null}*/this.allTags = null;
//used components
/**@type {any}*/this.pb = new PageBuilder(this.main,this);//pageBuilder
this.widget = new Widget(main,this);
this.title = "post";
this.headerTemplate = null;
this.footerTemplate = null;
this.isView = false;//??
//Filtering
this.categoryFilterTerm = 'all';
this.statusFilterTerm = 'all';
//displaying archives
this.archiveTitle = '';
/**@type {any[]|null}*/this.postArchive$ = null;
//for troubleshooting
this.count = 0;
this.subscribeText = 'If you have not yet subscribed to our newsletter, kindly do so today.';
}//

async setDisplay(){
   //step 1
if(this.state.stateObject){
this.categories$ = this.state.stateObject.categories;
this.categoryTitles = this.categories$.map(c=>c.title);
this.allTags = this.state.stateObject.allTags.map(t=>this.main.utils.capitalize(t));
if(this.state.type=='list'){
    this.posts$ = this.state.stateObject.posts;
    for(let p of this.posts$){
    //set category
    for(let c of this.categories$){
        if(p.categoryId==c.id){
            p.category = c;
            break;
        }
    }
    //set author
}
this.main.log(this.posts$,0,'Post.setDisplay(): processed posts');
    //note: categories is sent wether list or new or edit
    }else if(this.state.type=='new'){
        this.post$ = this.getNewPost();
    }else if(this.state.type=='edit'){
        this.post$ = this.state.stateObject.post;
        for(let c of this.categories$){
        if(this.post$.categoryId==c.id){
            this.post$.category = c;
            break;
        }
    }
    }
//

}

}//func

   
async getListTemplate(){
await this.setDisplay();
let $this = this;
let isPost = this.state.postType=='post';
this.postFormSection=this.main.pbu.createElement('main',['post']);
this.main.pbu.appendChild(this.postFormSection,
`
<section>
<div class="container">
<header class="my-2">
<a type="button" href="/app/${this.state.username}/post/${this.state.postType}/new/-1" class="btn btn-primary new-post sp-admin sp-route-link">Add ${this.state.postType} </a> 
</header>

<div class="filter filter-by-status w-25">
  <ul class="list-group list-group-horizontal">
  <li class="list-group-item list-group-item-action active filter-by-status" style="cursor: pointer;" data-status="All">All</li>
  <li class="list-group-item list-group-item-action filter-by-status" style="cursor: pointer;" data-status="publish">Published</li>
  <li class="list-group-item list-group-item-action filter-by-status" style="cursor: pointer;" data-status="draft">Draft</li>
</ul>
</div>

<div class="filter filter-by-category w-25 ${this.main.pbu.showIf(isPost )}">
<p>Filter by category</p>
${this.main.pbu.createSelectElement({value:this.categoryFilterTerm,default:'All',postItems:[...this.categories$],clasz:['filter-by-category'],serialize:true})}
</div>

<div class="d-flex justify-content-end">
<form class="row g-3">
<div class="col-auto sp-form-control">
<input class="form-control search-term" placeholder="search">
</div>
<div class="col-auto">
<button id="searchPostsButton" type="button" class="btn btn-primary mb-3">Search</button>
</div>
</form>
</div>

<section class="list-table post-list-table"></section>

</section>
`
);
//only for postType = post
this.filterPostsByCategoryDiv = null;
this.filterPostsByCategorySelector = null;
this.searchTermControl = this.postFormSection.querySelector('input.search-term');
this.searchPostsButton = this.postFormSection.querySelector('#searchPostsButton');
this.postListTableSection = this.postFormSection.querySelector('.post-list-table'); 

//now
updateView();
addEvents();
return this.postFormSection;
function updateView(){
$this.setListTable(null);
///
}//inner
function addEvents(){
let filterPostsByStatusButtons = $this.postFormSection.querySelectorAll('li.filter-by-status');
for(let cs of filterPostsByStatusButtons){
$this.main.pbu.listen(cs,'click',()=>{
    let statusFilterTerm = cs.getAttribute('data-status');
    $this.filterPosts(statusFilterTerm,'status');
    cs.classList.add('active');
    for(let c of filterPostsByStatusButtons){
        if(c.getAttribute('data-status')!=statusFilterTerm){
            c.classList.remove('active');
        }
    }
});
}//for
//
if(isPost){
$this.filterPostsByCategoryDiv = $this.postFormSection.querySelector('.filter-by-category');
$this.filterPostsByCategorySelector = $this.postFormSection.querySelector('select.filter-by-category');
$this.main.pbu.listen($this.filterPostsByCategorySelector,'change',()=>{
    let categoryFilterTerm = $this.filterPostsByCategorySelector.options[$this.filterPostsByCategorySelector.selectedIndex].text;
    $this.filterPosts(categoryFilterTerm,'category');
});
}

//
$this.main.pbu.listen($this.searchPostsButton,'click',()=>{
    let searchTerm = $this.searchTermControl.value;
    //validate();
    $this.searchPostList(searchTerm);
});
//

}//inner
}//func
async getFormTemplate(){
await this.setDisplay();
let $this = this;
let p = this.post$;
this.postFormSection=this.main.pbu.query('#postFormSection').cloneNode(true);
this.main.pbu.show(this.postFormSection);
//main form ie build section for page builder
this.postForm = this.postFormSection.querySelector('#postForm');
this.postTitleControl = null;//set later in updateView();
this.mainContentDiv = this.postForm.querySelector('.main-content');
//only for products
this.productDataDiv = this.postFormSection.querySelector('.product-data');
this.regularPriceControl = this.postFormSection.querySelector('.regular-price');
this.salesPriceControl = this.postFormSection.querySelector('.sales-price');
//general
//content status
this.contentStatusSection = this.postFormSection.querySelector('section.content-status');
this.contentStatusDiv = this.contentStatusSection.querySelector('div.content-status');
//sidebar
this.sidebarTypeSection = this.postFormSection.querySelector('section.sidebar-type');
this.sidebarTypeDiv = this.sidebarTypeSection.querySelector('div.sidebar-type');
//sidebarWidgets
this.sidebarWidgetsSection = this.postFormSection.querySelector('section.sidebar-widgets');
this.recentPostsWidgetControl = this.sidebarWidgetsSection.querySelector('#recentPostsWidgetControl');
this.recentPostsWidgetSettingsDiv = this.sidebarWidgetsSection.querySelector('#recentPostsWidgetSettings');
//image
this.featuredImageSection = this.postFormSection.querySelector('section.featured-image');
this.featuredImageTemplate = null;//to be obtained dynamically in updateview()
//excerpt
this.excerptSection = this.postFormSection.querySelector('section.excerpt');
this.excerptButton = this.excerptSection.querySelector('button.excerpt');
//	category
this.postCategoriesSection = this.postFormSection.querySelector('section.post-categories');
this.postCategoriesDiv = this.postCategoriesSection.querySelector('div.post-categories');
this.categoryTitleSelector = null;//created in renderCategories();
this.createCategoryButton = this.postCategoriesSection.querySelector('a.create-category');
//Tags
this.postTagsSection = this.postFormSection.querySelector('section.tags');
this.postTagsListDiv = this.postTagsSection.querySelector('div.tags');
this.tagsControl = this.postTagsSection.querySelector('input.tags');
this.tagsAddButton = this.postTagsSection.querySelector('#postTagsAddButton');
this.tagIntendedList = this.postTagsSection.querySelector('.tag-intended');//for tags auto-complete
//sibebar type
this.sidebarTypeSection = this.postFormSection.querySelector('section.sidebar-type');
this.sidebarTypeDiv = this.sidebarTypeSection.querySelector('div.sidebar-type');
//not yet populated, populated in updateView();
this.sidebarTypeSelector = null;
//advance section
this.isFeaturedSection = this.postFormSection.querySelector('section.is-featured');
this.isFeaturedControl = this.isFeaturedSection.querySelector('input.is-featured');
//
this.isStickySection = this.postFormSection.querySelector('section.is-sticky');
this.isStickyControl = this.isStickySection.querySelector('input.is-sticky');
//
this.allowCommentsSection = this.postFormSection.querySelector('section.allow-comments');
this.allowCommentsControl = this.allowCommentsSection.querySelector('input.allow-comments');
//
this.showSubscribeSection = this.postFormSection.querySelector('section.show-subscribe');
this.showSubscribeControl = this.showSubscribeSection.querySelector('input.show-subscribe');
//
updateView();
addEvents();
$this.checkRoles();
return this.postFormSection;
async function updateView(){
//title
$this.main.pbu.prependChild($this.postForm,$this.main.pbu.createFormControl({id:"title",title:"Title",value:p.title}));
$this.postTitleControl = $this.postForm.querySelector('#title');
//content status
$this.main.pbu.appendChild($this.contentStatusDiv,
$this.main.pbu.createCheckedInputElement({id:"contentStatus",value:p.contentStatus,type:'radio',items:$this.main.config.CONTENT_STATUS}),
);

//
if($this.state.postType=='product'){
$this.main.pbu.show($this.productDataDiv);
}

if($this.state.postType=='post' || $this.state.postType=='product'){
$this.main.pbu.show($this.featuredImageSection);
$this.main.pbu.show($this.excerptSection);
$this.main.pbu.show($this.postCategoriesSection);
//categories
$this.renderCategories();
//tags
$this.main.pbu.show($this.postTagsSection);
$this.renderTags();
$this.main.pbu.show($this.isFeaturedSection,$this.isStickySection,$this.allowCommentsSection);
//featured image
$this.featuredImageTemplate = $this.main.mh.getImageTemplate({src:$this.main.mh.getImageUrl(p.featuredImageUrl,'grid')});
//cant use an icon as featured image
$this.featuredImageTemplate.insertIcon.remove();
$this.main.pbu.appendChild($this.featuredImageSection,$this.featuredImageTemplate.div);
}//if
//sidebar type
$this.main.pbu.appendChild($this.sidebarTypeDiv,
$this.main.pbu.createSelectElement({id:"sidebarType",value:p.sidebarType,items:$this.main.config.SIDEBAR_LAYOUT})
);
$this.sidebarTypeSelector = $this.sidebarTypeSection.querySelector('#sidebarType');
//sidebarWidgets
$this.getSidebarWidgets();
//input
$this.pb.isView = $this.widget.isView = false;
$this.pb.pbInput = $this.post$.mainContent;
let template = await $this.pb.getTemplate($this.state.type);
$this.main.pbu.replace($this.mainContentDiv,template);

}//inner
function addEvents(){
$this.main.pbu.listen($this.excerptButton,'click',()=>{
let div = $this.main.pbu.createElement('div');
div.innerHTML = 
`
<textarea class="sp-excerpt form-control">${$this.post$.excerpt}</textarea>
`;
let modal = $this.main.utils.setModal('Post Excerpt',div);
$this.main.pbu.listen(modal.confirm,'click',()=>{
    //validate()
$this.post$.excerpt = div.querySelector('textarea.sp-excerpt').value;
modal.dismiss.click();   
});
});//listen
//category
$this.main.pbu.listen($this.createCategoryButton,'click',()=>{
    $this.createCategory();
});
//tag
$this.main.pbu.listen($this.tagsAddButton,'click',()=>{
    $this.addNewTag();
});
$this.main.pbu.listen($this.tagsControl,'input',()=>{
    if(!$this.main.vu.sanitize([$this.tagsControl])){return;}
    let searchTerm = $this.tagsControl.value?.trim().toLowerCase();
    let allTags = $this.allTags?.filter(t=>t.includes($this.main.utils.capitalize(searchTerm)));
    $this.main.autoComplete($this.tagsControl,false,allTags,'tag');
});


//sidebar

$this.main.pbu.listen($this.sidebarTypeSelector,'change',()=>{
    if ($this.sidebarTypeSelector.value=='NONE'){
        $this.main.pbu.hide($this.sidebarWidgetsSection);
    }else{
        $this.main.pbu.show($this.sidebarWidgetsSection);
    }
});

}//inner
}//func

/**
 * 
 * @param {any|null} posts 
 */
setListTable(posts=null){
let isPost = this.state.postType=='post';
let titles = ["Title","Category","Author","Post Type","Status"];
if(!isPost){
    titles = ["Title","Status"];
}
let items = [];
let displayPosts = (posts)?posts: this.posts$.filter(p=>p.postType==this.state.postType);
for(let p of displayPosts){
let i = {
id:p.id,
href:`/${this.state.username}/${p.title}/${p.id}`,
titles:[p.title,(p.category?.title)?p.category.title:'None',(p.author)?p.author.firstName:'',p.postType,p.contentStatus],
editHref:`/app/${this.state.username}/post/${this.state.postType}/edit/${p.id}`,
deleteHref:``
};
if(!isPost){
    i = {
    id:p.id,
    href:`/${this.state.username}/${p.title}/${p.id}`,
    titles:[p.title,p.contentStatus],
    editHref:`/app/${this.state.username}/post/${this.state.postType}/edit/${p.id}`,
    deleteHref:``
};
}
items.push(i);
}//for
let menuTable = this.main.pbu.createTable({username:this.state.username,titles:titles,posts:items});
this.main.pbu.replace(this.postListTableSection,menuTable);
}//func

async checkRoles(){
if(this.parent.adminUser.topRole=='CONTRIBUTOR'){
    let contentStatusInput = this.contentStatusDiv.querySelectorAll('input');
    for(let input of contentStatusInput){
        input.removeAttribute('checked');
        input.setAttribute('disabled','disabled');
        if(input.value=='DRAFT'){
            input.setAttribute('checked','checked');
        }
    }
    
}
}//func
/**
 * 
 * @param {string} filterTerm 
 * @param {string} type 
 */
filterPosts(filterTerm,type){
    //temporary rememdy for possibly event bubbling.......
    if(!filterTerm){return;}
    filterTerm = filterTerm.toLowerCase();
    type = type.toLowerCase();
    let displayPosts = this.posts$.filter(p=>p.postType==this.state.postType);
switch(type){
    case 'category':
        //note
        this.categoryFilterTerm = filterTerm;
        if(this.categoryFilterTerm=='all'){
            //do nothing
        }else{
            displayPosts = displayPosts.filter(p=>this.categoryFilterTerm==p.category?.title.toLowerCase());
        }

        if(this.statusFilterTerm=="all"){
           //do nothing
        }else{
            displayPosts = displayPosts.filter(p=>p.contentStatus.toLowerCase()==this.statusFilterTerm);
        }
        break;
    case 'status':
        //note
        this.statusFilterTerm = filterTerm;
        if(this.statusFilterTerm=='all'){
            //do nothing
        }else{
            displayPosts = displayPosts.filter(p=>p.contentStatus.toLowerCase()==this.statusFilterTerm);
        }

        if(this.categoryFilterTerm=='all'){
            //do nothing
        }else{
            //note: categoryFilterTerm = categoryTitle
            displayPosts = displayPosts.filter(p=>p.category?.title.toLowerCase()==this.categoryFilterTerm);
        }
        
        break;
}//switch

this.setListTable(displayPosts);
}//func

/**
 * 
 * @param {string} searchTerm 
 */
searchPostList(searchTerm){
if(!this.main.vu.validate(this.searchTermControl)){
    return;
}

let regex = new RegExp(`${searchTerm}`, "i");
let displayPosts= this.posts$.filter(i=>regex.test(i.title));
//reset filter terms
this.categoryFilterTerm = this.statusFilterTerm =  'All';
this.setListTable(displayPosts);
}//func



getSidebarWidgets(){
let $this = this;
//init
if($this.post$.sidebarType=='NONE'){
    $this.main.pbu.hide($this.sidebarWidgetsSection);
}
else{
$this.main.pbu.show($this.sidebarWidgetsSection);
}//
showWidget();
addEvents();
/**
 * 
 * @param {string} name 
 */
async function showWidget(name = ''){
let widgets = [];
let defaultRecentPostsWidget = {m:'recentPosts',v:{l:1,cat:-1,we:true,wi:true,wm:true}};
let defaultWidgets = [defaultRecentPostsWidget];
//do you have widgets saved already in the post
/**@type {any[]}*/let selectedSidebarWidgets = JSON.parse($this.post$.sidebarWidgets) || [];//saved
//no name from regular call from updateView()
if(name){
    //i.e when a widget is turned on on the sidebar
for(let widget of defaultWidgets){
    if(name==widget.m){
    //if editing a post and the post already have the selected widget
    //initilize the widget with it
        widgets = [widget];//only one will be shown
        break;
    }
    }//for
 
}else{
    //init
    widgets = selectedSidebarWidgets;
}

for(let widget of widgets){
switch(widget.m){
            case 'recentPosts':
                let rpwTemplate = await $this.widget.getTemplate('recentPosts',widget.v);
                $this.main.pbu.show($this.recentPostsWidgetSettingsDiv);
                $this.main.pbu.replace($this.recentPostsWidgetSettingsDiv,rpwTemplate.div);
                break;
            case 'categoryPosts':
                break;
        }//switch
    }//for
}//inner
function addEvents(){
//recentPostsWidgetControl
        $this.main.pbu.listen($this.recentPostsWidgetControl,'change',()=>{
                if(!$this.recentPostsWidgetControl.checked){
                $this.main.pbu.hide($this.recentPostsWidgetSettingsDiv);
                return;
                }
                showWidget('recentPosts');
        });
}//inner
}//func

setupMainForm(){
/**@type {any}*/let pbInput;
if(this.state.type=='edit' || this.state.type=='detail'){
pbInput = {
title:this.post$.title,
message:this.post$.mainContent,
contentStatus:this.post$.contentStatus
};
}
let pb = new PageBuilder(this.main,this,pbInput,this.state.type);
let template = pb.getTemplate();
this.postForm.appendChild(template);
}//

async createCategory(){
let newCategory;
let state = this.main.getState(`/app/${this.state.username}/category/${this.state.postType}/new/-1`);
state.isModal = true;
state.stateObject = this.state.stateObject;
let categoryComponent = new Category(this.main,state);
categoryComponent.isPartial = true;
let template = await categoryComponent.getFormTemplate();
categoryComponent.saveCategoryButton.remove();
let modal = this.main.utils.setModal('New Category',template);
modal.confirm.textContent = 'Save';
this.main.pbu.listen(modal.confirm,'click',async()=>{
categoryComponent.state.notice=modal.notice;  
newCategory = await categoryComponent.saveCategory();
if(newCategory){
    this.main.utils.notify('Saved',0,'c',modal.notice);
}
});

this.main.pbu.listen(modal.dismiss,'click',()=>{
if(newCategory){
this.post$.category = newCategory;
this.categories$.push(newCategory);
this.renderCategories();
}

});

}//func
renderCategories(){
this.categoryTitles = this.categories$.map(c=>c.title);
this.postCategoriesDiv.innerHTML = '';
this.main.pbu.appendChild(this.postCategoriesDiv,
this.main.pbu.createSelectElement({id:"categoryTitle",value:this.post$.category?.id,postItems:[...this.categories$],clasz:['my-2'],default:'None'}));
//handle
this.categoryTitleSelector = this.postCategoriesDiv.querySelector('#categoryTitle');
}//func
/**
 * 
 * @param {HTMLInputElement} el 
 */
selectCategory(el){
let pcn = this.post$.categoryIds;//post categoory number
let status = el.checked;
let id = el.value;
if(status==true){
if(!pcn.includes(id)){
pcn.push(id);
}
}else{// checked == false
if(pcn.includes(id)){
let index = pcn.indexOf(id);
if(index >-1){
pcn?.splice(index, 1);
}

}
}
this.post$.categoryIds = pcn;
}//
//############# TAGS ######################
renderTags(){
this.postTags = (this.post$.tags)?this.post$.tags.split(this.main.config.SPLITTER).map(t=>this.main.utils.capitalize(t)):[];
this.postTagsListDiv.innerHTML = ''	;
for(let t of this.postTags){
let span = 
`
<span class="mx-2">${t} <i class="bi bi-file-x post-tags-remove" style="cursor: pointer;"></i></span>
`;
this.main.pbu.appendChild(this.postTagsListDiv,span);
}//for
//events
let removeTags = this.postTagsListDiv.querySelectorAll('i.post-tags-remove');
for(let el of removeTags){
this.main.pbu.listen(el,'click',()=>{
let tag = el.parentElement.textContent.trim();
this.main.utils.pop(tag,this.postTags);
el.parentElement.remove();
this.main.log(this.postTags,0,'Post.renderTags(): updated post tags');
});
}
}//
addNewTag(){
 if(!this.main.vu.validate(this.tagsControl)){
        return;
      }
let newTags = this.tagsControl.value;
//mini validation
if(!newTags){
this.main.pbu.addClass(this.tagsControl,['border','border-danger']);
return;
}else{
    this.main.pbu.removeClass(this.tagsControl,['border','border-danger']);
}
//
let tags = newTags.trim().split(",");
for(let tag of tags){
let t = this.main.utils.capitalize(tag);
//append
if(!this.postTags.includes(t)){
this.postTags.push(t);
}
if(!this.allTags?.includes(t)){
this.allTags?.push(t);
}
}
this.tagsControl.value = '';//reset form
this.renderTags();
}// #addNewTag()

/**
 * 
 * @param {string} pbMessage 
 */
async savePost(pbMessage){
if(!this.main.vu.required(this.postTitleControl)){
    return;
}
let title = this.postTitleControl.value;
if(this.state.postType=='page' && this.state.type=='new' && this.main.config.RESERVED_TITLES.includes(title.toLowerCase())){
    this.main.utils.notify('This title is reserved',1,'d');
    return;
}
//process sidebar widgets
let sidebarWidgets = [];
if(this.recentPostsWidgetControl.checked){
let l,cat,we,wi,wm;
l = this.sidebarWidgetsSection.querySelector('.recent-posts-limit').value;
cat = this.sidebarWidgetsSection.querySelector('.recent-posts-category').value;
we = this.sidebarWidgetsSection.querySelector('.recent-posts-with-excerpt').checked;
wi = this.sidebarWidgetsSection.querySelector('.recent-posts-with-image').checked;
wm = this.sidebarWidgetsSection.querySelector('.recent-posts-with-meta').checked;
let m = {
m:'recentPosts',
v:{
    m:'recentPosts',
    l:l,
    cat:this.main.utils.isNull(cat)?-1:cat,
    we:we,
    wi:wi,
    wm:wm
}
};
sidebarWidgets.push(m);
}
let featuredImageUrl = (this.state.postType=='post')?await this.main.mh.uploadToServer(this.featuredImageSection.querySelector('div.image-template')):''
///
let post = {
id:this.post$.id,
title:title,
slug:title.toLowerCase(),
mainContent:pbMessage,
excerpt:this.post$.excerpt,
postType:this.state.postType,
featuredImageUrl:featuredImageUrl,
keywords:this.post$.keywords,
tags:(this.postTags)?this.postTags.join(this.main.config.SPLITTER):'',
likes:this.post$.likes,
views:this.post$.views,
contentStatus: this.contentStatusDiv.querySelector('input:checked').value,
allowComments:this.allowCommentsControl.checked,
isFeatured:this.isFeaturedControl.checked,
isSticky:this.isStickyControl.checked,
showSubscribe:this.showSubscribeControl.checked,
sidebarType:this.sidebarTypeSelector.value,
sidebarWidgets:JSON.stringify(sidebarWidgets),
categoryId:(this.state.postType=='post')?this.categoryTitleSelector.value:null,
category:null,
authorId:this.post$.authorId /**important */
}
this.main.log(post,0,'Post.savePost(): Before submit');
let state = this.main.utils.clone(this.state);
state.body = JSON.stringify(post);
let r = await this.main.fu.fetch(state);
if(r>0){
this.main.utils.notify('Saved',0,'m');
this.main.mh.deleteFromServer(null);
this.state = this.main.replaceState(this.post$,this.state,r);
}
}//submitPost

//###########
getNewPost(){
let newPost = {
id:-1,
title:"",
slug:"",
mainContent:"",
excerpt:"",
postType:"",
contentStatus:(this.parent.adminUser.topRole=='CONTRIBUTOR')?"DRAFT":"PUBLISH",
featuredImageUrl:"",
keywords:"",
tags:"",
likes:0,
views:0,
sidebarType:"NONE",
sidebarWidgets: "[]",
allowComments:false,
isFeatured:false,
isSticky:false,
showSubscribe:false,
categoryId:null,
category:null,
username:"",
tenantId:-1,
tenantUuid:''
}
return newPost;
}//newPost()

getItems(){
    return this.posts$;
}
/**
 * 
 * @param {any} items 
 */
async setItems(items){
this.state.stateObject.posts = items;
await this.setDisplay();
}//
}//class