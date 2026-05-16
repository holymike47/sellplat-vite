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
//this.posts$ = this.stateObject.posts;??
if(this.state.type=='list'){
    this.posts$ = this.state.stateObject.posts;
    //note: categories is sent wether list or new or edit
    }else if(this.state.type=='new'){
        this.post$ = this.getNewPost();
    }else if(this.state.type=='edit'){
        this.post$ = this.state.stateObject.post;
        this.postTags = (this.post$.tags)?this.post$.tags.split(this.main.config.SPLITTER).map(t=>this.main.utils.capitalize(t)):[];
    }
////step 2
this.categories$ = this.state.stateObject.categories;
this.categoryTitles = this.categories$.map(c=>c.title);
this.allTags = this.state.stateObject.allTags.map(t=>this.main.utils.capitalize(t));
//
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

console.log("this.posts$");
console.log(this.posts$);
}

}//func



async getClientHome(){
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(this.state.username,false)+ `/home/${this.state.archiveType}/${this.state.id}`;
state.isGuest = true;
let r = await this.main.fu.fetch(state);
if(r){
this.postViewDto = r;
console.log("postViewDto");
console.log(this.postViewDto);

this.headerTemplate = await this.getMenuTemplate('main');
this.footerTemplate = await this.getMenuTemplate('footer');
this.main.setTheme(this.postViewDto.option);
if(state.isArchive){
this.getArchive();
}else{
this.getPost();
}
}
}//func

async getPost(){
if(this.state.isInit){
this.post$ = this.postViewDto.posts[0];
//set id of home state
this.state.id = this.post$.id;
}else{
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(this.state.username,false)+ `/home/post/${this.state.id}`;
state.isGuest = true;
let r = await this.main.fu.fetch(state);
if(r){
this.post$ = r;
console.log("this.post$");
console.log(this.post$);
}else{//do nothing}
}
}//func
let postDetail = await this.getDetailTemplate();
this.main.pbu.mount(postDetail);
this.addViewEvents();
}
async getArchive(){
let category;
    if(this.state.isInit){
category = this.postViewDto.categories[0];
this.posts$ = this.postViewDto.posts;

}else{
    let state = this.main.utils.clone(this.state);
    state.link = this.main.fu.getApi(this.state.username,false)+ `/home/posts/category/${this.state.id}`;//state.id=categoryId
    let r = await this.main.fu.fetch(state);
    if(r){
this.postViewDto = r;
category = this.postViewDto.categories[0];
this.posts$ = this.postViewDto.posts;
    }  
}

//template section
//simulate category as a post to enable use of detailTemplate
this.post$ = {
title:category.title,
featuredImageUrl:category.featuredImageUrl,
sidebarType:"NONE"
};
let postDetail = await this.getDetailTemplate();
let mainContentDiv = postDetail.querySelector('div.main-content');
let recentPostsWidget = await this.widget.getRecentPostsWidget({l:this.posts$.length,cat:category.id,we:true,wi:true,wm:false});
let description = `<p>${category.description}</p>`;
this.main.pbu.appendChild(mainContentDiv,description,recentPostsWidget.querySelector('[m]'));
this.main.pbu.mount(postDetail);
this.addViewEvents();

}//func
/**
 * 
 * @param {any} error the spResponse object, contains message - for client, errorMessage for root
 */
async get404Page(error){
//if error is init ie first visit, no postDetail, so show error in body
let mainContent = this.postDetailSection?.querySelector('main#mainContent') || this.main.pbu.query('body');
mainContent.innerHTML = 
`
<div class="col-md-12 text-center">
<h1>404</h1>
<h2 class="d-none">Page Not Found</h2>
<h2>${error.message}</h2>
<p class="text-danger ${this.main.pbu.showIf(import.meta.env.MODE=='development')}">${error.errorMessage}</p>
</div>
`; 
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
    //$this.autoCompleteTag();
    $this.autoComplete($this.tagsControl,false,'tag');
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

async getDetailTemplate() {
let $this=this;
let p = this.post$;
this.postDetailSection = this.main.pbu.createElement('main',['post']);
this.main.pbu.appendChild(this.postDetailSection,
`
<!--viewContainer-->
<div id = "viewContainer" class="container-fluid" style="min-height: 100vh;">
<header class="header mb-4">
${this.main.pbu.outerHTML(this.headerTemplate?this.headerTemplate:this.getMenuTemplate('main'))}
</header>
<main id="mainContent" class="sp-container">
     <!--Row-->
<div class="row sp-row">
  <div class="content ${this.main.pbu.addClassIf(p.sidebarType=='NONE',['col-12'],['col-md-9','order-2'])}">
<!--Post title and feature image-->
<div class="cover ${this.main.pbu.showIf(p.slug!='home')} ${this.main.pbu.addClassIf(!p.featuredImageUrl,['p-4', 'p-md-5','mb-4','rounded','text-body-emphasis', 'bg-body-secondary'])}">
  <div class="featured-image ${this.main.pbu.showIf(p.featuredImageUrl)}">
      <img src=${this.main.mh.getImageUrl(p.featuredImageUrl,'public')} alt="" class="featured-image d-block mx-auto"/>
    </div>
  <div class="px-0">
    <h1 class="display-4 fst-italic title text-center">${p.title}</h1>
  </div>
  
</div><!--#Post title and feature image-->

<div class="post-meta ${this.main.pbu.showIf(this.state.postType!='page')}">
<a href="/${this.state.username}/category/${p.categoryTitle}/${p.categoryId}" class="btn btn-sm mx-1">${p.categoryTitle}</a>
</div>
  
<div class="main-content">
</div>

<div class="subscribe">
</div>

  </div>
<!--Right sidebar-->
  <div class="sidebar position-sticky ${this.main.pbu.showIf(p.sidebarType!='NONE')}
  ${this.main.pbu.addClassIf(p.sidebarType='LEFT',['col-md-3','order-1'])}
  ${this.main.pbu.addClassIf(p.sidebarType='right',['col-md-3','order-3'])}
  "> 
  </div>
  <!--#Right sidebar-->
</div>
<!--#Row-->
<section id="promptModalSection">

</section>
</main>
<footer class="footer">
${this.main.pbu.outerHTML(this.footerTemplate?this.footerTemplate:this.getMenuTemplate('footer'))}
</footer>
<p class="mb-0 float-end">
  <a href="/app/${this.state.username}/login">Login</a>
</p>
</div>
<!--#viewContainer-->
`  
);

this.mainContentDiv = this.postDetailSection.querySelector('div.main-content');
this.sidebarDiv = $this.postDetailSection.querySelector('div.sidebar');
this.subscribeDiv = $this.postDetailSection.querySelector('div.subscribe');

if(!this.state.isArchive){
await updateView();
}
console.log(this.postDetailSection.outerHTML);
return this.postDetailSection;

async function updateView(){
$this.pb.isView = $this.widget.isView = true;
$this.pb.pbInput = $this.post$.mainContent;
let responseDiv = await $this.pb.initilizePageBuilder($this.state.type);
$this.main.pbu.replace($this.mainContentDiv,responseDiv);
//subscription
if(p.showSubscribe && ! $this.main.utils.genCookie(false,$this.state.username)){
let cta = $this.pb.getCtaComponent({type:'detail',v:{headingText:'SUBSCRIBE',bodyText:$this.subscribeText,bText:'SUBSCRIBE'},dClass:[],bclasz:['subscribe']});
let p = cta.querySelector('[p]');
$this.main.pbu.replace($this.subscribeDiv,p);
}
//add widgets to sidebar
/**@type {any[]}*/let sidebarWidgets = JSON.parse($this.post$.sidebarWidgets)||[];
    for(let w of sidebarWidgets){
        switch(w.m){
            case 'recentPosts':
                let recentPostsWidget = await $this.widget.getRecentPostsWidget({v:w.v});
                let recentPostsHeading = $this.main.pbu.createElement('h3',[],'Recent Posts');
                $this.main.pbu.appendChild($this.sidebarDiv,recentPostsHeading,recentPostsWidget.querySelector('[m]') );
                break;
        }//switch
    }//for

}

}//func
/**
 * 
 * @param {string} slug 
 * @param {string[]} clasz 
 * @returns 
 */
async getMenuTemplate(slug,clasz=[]){
    let isMain = slug=='main';
    let nav = this.main.pbu.createElement('nav',['navbar','navbar-expand-lg','navbar-light','bg-white','sp-navbar']);
    if(isMain){
        nav.innerHTML = 
    `
    <div class="container-fluid">
    <a class="${this.main.pbu.showIf(this.postViewDto.option.logoUrl)} sp-detail sp-slug-link me-2" data-slug="home" href="/${this.state.username}"><img width="60" height="60" src="${this.main.mh.getImageUrl(this.postViewDto.option.logoUrl,'public')}" /></a>
    <a class="nav-link sp-nav-link sp-site-title sp-detail sp-slug-link" data-slug="home" href="/${this.state.username}">${this.postViewDto.option.siteName}</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      </ul>
      <form class="d-flex search-post auto-complete position-relative" role="search">
        <input class="form-control me-2 search-post" type="search" placeholder="Search" aria-label="Search"/>
        <button class="btn btn-primary search-post" type="button">Search</button>
      </form>
    </div>
  </div>
    `;
    }else{
        nav.innerHTML = 
    `
    <div class="container mx-auto">
      <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
      </ul>
  </div>
    `;
    }
    
let menuUl = nav.querySelector('.navbar-nav');
let theMenu = this.postViewDto.menus.filter(m=>m.slug==slug)[0];
if(theMenu.menuItems){
let menuItems = JSON.parse(theMenu.menuItems);
let navItem,navLink;
let url,state;
for(let m of menuItems){
    let children = m.children;
    let isCustom = m.postType=='custom';
    let isHome = m.title.toLowerCase()=='home';
      if(isCustom){
        url = m.link;
      }else if(isHome){
        url = `/${this.state.username}`;
      }else{
        state = this.main.getHomeState(this.state.username,m.title,m.postId);
        url = state.url;
      }
        if(children.length==0){
        navItem = this.main.pbu.createElement('li',['nav-item']);
        menuUl.appendChild(navItem);
        navLink = `<a href="${url}" class="sp-nav-link nav-link ${this.main.pbu.addClassIf(isHome,['sp-slug-link'])} ${this.main.pbu.addClassIf(!isCustom,['sp-detail'])}">${m.title}</a>`;
        this.main.pbu.appendChild(navItem,navLink);
    }else{
    //child menu
    navItem = this.main.pbu.createElement('li',['nav-item','dropdown']);
    menuUl.appendChild(navItem);
    navLink = `<a href="#"  class="dropdown-toggle sp-nav-link nav-link ${isCustom?'':'sp-detail'}" role="button" data-bs-toggle="dropdown" aria-expanded="false">${m.title}</a>`;
    let subMenuUl = this.main.pbu.createElement('ul',['dropdown-menu']);
    this.main.pbu.appendChild(navItem,navLink,subMenuUl);
    for(let c of children){
        isCustom = c.postType=='custom';
        isHome = m.title.toLowerCase()=='home';
        if(isCustom){
        url = c.link;
      }else if(isHome){
        url = `/${this.state.username}`;
      }else{
        state = this.main.getHomeState(this.state.username,c.title,c.postId);
        url = state.url;
      }
        navItem = this.main.pbu.createElement('li',['nav-item']);
        subMenuUl.appendChild(navItem);
        navLink = `<a href="${url}" class="sp-nav-link nav-link ${this.main.pbu.addClassIf(isHome,['sp-slug-link'])} ${this.main.pbu.addClassIf(!isCustom,['sp-detail'])}">${c.title}</a>`;
        this.main.pbu.appendChild(navItem,navLink);
    }
    }
}//for
}
return nav;
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

addViewEvents(){
let detailLinks = this.main.pbu.queryAll('a.sp-detail'); 
for(let link of detailLinks){
  this.main.pbu.listen(link,'click',(e)=>{
    e.preventDefault();
    let isInit = false;
    if(link.classList.contains('sp-slug-link')){
        //clicking on site logo or home to simulate site refresh
        isInit = true;
    }
    this.main.handleView(link.pathname,isInit);
  });
}//for
// search
let searchForm = this.main.pbu.query('form.search-post');
let searchControl = searchForm.querySelector('input.search-post');
let searchButton = searchForm.querySelector('button.search-post');

this.main.pbu.listen(searchControl,'input',()=>{
    this.autoComplete(searchControl,true,'post');
});
//
this.main.pbu.listen(searchButton,'click',()=>{
    if(searchControl.value){
        this.autoComplete(searchControl,true,'post');
    }
    
});

//forms
let forms = this.main.pbu.queryAll('.sp-contact-form')||[];
for(let form of forms){
    this.processForms(form);
}
//
//subscribe
let subscribeButtons = this.main.pbu.queryAll('a.subscribe')||[];
for(let button of subscribeButtons){
    this.main.pbu.listen(button,'click',(e)=>{
    e.preventDefault();
    button.removeAttribute('href');
    let form = this.main.pbu.createElement('form',['subscribe']);
    form.innerHTML = 
    `
    ${this.main.pbu.createFormControl({serialize:true,title:"Name",placeholder:"Name",clasz:['name','sp-validation-required']})}
    ${this.main.pbu.createFormControl({serialize:true,title:"Email",placeholder:"Email",type:"email",clasz:['email','sp-validation-required']})}
    <a class="btn btn-primary w-100 my-2 sp-button" type="button">Subscribe</a>
    `
    let nameControl = form.querySelector('input.name');
    let emailControl = form.querySelector('input.email');
    let subscribeButton = form.querySelector('.sp-button');
    let modal = this.main.utils.setModal('SUBSCRIBE',form);
    modal.confirm.remove();
    modal.cancel.remove();
    
    this.main.pbu.listen(subscribeButton,'click',async ()=>{
        modal.init();
      //validate title
      if(!this.main.vu.validate(form.querySelectorAll('input.sp-validation'))){
        return;
      }
      //
      let state = this.main.utils.clone(this.state);
      this.subscriber = {
        firstName:nameControl.value,/**important,to enable binding on backend */
        email: emailControl.value
        };
      
      state.link = this.main.fu.getApi(state.username,false,'exists');
      state.body = this.subscriber.email;
      state.notice = modal.notice;
      let r = await this.main.fu.fetch(state);
        if(r=='exists'){
            //you ve already subscribed
            this.main.pbu.addClass(button,['disabled']);
            this.main.utils.genCookie(true,state.username);
            this.main.pbu.replace(form,'Thank you for subscribing');
        }else{
        this.authToken= r;
        modal.title.textContent="Please enter the token sent to you";
        let authTokenTemplate = this.main.tu.authToken();
        this.main.pbu.replace(form,authTokenTemplate.section);
        //events
        this.main.pbu.listen(authTokenTemplate.button,'click',async ()=>{
            modal.init();
            if(! this.main.vu.validate(authTokenTemplate.input)){return;}
            if(authTokenTemplate.input.value==this.authToken){
                //now save subscriber
            state.link = this.main.fu.getApi(this.state.username,false,'subscribe');
            state.body = JSON.stringify(this.subscriber);
            let r = await this.main.fu.fetch(state);
            if(r=='ok'){
                this.main.pbu.addClass(button,['disabled']);
               this.main.utils.genCookie(true,state.username);
               this.main.pbu.replace(form,'Thank you for subscribing');
            }
                

            }else{
                this.main.utils.notify('Wrong, please try again',2,'c',modal.notice);
            }
        });
        }

    //   if(r=='ok'){
    //     form.innerHTML = '<p>Thank You</p>';
    //   }
      
    });
    });
    
}
}//inner
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

/**
 * 
 * @param {HTMLFormElement} form 
 */
processForms(form) {
let phoneFields = form.querySelectorAll('input[type=tel]');
for(let pf of phoneFields){
let iti = this.main.intlTelInput(pf, {
  onlyCountries: ["us","ca","ng"],
  strictMode: true,
  loadUtils: () => import("intl-tel-input/utils"),
});
};


let submitButton = form.querySelector('.sp-form-submit-button');
this.main.pbu.listen(submitButton,'click',async ()=>{
    let controls = form.querySelectorAll('.sp-form-control:not(div)')||[];
    if(controls.length>0){
        if(!this.main.vu.validate(controls)){
        return;
    }
    let title,value;
    let message = "";
    for(let c of controls){
        title = c.closest('div.sp-form-control').querySelector('.sp-form-title').textContent;
        value = c.value;
        message += `\n${title}:${value}`;
    }
    console.log(message);
    let state = this.main.utils.clone(this.state);
    state.link = this.main.fu.getApi(state.username,false,'submit-contact-form');
    state.body = JSON.stringify(message);
    let r = await this.main.fu.fetch(state);
    if(r && r.id==200){
        this.main.pbu.appendChild(submitButton.parentElement,
    `<p class="border border-success mt-2 p-2">Thank you for your message. We will get back to you shortly</p>`);
    submitButton.setAttribute("disabled","disabled");
    }
}
})

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
let pcn = this.post$.categoryIds;
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
console.log(pcn);
}//
//############# TAGS ######################
renderTags(){
this.postTags = this.postTags || [];
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
this.main.utils.deleteItem(tag,this.postTags);
el.parentElement.remove();
console.log("updated posttags");
console.log(this.postTags);
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
console.log(this.allTags);
}// #addNewTag()

/**
 * 
 * @param {string} pbMessage 
 */
async submitPost(pbMessage){
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
// return;
///
let post = {
id:this.post$.id,
title:title,
slug:title.toLowerCase(),
mainContent:pbMessage,
excerpt:this.post$.excerpt,
postType:this.state.postType,
featuredImageUrl:(this.state.postType=='post')?await this.main.mh.uploadToServer(this.featuredImageSection.querySelector('div.image-template')):'',
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
this.main.utils.sign(post,this.state);
//now save post
console.log('before submit');
console.log(post);
let state = this.state;
console.log(state);
state.body = JSON.stringify(post);
let r = await this.main.fu.fetch(state);
if(r>0){
this.main.utils.notify('Saved',0,'d');
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

/**
 * 
 * @param {HTMLInputElement} input 
 * @param {boolean} isView 
 */
async autoComplete(input,isView,type='post'){
let form = input.closest('form.auto-complete');
let searchTerm = input.value;
if(!searchTerm){
//dynamically created, populated with search
let div = form.querySelector('.sp-div');
div?.remove();
}
if(!this.main.vu.sanitize([input])){
    return;
}
searchTerm = searchTerm.trim().toLowerCase();
if(searchTerm.length<2){
return;
}
//let regex = new RegExp(`${searchTerm}`, "i");
let items;
switch(type){
    case 'post':
        if(isView){
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(state.username,false,`/home/posts/${state.postType}/-1`,[{n:'limit',v:-1}]);
items = await this.main.fu.fetch(state);
}else{
items = [...this.posts$];
}
items = items.filter(p=>p.title.toLowerCase().includes(searchTerm));
        break;
    case 'tag':
        items = this.allTags?.filter(t=>t.includes(this.main.utils.capitalize(searchTerm)));
        break;
}
        if(items && items.length>0){
            form.querySelector('.sp-div')?.remove();
           let div = this.main.pbu.createElement('div',['position-absolute','sp-div']);
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
                let state = this.main.getHomeState(i.username,i.title,i.id,'s');
               li = this.main.pbu.createElement('li',['list-group-item'],`${i.title} (${i.postType})`,[{n:'data-url',v:state.url}]);
            }else{
                li = this.main.pbu.createElement('li',['list-group-item'],`${i}`);
            }
        
        selectedList.appendChild(li);
        //
        this.main.pbu.listen(li,'click',()=>{
            if(type=='post'){
                let url = li.getAttribute('data-url');
            if(isView){
                this.main.handleView(url,false);
            }else{
                input.value= this.main.config.HOSTNAME + url;
            }
            }else{
                input.value = li.textContent;
            }
            
          div.remove();
        });
      }
      let rect = input.getBoundingClientRect();
      div.style.left =  "0px";
      if(type=='post' && isView){
        div.style.top =  rect.bottom  + "px";
      }
     
     form.appendChild(div);
      //
      this.main.pbu.listen(input,'blur',(e)=>{
        if(e.rangeParent.parentElement.nodeName=='LI'){
            return;
        }
        div?.remove();
      });
        }

        
}//func

}//class