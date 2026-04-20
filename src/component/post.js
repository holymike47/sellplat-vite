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
console.log("main in post");
console.log(this.main);
//let controller = new AbortController();
//
/**@type {any|null}*/this.postDto = null;//admin
/**@type {any|null}*/this.postViewDto = null;//guest
/**@type {number}*/this.homePageId;
/**@type {any[]|null}*/this.posts$ = null;
/**@type {any[]|null}*/this.displayPosts = [];
/**@type {any|null}*/this.post$ = null;
//list
/**@type {any[]|null}[*/this.categories$ = null;
/**@type {any|null}*/this.category$ = null;
/**@type {string[]}*/this.categoryTitles = [];
//
/**@type {string[]}*/this.postTags = [];
/**@type {string[]}*/this.allTags = [];


//
//used components
/**@type {any}*/this.pb = new PageBuilder(this.main,this);//pageBuilder
this.widget = new Widget(main,this);
this.title = "post";
this.headerTemplate = null;
this.footerTemplate = null;
//this.reRender = false;
this.isView = false;//??
//Filtering
this.categoryFilterTerm = 'All';
this.statusFilterTerm = 'All';
//displaying archives
this.archiveTitle = '';
/**@type {any[]|null}*/this.postArchive$ = null;
//for troubleshooting
this.count = 0;
}//

async setDisplay(){
    //step 1
if(!this.postDto){
let state = this.main.utils.clone(this.state);
let r = await this.main.fu.fetch(state);
if(r){
    this.postDto= r;
    if(this.state.type=='list'){
    this.posts$ = this.postDto.posts;
    }else if(this.state.type=='new'){
        this.post$ = this.getNewPost();
    }else if(this.state.type=='edit'){
        this.post$ = this.postDto.posts[0];
    }
}
}
//step 2
if(this.postDto){
//all posts were initially retrieved including pages
this.posts$ = this.postDto.posts.filter(p=>p.postType==this.state.postType);
this.displayPosts = this.posts$;
this.categories$ = this.postDto.categories;
this.categoryTitles = this.categories$.map(c=>c.title);
this.allTags = this.postDto.allTags;
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
console.log(this.postDto);
this.main.viewCache.option = this.postViewDto.option;
this.main.viewCache.menus = this.postViewDto.menus;
this.headerTemplate = await this.getMenuTemplate('main');
this.footerTemplate = await this.getMenuTemplate('footer');
this.main.setTheme(this.main.viewCache.option.activeTheme);
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
let recentPostsWidget = await this.widget.getRecentPostsWidget({inSidebar:false,l:this.posts$.length,cat:category.title,we:true,wi:true,wm:false});
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
<a type="button" href="/app/${this.state.username}/post/${this.state.postType}/new/-1" class="btn btn-primary new-post sp-link sp-admin-link sp-route-link">Add ${this.state.postType} </a> 
</header>

<div class="filter filter-by-status w-25">
  <ul class="list-group list-group-horizontal">
  <li class="list-group-item list-group-item-action active filter-by-status" style="cursor: pointer;" data-status="All">All</li>
  <li class="list-group-item list-group-item-action filter-by-status" style="cursor: pointer;" data-status="publish">Published</li>
  <li class="list-group-item list-group-item-action filter-by-status" style="cursor: pointer;" data-status="draft">Draft</li>
</ul>
</div>

<div class="filter filter-by-category w-25">
<p>Filter by category</p>
</div>

<div class="d-flex justify-content-end">
<form class="row g-3">
<div class="col-auto">
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
//
this.filterPostsByCategoryDiv = this.postFormSection.querySelector('.filter-by-category');
this.searchTermControl = this.postFormSection.querySelector('input.search-term');
this.searchPostsButton = this.postFormSection.querySelector('#searchPostsButton');
this.postListTableSection = this.postFormSection.querySelector('.post-list-table'); 
//
$this.main.pbu.appendChild($this.filterPostsByCategoryDiv,
$this.main.pbu.createSelectElement({id:"filterPostsByCategory",title:"",value:$this.categoryFilterTerm,items:['All',...$this.categoryTitles]})
);
//
this.filterPostsByCategorySelector = this.postFormSection.querySelector('#filterPostsByCategory');
//now
updateView();
addEvents();
return this.postFormSection;
function updateView(){
$this.setListTable();
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
$this.main.pbu.listen($this.filterPostsByCategorySelector,'change',()=>{
    $this.filterPosts($this.filterPostsByCategorySelector.value,'category');
});
//
$this.main.pbu.listen($this.searchPostsButton,'click',()=>{
    let searchTerm = $this.searchTermControl.value;
    //validate();
    $this.searchPosts(searchTerm);
});
//

}//inner
}//func
setListTable(){
let isPost = this.state.postType=='post';
let titles = ["Title","Category","Excerpt","Post Type","Status"];
if(!isPost){
    titles = ["Title","Status"];
}
let items = [];
for(let p of this.displayPosts){
let i = {
id:p.id,
href:`/${this.state.username}/${p.title}/${p.id}`,
titles:[p.title,p.categoryTitle,(p.excerpt)?p.excerpt.substring(0,20)+'...':'',p.postType,p.contentStatus],
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
this.tagsControl = this.postTagsSection.querySelector('textarea.tags');
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

updateView();
addEvents();
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
//$this.featuredImageTemplate = $this.main.mh.getImageTemplate({src:$this.main.mh.getImageUrl(p.featuredImageUrl,'grid'),width:"72", height:"57"});
$this.featuredImageTemplate = $this.main.mh.getImageTemplate({src:($this.state.type=='new')?'':$this.main.mh.getImageUrl(p.featuredImageUrl,'grid')});
// if(p.featuredImageUrl){
//     $this.main.pbu.show($this.featuredImageTemplate.originalButton);
// }
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
$this.pb.isView = false;
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
    $this.autoCompleteTag();
});
$this.main.pbu.listen($this.tagsControl,'blur',()=>{
    $this.tagIntendedList.innerHTML = '';
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
      <p><img src=${this.main.mh.getImageUrl(p.featuredImageUrl,'public')} alt="" class="img-thumbnail featured-image"/></p>
    </div>
  <div class="px-0">
    <h1 class="display-4 fst-italic title">${p.title}</h1>
  </div>
  
</div><!--#Post title and feature image-->

<div class="post-meta ${this.main.pbu.showIf(this.state.postType!='page')}">
<a href="/${this.state.username}/category/${p.categoryTitle}/${p.categoryId}" class="btn btn-sm mx-1">${p.categoryTitle}</a>
</div>
  
<div class="main-content">
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
</main>
<footer class="footer">
${this.main.pbu.outerHTML(this.footerTemplate?this.footerTemplate:this.getMenuTemplate('footer'))}
</footer>
<p class="mb-0 float-end">
  <a href="#">Back to top</a>
</p>
</div>
<!--#viewContainer-->
`  
);

this.mainContentDiv = this.postDetailSection.querySelector('div.main-content');
this.sidebarDiv = $this.postDetailSection.querySelector('div.sidebar');

if(!this.state.isArchive){
await updateView();
}
console.log(this.postDetailSection.outerHTML);
return this.postDetailSection;

async function updateView(){
$this.pb.isView = true;
$this.pb.pbInput = $this.post$.mainContent;
let responseDiv = await $this.pb.initilizePageBuilder($this.state.type);
$this.main.pbu.replace($this.mainContentDiv,responseDiv);
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
    <a class="${this.main.pbu.showIf(this.main.viewCache.option.logoUrl)} sp-detail sp-slug-link me-2" data-slug="home" href="/${this.state.username}"><img width="60" height="60" src="${this.main.viewCache.option.logoUrl}" /></a>
    <a class="nav-link sp-nav-link sp-site-title sp-detail sp-slug-link" data-slug="home" href="/${this.state.username}">${this.main.viewCache.option.siteName}</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      </ul>
      <form class="d-flex search-post position-relative" role="search">
        <input class="form-control me-2 search-post" type="search" placeholder="Search" aria-label="Search"/>
        <button class="btn sp-btn search-post" type="button">Search</button>
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
let theMenu = this.main.viewCache.menus.filter(m=>m.slug==slug)[0];
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
    this.main.utils.searchPosts(searchControl,true);
});
//
this.main.pbu.listen(searchButton,'click',()=>{
    if(searchControl.value){
        this.main.utils.searchPosts(searchControl,true);
    }
    
});

//forms
let forms = this.main.pbu.queryAll('.sp-contact-form')||[];
for(let form of forms){
    this.processForms(form);
}
//
}//inner
/**
 * 
 * @param {string} filterTerm 
 * @param {string} type 
 */
filterPosts(filterTerm,type){
    //temporary rememdy for possibly event bubbling.......
    if(!filterTerm){return;}
    //filterTerm = filterTerm.toLowerCase();
   //type: category - when filtering post by category
   //type: status - when filtering post by content status ie publis, draft
    //let displayPosts = [];
    //let displayPosts;
switch(type){
    case 'category':
        //note
        this.categoryFilterTerm = filterTerm;
        if(this.categoryFilterTerm=='All'){
            this.displayPosts = this.posts$;
        }else{
            this.displayPosts = this.posts$.filter(p=>p.categoryTitle==this.categoryFilterTerm);
        }

        if(this.statusFilterTerm=="All"){
           //do nothing
        }else{
            this.displayPosts = this.displayPosts.filter(p=>p.contentStatus==this.statusFilterTerm);
        }
        break;
    case 'status':
        //note
        this.statusFilterTerm = filterTerm;
        if(this.statusFilterTerm=='All'){
            this.displayPosts = this.posts$;
        }else{
            this.displayPosts = this.posts$.filter(p=>p.contentStatus==this.statusFilterTerm);
        }

        if(this.categoryFilterTerm=='All'){
            //do nothing
        }else{
            //note: categoryFilterTerm = categoryTitle
            this.displayPosts = this.displayPosts.filter(p=>p.categoryTitle==this.categoryFilterTerm);
        }
        
        break;
}//switch

this.setListTable();
}//func

/**
 * 
 * @param {string} searchTerm 
 */
searchPosts(searchTerm){
let regex = new RegExp(`${searchTerm}`, "i");
this.displayPosts= this.posts$.filter(i=>regex.test(i.title));
//reset filter terms
this.categoryFilterTerm = this.statusFilterTerm =  'All';
this.setListTable();
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
let defaultRecentPostsWidget = {m:'recentPosts',v:{inSidebar:true,l:3,cat:'All',we:true,wi:true,wm:true}};
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




createCategory(){
let state = this.main.getState(`/app/${this.state.username}/category/${this.state.postType}/new/-1`);
let categoryComponent = new Category(this.main,state);
categoryComponent.isPartial = true;
categoryComponent.category$ = categoryComponent.getNewCategory();
categoryComponent.categories$ = this.categories$;
let template = categoryComponent.getFormTemplate();
categoryComponent.saveCategoryButton.remove();
let modal = this.main.utils.setModal('New Category',template);
//modal.confirm.remove();
//modal.cancel.remove();
this.main.pbu.listen(modal.confirm,'click',async()=>{
this.category$ = await categoryComponent.saveCategory();
});

this.main.pbu.listen(modal.dismiss,'click',()=>{
this.post$.categoryTitle = this.category$.title;
this.post$.categoryId = this.category$.id;
this.categories$.push(this.category$);
this.renderCategories();
});

}//func
renderCategories(){
this.categoryTitles = this.categories$.map(c=>c.title);
this.postCategoriesDiv.innerHTML = '';
this.main.pbu.appendChild(this.postCategoriesDiv,
this.main.pbu.createSelectElement({id:"categoryTitle",value:this.post$.categoryTitle,items:['None',...this.categoryTitles],clasz:['my-2']}));
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
if(this.post$.tags){
this.postTags = this.post$.tags.split(this.main.config.SPLITTER);
}
this.postTagsListDiv.innerHTML = ''	;
for(let t of this.postTags){
let span = 
`
<span class="mx-2">${this.main.utils.capitalize(t)} <i class="bi bi-file-x post-tags-remove" style="cursor: pointer;"></i></span>
`;
this.main.pbu.appendChild(this.postTagsListDiv,span);
}//for
//events
let removeTags = this.postTagsListDiv.querySelectorAll('.post-tags-remove');
for(let el of removeTags){
this.main.pbu.listen(el,'click',()=>{
    this.removeTag(el);
});
}
}//
addNewTag(){
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
if(!this.postTags.includes(t)){
this.postTags.push(t);
}
if(!this.allTags.includes(t)){
this.allTags.push(t);
}
}
this.tagsControl.value = '';//reset form
this.renderTags();
console.log(this.allTags);
}// #addNewTag()
/**
 * 
 * @param {HTMLElement} el 
 */
removeTag(el){
let tag = el.parentElement.textContent.trim();
this.main.utils.deleteItem(tag,this.postTags);
this.renderTags();
}// removeTag()

autoCompleteTag(){
let tag = this.tagsControl.value
if(!tag || tag.length<2){return;}
let regex = new RegExp(`^${tag}`, "i");
let allTags = this.allTags.filter(t=>regex.test(t));
if(allTags.length>0){
    this.tagIntendedList.innerHTML = '';
for(let t of allTags){
        let li = `<li class="list-group-item" style="cursor: pointer;">${t}</li>`
        this.main.pbu.createElement('li',['list-group-item'],t);
        this.main.pbu.appendChild(this.tagIntendedList,li);
    }
    this.main.pbu.show(this.tagIntendedList);
let tagLists = this.tagIntendedList.querySelectorAll('li');
    for(let l of tagLists){
        this.main.pbu.listen(l,'click',()=>{
            this.tagsControl.value = l.textContent;
            this.main.pbu.hide(this.tagIntendedList);
        });
    }
}
}//func

/**
 * 
 * @param {string} pbMessage 
 */
async submitPost(pbMessage){
console.log("main in submit");
console.log(this.main);
if(!this.main.vu.required(this.postTitleControl)){
    return;
}
let title = this.postTitleControl.value;
if(this.state.postType=='page' && this.state.type=='new' && this.main.config.RESERVED_TITLES.includes(title.toLowerCase())){
    this.main.utils.notify('This title is reserved',1,'d');
    return;
}

//process featured image
let oldImageId;
let newImageId = await this.main.mh.uploadToServer(this.featuredImageSection.querySelector('div.image-template'));
if(newImageId && newImageId !=this.post$.featuredImageUrl){
   if(this.post$.featuredImageUrl){
    oldImageId = this.main.utils.clone(this.post$.featuredImageUrl);
    }
    this.post$.featuredImageUrl = newImageId; 
}

//process category
let categoryTitle,categoryId;
if(this.state.postType!='page'){
categoryTitle = this.categoryTitleSelector.value;
categoryId = this.main.utils.getItemIdFromTitle(categoryTitle,this.categories$) || -1;
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
    inSidebar:true,
    l:l,
    cat:cat,
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
featuredImageUrl:this.post$.featuredImageUrl,
keywords:this.post$.keywords,
tags:this.postTags.join(this.main.config.SPLITTER),
likes:this.post$.likes,
views:this.post$.views,
contentStatus: this.contentStatusDiv.querySelector('input:checked').value,
allowComments:this.allowCommentsControl.checked,
isFeatured:this.isFeaturedControl.checked,
isSticky:this.isStickyControl.checked,
sidebarType:this.sidebarTypeSelector.value,
sidebarWidgets:JSON.stringify(sidebarWidgets),
categoryTitle:categoryTitle,//
categoryId:categoryId,
category:null
}
this.main.utils.sign(post);
//now save post
console.log('before submit');
console.log(post);
let state = this.state;
console.log(state);
state.body = JSON.stringify(post);
let r = await this.main.fu.fetch(state);
if(r>0){
this.main.utils.notify('Saved',0,'s');
if(oldImageId){
this.main.mh.deleteFromServer({imageIds:[oldImageId]});
}
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
contentStatus:"PUBLISH",
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
categoryTitle:'None',
categoryId:-1,
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
this.posts$ = items;
await this.setDisplay();
}

}//class