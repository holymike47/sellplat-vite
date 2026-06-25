// @ts-check
import { PageBuilder } from "./page-builder";
import { Widget } from "./widget";
export class Home{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
document.title = "Home";
this.pb = new PageBuilder(main,this);//pageBuilder
this.widget = new Widget(main,this);
this.headerTemplate = null;
this.footerTemplate = null;
}//

async getTemplate() {
let $this=this;
let p = this.post$;
this.homeComponent = this.main.pbu.createElement('main',['home-component']);
this.main.pbu.appendChild(this.homeComponent,
`
<!--viewContainer-->
<div id = "viewContainer" class="container" style="min-height: 100vh;">
<main id="mainContent" class="sp-container">
     <!--Row-->
<div class="row sp-row">
  <div class="content ${this.main.pbu.addClassIf(p.sidebarType=='NONE',['col-12'],['col-md-9','order-2'])}">
<!--Post title and feature image-->
<div class="cover ${this.main.pbu.showIf(p.slug!='home')} ${this.main.pbu.addClassIf(!p.featuredImageUrl,['p-4', 'p-md-5','mb-4','rounded','text-body-emphasis', 'bg-body-secondary'])}">
  <div class="featured-image text-center ${this.main.pbu.showIf(p.featuredImageUrl)}">
      <img src=${this.main.mh.getImageUrl(p.featuredImageUrl,'public')} alt="" class="featured-image img-fluid mx-auto"/>
    </div>
  <div class="px-0">
    <h1 class="display-4 fst-italic title text-center">${p.title}</h1>
  </div>
  
</div><!--#Post title and feature image-->

<div class="post-meta ${this.main.pbu.showIf(p.category)}">
<a href="${this.main.getHomeLink('post','c',p.category?.title,p.category?.id)}" class="btn btn-sm mx-1">${p.category?.title}</a>
</div>

<div class="excerpt">
<p class="small">${p.excerpt}</p>
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
</div>
<!--#viewContainer-->
`  
);

this.mainContentDiv = this.homeComponent.querySelector('div.main-content');
this.sidebarDiv = $this.homeComponent.querySelector('div.sidebar');
this.subscribeDiv = $this.homeComponent.querySelector('div.subscribe');

if(!this.state.isArchive){
await updateView();
}
return this.homeComponent;

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


async getClientHome(){
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(state.url);
let r = await this.main.fu.fetch(state);
if(r){
this.postViewDto = r;
this.main.log(this.postViewDto,0,'Post.getClientHome(): this.postViewDto');
this.main.setTheme(this.postViewDto.option);
this.main.pbu.mount(await this.getMenuTemplate('main'),'h');
this.main.pbu.mount(await this.getMenuTemplate('footer'),'f');
// this.headerTemplate = await this.getMenuTemplate('main');
// this.footerTemplate = await this.getMenuTemplate('footer');

(state.isArchive)?await this.getArchive(): await this.getPost();
}
}//func

async getPost(){
if(this.state.isInit){
this.post$ = this.postViewDto.posts[0];
//set id of home state
this.state.id = this.post$.id;
}else{
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(state.url);
//state.link = this.main.fu.getApi(state.url,[{n:'limit',v:1}]);
let r = await this.main.fu.fetch(state);
if(r){
this.postViewDto = r;
this.post$ = this.postViewDto.posts[0];
this.main.log(this.post$,0,'Post.getPost(): single post');
}
}
let postDetail = await this.getTemplate();
this.main.pbu.mount(postDetail);
this.addViewEvents();
return postDetail;
}


async getArchive(){
//this is a category archive
let category;
if(this.state.isInit){
category = this.postViewDto.categories[0];
this.posts$ = this.postViewDto.posts;
}else{
    let state = this.main.utils.clone(this.state);
    state.link = this.main.fu.getApi(state.url);
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
excerpt:category.description,
featuredImageUrl:category.featuredImageUrl,
sidebarType:"NONE"
};
let postDetail = await this.getTemplate();
let mainContentDiv = postDetail.querySelector('div.main-content');
let recentPostsWidget = await this.widget.getRecentPostsWidget({v:{items:this.posts$,we:true,wi:true,wm:false}});
this.main.pbu.appendChild(mainContentDiv,recentPostsWidget.querySelector('[p]'));//recentPosts-parent
this.main.pbu.mount(postDetail);
this.addViewEvents();
}//func
/**
 * 
 * @param {string} message 
 * @param {any} responseJson 
 */
async get404Page(message='Not Found',responseJson=null){
let mainContent = this.postDetailSection?.querySelector('main#mainContent') || this.main.pbu.query('body');
mainContent.innerHTML = 
`
<h3>${message}</3>
<h5>We couldn’t find the page you were looking for.</h5>
<a href="/" class="btn btn-primary">HOMEPAGE</>
`;
this.main.log(responseJson,0,'Main.nav404(): responseJson');
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
    <a class="${this.main.pbu.showIf(this.postViewDto.option.logoUrl)} sp-route-link sp-detail sp-slug-link me-2" data-slug="home" href="/"><img width="60" height="60" src="${this.main.mh.getImageUrl(this.postViewDto.option.logoUrl,'public')}" /></a>
    <a class="nav-link sp-nav-link sp-site-title sp-route-link sp-detail sp-slug-link" data-slug="home" href="/">${this.postViewDto.option.siteName}</a>
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
    <div class="container-fluid">
      <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
      </ul>
      <p class="mb-0 float-end"><a class="login sp-route-link sp-admin" href="/app/login">Login</a></p>
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
      }else{
        url = this.main.getHomeLink(m.component,m.postType,m.archiveType,m.title,m.postId);
      }
        if(children.length==0){
        navItem = this.main.pbu.createElement('li',['nav-item']);
        menuUl.appendChild(navItem);
        navLink = `<a href="${url}" class="sp-nav-link nav-link ${this.main.pbu.addClassIf(isHome,['sp-slug-link'])} ${this.main.pbu.addClassIf(!isCustom,['sp-detail','sp-route-link'])}">${m.title}</a>`;
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
        isHome = c.title.toLowerCase()=='home';
        if(isCustom){
        url = c.link;
      }else{
        url = this.main.getHomeLink(c.component,c.postType,c.archiveType,c.title,c.postId);
      }
        navItem = this.main.pbu.createElement('li',['nav-item']);
        subMenuUl.appendChild(navItem);
        navLink = `<a href="${url}" class="sp-nav-link nav-link ${this.main.pbu.addClassIf(isHome,['sp-slug-link'])} ${this.main.pbu.addClassIf(!isCustom,['sp-detail','sp-route-link'])}">${c.title}</a>`;
        this.main.pbu.appendChild(navItem,navLink);
    }
    }
}//for
}
this.main.addRouteEvents(nav);
return nav;
}//func

addViewEvents(){
this.main.addRouteEvents(this.homeComponent);
// search
let searchForm = this.main.pbu.query('form.search-post');
let searchControl = searchForm.querySelector('input.search-post');
let searchButton = searchForm.querySelector('button.search-post');
this.main.pbu.listen(searchControl,'input',async ()=>{
this.search(searchControl);
});
//
this.main.pbu.listen(searchButton,'click',()=>{
    if(searchControl.value){
        this.search(searchControl);
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
    ${this.main.pbu.createFormControl({serialize:true,title:"Email",placeholder:"Email",type:"email",withSubmit:true,clasz:['email','sp-validation-required']})}
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
      let subscriber = {
        name:nameControl.value,/**important,to enable binding on backend */
        email: emailControl.value,
        list:'site'
        };
      
      state.link = this.main.fu.getApi('subscribe',[{n:'stage',v:'exist'}]);
      state.body = JSON.stringify(subscriber);
      state.isModal = true;
      let r = await this.main.fu.fetch(state);
        if(r=='subscribed'){
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
            state.link = this.main.fu.getApi('subscribe',[{n:'stage',v:'save'}]);
            state.body = JSON.stringify(subscriber);
            let r = await this.main.fu.fetch(state);
            if(r=='ok'){
                this.main.pbu.addClass(button,['disabled']);
               this.main.utils.genCookie(true,state.username);
                modal.title.textContent="";
               this.main.pbu.replace(form,'Thank you for subscribing');
            }

            }else{
                this.main.utils.notify('Wrong, please try again',2,'c',modal.notice);
            }
        });
        }
      
    });
    });
    
}
}//

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
        message += `<p>${title}:${value}</p>`;
    }
    this.main.log(message,0,'Post.processForms(): message to submit');
    let state = this.main.utils.clone(this.state);
    state.link = this.main.fu.getApi('submit-contact-form');
    state.body = message;
    let r = await this.main.fu.fetch(state);
    if(r =='sent'){
        this.main.pbu.appendChild(submitButton.parentElement,
    `<p class="border border-success mt-2 p-2">Thank you for your message. We will get back to you shortly</p>`);
    this.main.pbu.addClass(submitButton,['disabled']);
    }
}
})

    }//func
  
/**
 * 
 * @param {HTMLInputElement} input 
 */    
async search(input){
if(input.value.length<2){return;}  
if(!this.main.vu.sanitize([input])){return;}
let regex = new RegExp(`${input.value}`, "i");
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(`/home/posts/${state.postType}/-1`,[{n:'limit',v:-1}]);
let posts = await this.main.fu.fetch(state);
posts = posts.filter(p=>regex.test(p.title));
this.main.autoComplete(input,true,posts,'post');
let rect = input.getBoundingClientRect();
let form = input.closest('form.auto-complete');
let div = form.querySelector('.sp-div');
if(div){
div.style.left =  "0px";
div.style.top =  rect.bottom  + "px";
}
}    
}//class