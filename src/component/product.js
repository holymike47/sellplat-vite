// @ts-check
import { Category } from "./category";
import { PageBuilder } from "./page-builder";
import { Menu } from "./menu";
import { Dashboard } from "./dashboard";
import { MediaHandler } from "./media-handler";
export class Product{
/**
 * 
 * @param {any} shared 
 * @param {any} state 
 */
constructor(shared,state){
this.shared = shared;//used when using this component to create another
this.config = shared.config;
this.utils = shared.utils;
this.pbu = shared.pbu;
this.main = shared.main;
//
this.state = state;
this.admin = state.isAdmin;
this.isPreview = state.isPreview;
this.username = state.username;
this.type = state.type;
this.id = state.id;
this.postType = state.postType;
this.postId = state.postId;
//
/**@type {any[]}*/this.products$ = [];
/**@type {any[]}*/this.displayProducts$ = [];
/**@type {any}*/this.product$ = {};
/**@type {number}*/this.productId;
//
/**@type {any}*/this.category$ = {};//single category in question
/**@type {any[]}*/this.categories$ = [];//all categories
/**@type {any[]}*/this.productCategories = []; //
//
/**@type {string[]}*/this.categoryNames = ['All'];
/**@type {string[]}*/this.displayCategoryNames = [];
/**@type {string[]}*/this.productCategoryNames = [];//for dispay

//
/**@type {string[]}*/this.productTags = [];//tags assigned to prodduct
/**@type {string[]}*/this.allTags = [];//all tags in the system
/**@type {number[]}*/this.productIdsToDelete = [];
//
/**@type {string}*/this.title = "Products";
//used components
/**@type {any}*/this.pb = null;//pageBuilder
this.mediaHandler = new MediaHandler(this.shared);

if(state.isAdmin && (state.type=='list' || state.type=='edit')){
this.process();
}else if(state.type=='new' && state.id==-1){
this.product$ = {};
this.route();
}
}//

async process(){
let url;
let request;
let list = this.state.type=='list';
if(list){
    url = 'https://codecapt.com/wp-json/wc/v3/products';
}else{
    url = `https://codecapt.com/wp-json/wc/v3/products/${this.state.id}`;
}
request = {
        url: url,
        postType: 'product',
        isAdmin: true
    };
let r = await this.utils.fetch2(request);
if(r){
if(list){
this.products$ = r;
this.displayProducts$ = this.products$;
console.log('this.products$');
console.log(this.products$);
//fetch categories
request = {
        url: 'https://codecapt.com/wp-json/wc/v3/products/categories',
        postType: 'product',
        isAdmin: true
    };
r = await this.utils.fetch2(request);
if(r){
this.categories$ = r;
this.setDisplayCategories();
}else{
this.utils.notify("Error Retrieving Product Categories",2,'s');   
}

}else{
this.product$ = r;
}
//console.log(r);
this.route();
}else{
this.utils.notify("Error Retrieving Products",2,'s');
}
}//func

async route(){
if(!this.state.isPop){
this.utils.pushState(this.state,this.state.url);
}
if(this.state.type=='list'){
this.getListTemplate();
}
else if(this.state.type=='new' || this.state.type=='edit'){
this.getFormTemplate();
}else if(this.state.type=='detail'){
    this.getProduct(this.id);
}
}//	func
/**
 * 
 * @param {number}  id
 */
async getProduct(id){
let request = {
        url: `https://codecapt.com/wp-json/wc/v3/products/${id}`,
        postType: 'product',
        isAdmin: true
    };
let r = await this.utils.fetch2(request);
if(r){
this.product$ = r;
this.productCategories = this.product$.categories;
this.route();
if(!this.state.isPop){this.main.pushState(this.state);}
  //now replace
}else{
  this.utils.notify('Error',2,'s');
}
}//func
   
getListTemplate(){
let $this = this;
this.postComponent=this.pbu.query('#postComponent').cloneNode(true);
//now mount on dashboard
this.dashboard = new Dashboard(this.shared,{username:this.username,child:this.postComponent});
this.postReplace = this.postComponent.querySelector('#postReplace');
this.postListSection = this.postComponent.querySelector('#postListSection').cloneNode(true);
this.pbu.replace(this.postReplace,this.postListSection);
//
this.addPostButton = this.postListSection.querySelector('a.new-post');
this.addPostButton.textContent = `Add Product`;
this.addPostButton.href = `/app/${this.username}/product/new/-1`;
//filtering
this.filterPostsByContentStatusButtons = this.postListSection.querySelectorAll('.filterPostsByContentStatusButton');
this.filterPostsByCategorySelector = this.postListSection.querySelector('#filterPostsByCategorySelector');
this.tb = this.postListSection.querySelector('tbody');
this.massDeleteButton = $this.postListSection.querySelector('#massDeleteButton');

//now
updateView();
addEvents();

function updateView(){
$this.pbu.setSelectElement($this.filterPostsByCategorySelector,'',$this.categoryNames);
//
$this.tb.innerHTML = '';
for(let p of $this.displayProducts$){
let href = `/${$this.username}/product/${p.name}/${p.id}`;
let editHref = `/app/${$this.username}/product/edit/${p.id}`;
let deleteHref = `/app/${$this.username}/product/delete/${p.id}`;
//tb,href,editHref,deleteHref,title1,title2,title3
$this.pbu.setTableRows($this.tb,href,editHref,deleteHref,p.name);
}//for
}//inner
function addEvents(){
$this.pbu.listen($this.addPostButton,'click',(e)=>{
    e.preventDefault();
    $this.state = $this.main.getState(e,true);
    $this.product$ = $this.getNewProduct();
    $this.route();
});
//
$this.pbu.listen($this.filterPostsByCategorySelector,'change',()=>$this.filterPostsByCategory($this.filterPostsByCategorySelector.value));
//
for(let cs of $this.filterPostsByContentStatusButtons){
$this.pbu.listen(cs,'click',(e)=>$this.filterPostsByContentStatus(e.target.textContent));
}//for
//
let productToDeleteInputs = $this.tb.querySelectorAll('.sp-checkbox');
for(let p of productToDeleteInputs){
$this.pbu.listen(p,'change',(e)=>$this.setProductsToDelete(e.target));
}//for
//
//editLinks
let editLinks = $this.tb.querySelectorAll('.sp-edit');
for(let l of editLinks){
$this.pbu.listen(l,'click',(e)=>{
e.preventDefault(); 
$this.state = $this.main.getState(e,true);
$this.process();
});
}//for

//deleteLinks
let deleteLinks = $this.tb.querySelectorAll('.sp-delete');
for(let l of deleteLinks){
$this.pbu.listen(l,'click',(e)=>{
e.preventDefault(); 
let state = $this.main.getState(e,true);
$this.deleteProducts(state.id);
});
}//for
//detailLinks
let detailLinks = $this.tb.querySelectorAll('.sp-detail');
for(let l of detailLinks){
$this.pbu.listen(l,'click',(e)=>{
e.preventDefault(); 
$this.state = $this.main.getState(e,false);
//$this.state.isPreview = true;
$this.getProduct($this.state.postId);
});
}//for

$this.pbu.listen($this.massDeleteButton,'click',()=>{
let button = $this.pbu.createElement('button','btn');
button.type = 'button';
button.textContent = 'Confirm';
let modal = $this.utils.setModal('Confirm Deletion',button,'');
$this.pbu.listen(button,'click',()=>{
$this.deleteProducts(undefined);
modal.dismiss.click();
});
});
}//inner
}//func
getFormTemplate(){
let $this = this;
this.postComponent=this.pbu.query('#postComponent').cloneNode(true);
this.postReplace = this.postComponent.querySelector('#postReplace');
this.postformSection = this.postComponent.querySelector('#postFormSection').cloneNode(true);
this.pbu.replace(this.postReplace,this.postformSection);
//now mount on dashboard
this.dashboard = new Dashboard(this.shared,{username:this.username,child:this.postComponent});

//main form ie build section for page builder
this.mainForm = this.postformSection.querySelector('.main-form');
this.productNameControl = this.postformSection.querySelector('.product-name');
this.productDescriptionDiv = this.postformSection.querySelector('.product-description');
this.regularPriceControl = this.postformSection.querySelector('.regular-price');
this.salesPriceControl = this.postformSection.querySelector('.sales-price');
//
this.purchaseNoteControl;
this.saveDraftButton = this.postformSection.querySelector('#saveDraftButton');
this.publishButton = this.postformSection.querySelector('#publishButton');
//
this.contentStatusDiv = this.postformSection.querySelector('div.content-status');
this.contentStatusList = this.contentStatusDiv.querySelector('div.content-status');
//sidebar
this.sidebarTypeDiv = this.postformSection.querySelector('div.sidebar-type');
this.sidebarTypeSelector = this.sidebarTypeDiv.querySelector('select.sidebar-type');
//image
this.featuredImageDiv = this.postformSection.querySelector('div.featured-image');
this.featuredImageTemplate = null;//to be obtained dynamically in updateview()
//short_description = excerpt in post
this.shortDescriptionDiv = this.postformSection.querySelector('div.excerpt');
this.shortDescriptionButton = this.shortDescriptionDiv.querySelector('button.excerpt');
//	category
this.postCategoriesDiv = this.postformSection.querySelector('div.post-categories');
this.postCategoriesListDiv = this.postCategoriesDiv.querySelector('div.post-categories');
this.createCategoryButton = this.postformSection.querySelector('button.create-category');
//Tags
this.postTagsDiv = this.postformSection.querySelector('div.post-tags');
this.postTagsListDiv = this.postTagsDiv.querySelector('div.post-tags');
this.tagsControl = this.postTagsDiv.querySelector('textarea.tags');
//advance section
this.featuredDiv = this.postformSection.querySelector('div.is-featured');
this.featuredControl = this.featuredDiv.querySelector('input.is-featured');
this.isStickyDiv = this.postformSection.querySelector('div.is-sticky');
this.isStickyControl = this.isStickyDiv.querySelector('input.is-sticky');
this.reviewsAllowedDiv = this.postformSection.querySelector('div.allow-comments');
this.reviewsAllowedControl = this.postformSection.querySelector('input.allow-comments');

updateView();
addEvents();

function updateView(){
$this.pbu.show($this.featuredImageDiv);
$this.pbu.show($this.shortDescriptionDiv);
$this.pbu.show($this.postCategoriesDiv);
//el,name,value,collections
$this.pbu.setCheckedInputElement($this.postCategoriesListDiv,'name','checkbox',$this.productCategoryNames,$this.displayCategoryNames);
$this.pbu.show($this.postTagsListDiv);
$this.displayTags();
$this.pbu.show($this.featuredDiv,$this.isStickyDiv,$this.reviewsAllowedDiv);
//
//$this.featuredImageTemplate = $this.utils.getImageTemplate($this.post$.featuredImageUrl,'Featured Image');
//$this.featuredImageTemplate = $this.mediaHandler.getImageTemplate($this.post$.featuredImageUrl);
//$this.featuredImageDiv.innerHTML = '';
//$this.featuredImageDiv.appendChild($this.featuredImageTemplate.div);
$this.setDisplayCategories();

$this.pbu.setCheckedInputElement($this.contentStatusList,'contentStatus','radio',$this.product$.status,$this.config.CONTENT_STATUS);
$this.pbu.setSelectElement($this.sidebarTypeSelector,'RIGHT',$this.config.SIDEBAR_LAYOUT);
//
$this.pb = new PageBuilder($this.shared,null,null,$this.state.type);
let rte = $this.pb.getRichTextBlock({standAlone:true,type:'new',text:''});
$this.productDescriptionDiv.innerHTML = '';
$this.productDescriptionDiv.appendChild(rte);
}//inner
function addEvents(){
$this.pbu.listen($this.shortDescriptionButton,'click',()=>{
let div = $this.pbu.createElement('div');
let textarea = $this.pbu.createElement('textarea',['form-control']);
textarea.value = $this.product$.short_description;
let button = $this.pbu.createButton('Save');
$this.pbu.appendChild(div,textarea,button);
let modal = $this.utils.setModal('Post Excerpt',div);
$this.pbu.listen(button,'click',()=>{
    //validate()
$this.product$.short_description = textarea.value;
modal.dismiss.click();   
});
});//listen
//
$this.pbu.listen($this.createCategoryButton,'click',()=>{$this.createCategory();});
//
$this.pbu.listen($this.saveDraftButton,'click',()=>$this.submitProduct("draft"));
$this.pbu.listen($this.publishButton,'click',()=>$this.submitProduct("publish"));
}//inner
}//func
/**
 * 
 * 
 */
getDetailTemplate() {
let $this=this;
this.postDetailSection = this.pbu.query('#postDetailSection').cloneNode(true);
this.pbu.show(this.postDetailSection);
this.contentDiv = this.postDetailSection.querySelector('div.content');
//
this.coverDiv = this.postDetailSection.querySelector('div.cover');
this.featuredImageDiv = this.coverDiv.querySelector('div.featured-image');
this.featuredImage = this.featuredImageDiv.querySelector('img.featured-image');
this.titleControl = this.coverDiv.querySelector('h1.title');
//
this.postMetaDiv = this.postDetailSection.querySelector('div.post-meta');
this.mainContent = this.postDetailSection.querySelector('article.main-content');
this.blogPagination = this.postDetailSection.querySelector('nav.blog-pagination'); 
this.sidebarDiv = $this.postDetailSection.querySelector('div.sidebar');
//
getheaderTemplate();
updateView();//content is been set here
getFooterTemplate();
addEvents();
//
return this.postDetailSection;


function getheaderTemplate(){
let header = $this.postDetailSection.querySelector('.header');
if($this.state.isPreview){
let adminMenu = $this.pbu.createElement('div',['container-fluid']);
header.appendChild(adminMenu);
let backToDashboard = $this.pbu.createElement('a',['btn']);
backToDashboard.textContent = 'Back To Dashboard';
adminMenu.appendChild(backToDashboard);
$this.pbu.listen(backToDashboard,'click',()=>{
    let replace = $this.pbu.query('#replace');
    replace.firstElementChild.innerHTML = '';
    replace.appendChild($this.currentDashboardComponent);
});
}
let nav = $this.pbu.createElement('nav',['navbar','navbar-expand-lg','navbar-light','bg-white','sp-navbar']);
header.appendChild(nav);
let container = $this.pbu.createElement('div',['container']);
nav.appendChild(container);

if($this.option$.logoUrl){
let logoLink = $this.pbu.createElement('a',['sp-home-link']);
container.append(logoLink);
logoLink.href = '/' + $this.username;
logoLink.setAttribute('postId',$this.option$.homePageId);
let img = $this.pbu.createElement('img');
logoLink.appendChild(img);
img.src = $this.option$.logoUrl
img.width="60";
img.height="60";
}
let homeLink = $this.pbu.createElement('a',['sp-home-link','sp-site-title']);
container.appendChild(homeLink);
homeLink.href = '/' + $this.username;
homeLink.setAttribute('postId',$this.option$.homePageId);
if($this.option$.siteName){
//homeLink.classList.add("navbar-brand");
homeLink.textContent = $this.option$.siteName;
}else{
homeLink.textContent = 'Home';
}

let navbarToggler = $this.pbu.createElement('button',['navbar-toggler']);
container.appendChild(navbarToggler);
navbarToggler.type = 'button';
$this.pbu.setAttributes(navbarToggler,['data-bs-toggle','collapse'],['data-bs-target','#navbarSupportedContent'],
['aria-controls','navbarSupportedContent'],['aria-expanded','false'],['aria-label','Toggle navigation']);
navbarToggler.appendChild($this.pbu.createElement('span',['navbar-toggler-icon']));
//
let collapse = $this.pbu.createElement('div',['collapse','navbar-collapse','d-flex','justify-content-end']);
container.appendChild(collapse);
collapse.id = 'navbarSupportedContent';
let mainNav = $this.pbu.createElement('ul',['navbar-nav','ms-auto','mb-2','mb-lg-0']);
collapse.appendChild(mainNav);
let displayMenu = $this.menus$.filter(m=>m.menuOrder<100);
for(let m of displayMenu){
    let mainNavItem = $this.pbu.createElement('li',['nav-item']);
    mainNav.appendChild(mainNavItem);
    let mainNavLink = $this.pbu.createElement('a',['nav-link','sp-link','sp-nav-link']);
    mainNavItem.appendChild(mainNavLink);
    mainNavLink.textContent = m.label;
    mainNavLink.href = m.link;
    mainNavLink.setAttribute('postType',m.postType);
    mainNavLink.setAttribute('postId',m.postId);
    if(m.children.length==0){
         
    }else{
    let dropdown = $this.pbu.createElement('li',['nav-item','dropdown','ms-0']);
    mainNav.appendChild(dropdown);
    let dropdownToggle = $this.pbu.createElement('a',['nav-link','dropdown-toggle','ms-0']);
    dropdown.appendChild(dropdownToggle);
    dropdownToggle.role = 'button';
    dropdownToggle.href = '#';
    dropdownToggle.testContext = 'test';
    $this.pbu.setAttributes(dropdownToggle,['data-bs-toggle','dropdown'],['aria-expanded','false']);
    let subNav = $this.pbu.createElement('ul',['dropdown-menu']);
    dropdown.appendChild(subNav);
        for(let c of m.children){
            let subNavItem = $this.pbu.createElement('li');
            subNav.appendChild(subNavItem);
            let subNavLink = $this.pbu.createElement('a',['dropdown-item','sp-link','sp-nav-link']);
            subNavItem.appendChild(subNavLink);
            subNavLink.href = c.link;
            subNavLink.textContent = c.label;
            subNavLink.setAttribute('postType',m.postType);
            subNavLink.setAttribute('postId',m.postId);
        }

    
        // let test = $this.pbu.createElement('a',['d-inline']);
        // test.textContent = '';
        // mainNavLink.after(test);
        // test.classList.add('dropdown-toggle');
        // test.id = 'navbarDropdown';//??
        // test.role = 'button';
        // $this.pbu.setAttributes(test,['data-bs-toggle','dropdown'],['aria-expanded','false']);
        // let subNav = $this.pbu.createElement('ul',['dropdown-menu']);
        // //mainNavItem.appendChild(subNav);
        // test.appendChild(subNav);
        // subNav.setAttribute('aria-labelledby','navbarDropdown');
        // for(let c of m.children){
        //     let subNavItem = $this.pbu.createElement('li');
        //     subNav.appendChild(subNavItem);
        //     let subNavLink = $this.pbu.createElement('a',['dropdown-item','sp-link']);
        //     subNavItem.appendChild(subNavLink);
        //     subNavLink.href = c.link;
        //     subNavLink.textContent = c.label;
        //     subNavLink.setAttribute('postType',m.postType);
        //     subNavLink.setAttribute('postId',m.postId);
        // }
    }
}//for
// let form = $this.pbu.createElement('form');
// collapse.appendChild(form);
// /**@type {HTMLInputElement}*/let input = $this.pbu.createElement('input',['form-control','me-2']);
// form.appendChild(input);
// input.type = "search";
// input.placeholder = "Search";
// input.setAttribute('aria-label','Search');
// /**@type {HTMLButtonElement}*/let button = $this.pbu.createElement('button',['btn','btn-outline-success']);
// form.appendChild(button);
// button.type = "button";
// button.textContent = 'Search';
// //login
// let loginLink = $this.pbu.createElement('a',['sp-link']);
// collapse.appendChild(loginLink);
// loginLink.href = `${$this.username}/login`;
// loginLink.textContent = 'Login';
}//inner

function updateView(){
//update
if($this.post$.isHome){
    $this.pbu.hide($this.coverDiv);
}

if($this.post$.featuredImageUrl){
$this.pbu.show($this.featuredImageDiv);
$this.featuredImage.src = $this.post$.featuredImageUrl;
}else{
$this.pbu.hide($this.featuredImageDiv);
$this.pbu.addClass($this.coverDiv,['p-4', 'p-md-5','mb-4','rounded','text-body-emphasis', 'bg-body-secondary']);
}
$this.titleControl.textContent = $this.post$.title;
let catMeta;
for(let c of $this.post$.categories){
catMeta = $this.pbu.createElement('a',['btn','btn-sm','mx-1']);
catMeta.type = 'button';
catMeta.textContent= c.name;
catMeta.href='';//set 
$this.postMetaDiv.appendChild(catMeta);
}
//
if($this.state.postType=='page'){
    $this.pbu.hide($this.blogPagination);
}
//content
let pbInput = {
title:$this.post$.title,
message:$this.post$.mainContent,
contentStatus:$this.post$.contentStatus
};
$this.pb = new PageBuilder($this.shared,$this,pbInput,'detail');
$this.pb.isView = true;
let responseDiv = $this.pb.initilizePageBuilder('detail');
$this.mainContent.innerHTML = '';
$this.mainContent.appendChild(responseDiv);
//sidebar
if($this.post$.sidebarType=='NONE'){
$this.contentDiv.classList.add('col-12');
$this.contentDiv.classList.remove(...['col-md-8','order-2']);
}else{
$this.contentDiv.classList.add(...['col-md-8','order-2']);
$this.contentDiv.classList.remove('col-12');

if($this.post$.sidebarType=="LEFT"){
$this.sidebarDiv.classList.add(...['order-1']);
$this.sidebarDiv.classList.remove(...['order-3']);
}else{
//right
$this.sidebarDiv.classList.add(...['order-3']);
$this.sidebarDiv.classList.remove(...['order-1']);
}
}
}//func
function getFooterTemplate(){
let footer = $this.postDetailSection.querySelector('.footer');
let nav = $this.pbu.createElement('nav',['navbar','navbar-expand-lg','navbar-light','bg-white','sp-navbar']);
footer.appendChild(nav);
    let container = $this.pbu.createElement('div',['mx-auto']);
    nav.appendChild(container);
    let mainNav = $this.pbu.createElement('ul',['navbar-nav','mb-2','mb-lg-0']);
    container.appendChild(mainNav);
    let homeLink = $this.pbu.createElement('a',['sp-site-title','sp-home-link']);
    homeLink.href = '/' + $this.username;
    homeLink.setAttribute('postId',$this.option$.homePageId);
    homeLink.setAttribute('postType','page');
mainNav.appendChild(homeLink);
if($this.option$.siteName){
homeLink.textContent = $this.option$.siteName;
}else{
homeLink.textContent = 'Home';
}
let privacyPolicyPage = $this.pbu.createElement('a',['nav-link','sp-link','sp-nav-link']);
privacyPolicyPage.href =  `/${$this.username}/page/privacy-Policy/${$this.option$.privacyPolicyPageId}`;
privacyPolicyPage.setAttribute('postId',$this.option$.privacyPolicyPageId);
privacyPolicyPage.setAttribute('postType','page');
privacyPolicyPage.textContent = 'Privacy Policy';
//
let tos = $this.pbu.createElement('a',['nav-link','sp-link','sp-nav-link']);
tos.href =  `/${$this.username}/page/terms-of-service/${$this.option$.tosPageId}`;
tos.setAttribute('postId',$this.option$.tosPageId);
tos.setAttribute('postType','page');
tos.textContent = 'Terms of Use';
//
let about = $this.pbu.createElement('a',['nav-link','sp-link','sp-nav-link']);
about.href =  `/${$this.username}/page/about-us/${$this.option$.aboutPageId}`;
about.setAttribute('postId',$this.option$.aboutPageId);
about.setAttribute('postType','page');
about.textContent = 'About Us';
//
let contact = $this.pbu.createElement('a',['nav-link','sp-link','sp-nav-link']);
contact.href =  `/${$this.username}/page/contact/${$this.option$.contactPageId}`;
contact.setAttribute('postId',$this.option$.contactPageId);
contact.setAttribute('postType','page');
contact.textContent = 'Contact Us';
$this.pbu.appendChild(mainNav,privacyPolicyPage,tos,about,contact);
}//
function addEvents(){
let homeLinks = $this.postDetailSection.querySelectorAll('.sp-home-link'); 
for(let link of homeLinks){
    $this.pbu.listen(link,'click',(e)=>{
    e.preventDefault();
    let homeState = $this.main.getHomeState($this.username);
    $this.state = homeState;
  $this.getPage($this.username);
    });
} //for
//
let links = $this.postDetailSection.querySelectorAll('.sp-link');
for(let link of links){
    $this.pbu.listen(link,'click',(e)=>{
    e.preventDefault();
    let state = $this.main.getState(e,false);
    $this.state = state;
  $this.getPage(state.postId);
    });
}//for   
}//inner
}//
setupMainForm(){
/**@type {any}*/let pbInput;
if(this.state.type=='edit' || this.state.type=='detail'){
pbInput = {
title:this.post$.title,
message:this.post$.mainContent,
contentStatus:this.post$.contentStatus
};
}
let pb = new PageBuilder(this.shared,this,pbInput,this.state.type);
let template = pb.getTemplate();
this.mainForm.appendChild(template);
}//

createCategory(){
let c = new Category(this.shared,'');
c.categoryNames =  ['None',...this.displayCategoryNames];
let template = c.getFormTemplate();
this.utils.setModal('New Category',template,'');
}//

/**
 * 
 * @param {string} contentStatus 
 */
filterPostsByContentStatus(contentStatus){
contentStatus = contentStatus.toLowerCase();
if(contentStatus=="all"){
this.displayProducts$ = this.products$;
}
else{
let displayProducts = [];
for(let p of this.products$){
if(p.status==contentStatus){
displayProducts.push(p);
}
}
this.displayProducts$ = displayProducts;
}
console.log(this.displayProducts$);
this.reRender = true;
for(let p of this.displayProducts$){
let href = `/${this.username}/product/${p.name}/${p.id}`;
let editHref = `/app/${this.username}/product/edit/${p.id}`;
let deleteHref = `/app/${this.username}/product/delete/${p.id}`;
//tb,href,editHref,deleteHref,title1,title2,title3
this.pbu.setTableRows(this.tb,href,editHref,deleteHref,p.name);
}//for
}//func
/**
 * 
 * @param {string} name 
 */
filterPostsByCategory(name){
this.tb.innerHTML = '';
if(name=="All"){
this.displayProducts$ = this.products$;
}else{
let displayProducts = [];
for(let p of this.products$){
let cats = p.categories;
for(let c of cats){
if(c.name==name){
displayProducts.push(p);
}
}
}
this.displayProducts$ = displayProducts; 
}

for(let p of this.displayProducts$){
let href = `/${this.username}/product/${p.name}/${p.id}`;
let editHref = `/app/${this.username}/product/edit/${p.id}`;
let deleteHref = `/app/${this.username}/product/delete/${p.id}`;
//tb,href,editHref,deleteHref,title1,title2,title3
this.pbu.setTableRows(this.tb,href,editHref,deleteHref,p.name);
}//for

}//func
/**
 * 
 * @param {number|undefined} id 
 */
async deleteProducts(id){
let request;
if(id){
request = {
        url: `https://codecapt.com/wp-json/wc/v3/products/${id}`,
        method:'DELETE',
        postType: 'product',
        isAdmin: true
    };
this.productIdsToDelete = [id];
}else if(this.productIdsToDelete.length>0){
request = {
        url: 'https://codecapt.com/wp-json/wc/v3/products/batch',
        method:'POST',
        body:{"delete":[...this.productIdsToDelete]},
        postType: 'product',
        isAdmin: true
    };
    console.log('REQUEST');
}	console.log(request);

let r = await this.utils.fetch2(request);
console.log('r');
console.log(r);
if(r){
let updatedProducts =[];
for(let p of this.products$){
if (this.productIdsToDelete.includes(p.id)){
continue;
}else{
updatedProducts.push(p);
}
}
this.products$ = updatedProducts;
this.displayProducts$ = this.products$
this.productIdsToDelete = [];
this.getListTemplate();
this.utils.notify("Deleted",0,'s');
}else{
this.utils.notify("Error Deleting Product",2,'s');
}

}//func
/**
 * 
 * @param {HTMLInputElement} el 
 * @returns 
 */
setProductsToDelete(el){
/**@type {string|null}*/let path = el.getAttribute('data-path');
let paths = path.split('/');
let id = Number(paths[4]);
if(el.checked){
if(this.productIdsToDelete.includes(id)){return;}
else{this.productIdsToDelete.push(id);}
}
else{
if(this.productIdsToDelete.includes(id)){
//remove
let index = this.productIdsToDelete.indexOf(id);
if(index >-1){
this.productIdsToDelete.splice(index, 1);
}
}
}
if(this.productIdsToDelete.length>0){
this.pbu.show(this.massDeleteButton);
}else{
this.pbu.hide(this.massDeleteButton);
}
console.log(this.productIdsToDelete);
}//func
//############# category ######################	
setDisplayCategories(){
this.productCategoryNames = [];
this.displayCategoryNames = [];
for(let c of this.productCategories){
this.productCategoryNames.push(c.name);
this.displayCategoryNames.push(c.name);
}

for(let cat of this.categories$){
let name = cat.name;
if(!(this.displayCategoryNames.includes(name))){
this.displayCategoryNames.push(name);
}
}
console.log(this.displayCategoryNames);
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
displayTags(){
this.postTagsListDiv.innerHTML = ''	;
for(let t of this.productTags){
let span = this.pbu.createElement('span','mx-2');
span.textContent = t;
let i = this.pbu.createElement('i','bi','bi-file-x','post-tags-remove');
i.style.cursor = "pointer";
span.appendChild(i);
this.postTagsListDiv.appendChild(span);
}//for
//events
let tagsAddButton = this.postComponent.querySelector('#postTagsAddButton');
tagsAddButton.addEventListener('click',()=>this.addNewTag());
let removeTags = this.postComponent.querySelectorAll('.post-tags-remove');
for(let r of removeTags){
r.addEventListener('click',(r)=>this.removeTag(r));
}
}//
addNewTag(){
let newTags = this.tagsControl.value;
if(!newTags){
return;
}
let tags = newTags.trim().split(",");
for(let tag of tags){
let t = this.utils.capitalize(tag);
if(!this.productTags.includes(t)){
this.productTags.push(t);
}
if(!this.allTags.includes(t)){
this.allTags.push(t);
}
}
this.tagsControl.value = '';//reset form
this.displayTags();
console.log(this.allTags);
}// #addNewTag()
/**
 * 
 * @param {HTMLElement} el 
 */
removeTag(el){
let tag = el.parentElement.textContent;
let index =undefined;
index = this.productTags.indexOf(tag);
if(index >-1){
//remove only from postTags, it can remain in allTags
this.productTags.splice(index, 1);
}
this.displayTags();
}// removeTag()
//###########
getNewProduct(){
let newProduct = {
name:"",
description:"",
short_description:"",
status:"publish",
type:"simple",
virtual:false,
downloadable:false,
featured:false,
sku:"",
global_unique_id:"",
regular_price:"",
sale_price:"",
tax_status:"taxable",
tax_class:"",
shipping_class:"",
manage_stock:false,
stock_quantity:10,
stock_status:"instock",
backorders:"no",
sold_individually:false,
weight:"",
dimensions:{},
reviews_allowed:false,
purchase_note:"",
categories:[],
tags:[],
images:[],
variations:[],
meta_data:[],
}
return newProduct;
}//newPost()
/**
 * 
 * @param {string} status 
 */
async submitProduct(status){
//process categories
let categories = [];
let inputs = this.postCategoriesListDiv.querySelectorAll('input[type="checkbox"]:checked');
for(let input of inputs){
let categoryName = input.value;
for(let c of this.categories$){
if(c.name==categoryName){
categories.push({id:Number(c.id)});
}
}
}//for

//validate
let name = this.productNameControl.value;
let description = this.productDescriptionDiv.querySelector('.sp-rich-text').innerHTML;
let regular_price = this.regularPriceControl.value;
let sale_price = this.salesPriceControl.value;
let product = {
name:name,
description:description,
short_description:this.product$.short_description,
status:status.toLowerCase(),
type:"simple",
virtual:false,
downloadable:false,
featured:this.featuredControl.checked,
sku:"",
global_unique_id:"",
regular_price:regular_price,
sale_price:sale_price,
manage_stock:false,
stock_quantity:10,
stock_status:"instock",
sold_individually:false,
reviews_allowed:this.reviewsAllowedControl.checked,
purchase_note:"",
categories:categories,
tags:[],
images:[],
variations:[],
meta_data:[],
}
//now save post
console.log('before submit');
console.log(product);
let request = {
        url: `https://codecapt.com/wp-json/wc/v3/products`,
        postType: 'product',
        method:'POST',
        body:JSON.stringify(product)
    };
let r = await this.utils.fetch2(request);
if(r){
console.log(r);
this.product$.id = r.id;
this.utils.notify("Saved",0,'s');
}
else{
this.utils.notify("Error Saving Product",2,'s');
}
}//submitPost
}//class