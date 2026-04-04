// @ts-check
export class RecentPostWidget{
/**
 * 
 * @param {any} shared 
 *  @param {any} parent
 */
constructor(shared,parent){
this.shared = shared;//used when using this component to create another
this.config = shared.config;
this.utils = shared.utils;
this.pbu = shared.pbu;
this.main = shared.main;
this.parent = parent;
//
this.isView = false;
//
/**@type {any}*/this.postRecord = {};
/**@type {any[]|null}*/this.posts$ = null;
/**@type {any[]}*/this.displayPosts = [];
/**@type {any}*/this.post$ = {};
//list
/**@type {any}*/this.category$ = {};
//used components
this.pb = this.parent.pb;
this.title = "Recent Posts";
//this.process();
}//

async process(){
let params = new URLSearchParams();
params.append('postType', 'post');
let url = this.utils.getApi()+`/posts?${params.toString()}`;
let request = {
url: url,
isAdmin: false,
isWordPress:false
};
let r = await this.utils.fetch2(request);
if(r){
console.log('response');
console.log(r);
this.postRecord = r;
this.posts$ = this.postRecord.posts;
}else{
this.utils.notify("Error",2,'s');
}
}//func

/**
 * 
 * @param {any} data 
 */
async getTemplate(data = {withCm:true,limit:3,category:'all',withExcerpt:true,withImage:true}){
//get posts initially
let posts;
if(!this.posts$){
    await this.process();
}
posts = this.posts$.slice(0, data.limit);
let r =this.pb.getBlockContainer(data.withCm,'main',[],'recentPosts');
let bc = r.bc;
let el=r.el;
//
let parent = r.parent;
let container = this.pb.createColumn(1,false);
container.removeAttribute('d');
el.appendChild(container);
let row = container.firstElementChild;
row.removeAttribute('n');
row.innerHTML = '';
for(let post of posts){
let href = `/${this.parent.username}/post/${post.title}/${post.id}`;
let card,image,cardBody,title,excerpt,button;
card = this.pbu.createElement('div',['card','col-md-4']);
row.appendChild(card);
//
if(data.withImage){
let a = this.pbu.createElement('a');
card.appendChild(a);
a.href = href;
//
image  = this.pbu.createElement('img',['card-img-top']);
a.appendChild(image);
image.src = post.featuredImageUrl;
//
// this.pbu.listen(image,'click',()=>{
// button?.click();
// });
}
//
cardBody = this.pbu.createElement('div',['card-body']);
card.appendChild(cardBody);
//
title = this.pbu.createElement('h5',['card-title'],post.title);
cardBody.appendChild(title);
if(data.withExcerpt){
excerpt = this.pbu.createElement('p',['card-text'],post.excerpt);
cardBody.appendChild(excerpt);
}
button = this.pbu.createElement('a',['btn'],'Learn More');
button.href = href;
cardBody.appendChild(button);
///


// cardBody.innerHTML = `
//     <h5 class="card-title">${post.title}</h5>
//     <p class="card-text">${post.excerpt}</p>
//     <a href="#" class="btn">Learn More</a>
// `;
}//for
if(!this.isView){
el.setAttribute('l',data.limit);
el.setAttribute('cat',data.category);
el.setAttribute('we',data.withExcerpt);
el.setAttribute('wi',data.withImage);
this.attachEvents();
}
return bc;
}//func

attachEvents(){
//firstly
}
}//class