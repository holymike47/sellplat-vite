// @ts-check
export class Widget {
/**
 * 
 * @param {any} main 
 * @param {any} parent
 */
constructor(main,parent){
this.main = main;
this.parent = parent;
this.isView = false;
}//

async getRecentPostsWidget(data={type:'new',v:{l:1,cat:-1,we:true,wi:true,wm:true},dClass:[]}){
let $this = this;
let state = this.main.utils.clone(this.main.state);
let displayPosts;
if(this.isView){
state.link = this.main.fu.getApi(state.username,false,`/home/posts/${state.postType}/${data.v.cat}`,[{n:'limit',v:data.v.l}]);
displayPosts = await this.main.fu.fetch(state);
}else{
if(data.v.cat == -1){//ie all selected
displayPosts = this.parent.posts$.filter(p=>p.postType=='post') || [];
}else{
displayPosts = this.parent.posts$.filter(p=>p.postType=='post').filter(p=>data.v.cat==p.category?.id);
}
displayPosts = displayPosts.slice(0, data.v.l);
}


let r =this.parent.pb.getBlockContainer({name:'recentPosts',main:'div',clasz:['d-flex','justify-content-center','flex-wrap','container'],withAlign:true,cmCallback:attachEvents});
r.el.removeAttribute('contenteditable');
r.el.setAttribute('l',data.v.l);
r.el.setAttribute('cat',data.v.cat);
r.el.setAttribute('we',data.v.we);
r.el.setAttribute('wi',data.v.wi);
r.el.setAttribute('wm',data.v.wm);

//let row = r.el.querySelector('.sp-row');
//card colum class
//'1','3','4','6','8','9','12'
// let col = r.el.closest('[c]');
// let colClass;
// if(data.v.l==1 || data.v.l==3 || data.v.l==6 || data.v.l==9){
//   colClass = 'col-md-4';
// }else{
//   colClass = 'col-md-3';
// }

if(displayPosts.length>0){
for(let p of displayPosts){
let url = (this.main.isSiteDomain && !this.main.isSite)?`/${state.username}/${p.title}/${p.id}`:`/${p.title}/${p.id}`;
let card = 
`
<div class="card sp-card mb-2">
  <img src="${(p.featuredImageUrl)?this.main.mh.getImageUrl(p.featuredImageUrl,'grid'):''}" class="card-img-top sp-image ${this.main.pbu.showIf(data.v.wi)}">
  <div class="card-body">
    <h5 class="card-title sp-h">${p.title}</h5>
    <p class="card-text sp-excerpt ${this.main.pbu.showIf(data.v.we)}">${p.excerpt}</p>
    <a href="${url}" class="btn btn-primary sp-detail">Learn More</a>
  </div>
  <div class="card-footer sp-card-footer d-none">
  
  </div>
</div>
`;
this.main.pbu.appendChild(r.el,card);
}//for
}else{
this.main.pbu.replace(r.el,'<p>No post found</p>');
}



if(this.isView){

}else{
attachEvents(null);
}

return r.bc;

/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==null){

}

if(save==false){
let rpwTemplate = await $this.getTemplate('recentPosts',data.v);
return rpwTemplate.div;
}

if(save==true){
//let otherSettings = $this.main.pbu.query('#promptModal section.other-settings');
let otherSettings = r.cMenu.otherSettings;
let cat = otherSettings.querySelector('select.cat').value;
data.v = {
    l:Number(otherSettings.querySelector('select.l').value),
    cat:$this.main.utils.isNull(cat)?-1:cat,
    we:otherSettings.querySelector('input.we').checked,
    wi:otherSettings.querySelector('input.wi').checked,
    wm:otherSettings.querySelector('input.wm').checked
  }
  
  let bc = await $this.getRecentPostsWidget(data);
  $this.main.pbu.replace(r.el,bc.querySelector('[m]').innerHTML);
  //update attribute to enable saving
  r.el.setAttribute('l',data.v.l);
  r.el.setAttribute('cat',data.v.cat);
  r.el.setAttribute('we',data.v.we);
  r.el.setAttribute('wi',data.v.wi);
  r.el.setAttribute('wm',data.v.wm);
  //
  return true;
}
}//inner

}//func

/**
 * @param {string} name 
 * @param {any} data 
 */
async getTemplate(name,data){
  switch(name){
    case 'recentPosts':
    let div = this.main.pbu.createElement('div',['m-2','p-2']);
  div.innerHTML = 
  `
<form>
  ${this.main.pbu.createSelectElement({serialize:true,title:'Limit',value:data.l,items:['1','3','4','6','8','9','12'],clasz:['l','recent-posts-limit']})}
  ${this.main.pbu.createSelectElement({serialize:true,title:'Category',value:data.cat,default:'All',postItems:[...this.parent.categories$],clasz:['cat','recent-posts-category']})}
  ${this.main.pbu.createFormControl({serialize:true,title:"Show Image",value:data.wi,type:'checkbox',clasz:['wi','recent-posts-with-image']})}
   ${this.main.pbu.createFormControl({serialize:true,title:"Show Excerpt",value:data.we,type:'checkbox',clasz:['we','recent-posts-with-excerpt']})}
   ${this.main.pbu.createFormControl({serialize:true,title:"Show Meta",value:data.wm,type:'checkbox',clasz:['wm','recent-posts-with-meta']})}
  <button type="button" class="sp-save d-none">Save</button>
</form>
  `;
  let l = div.querySelector('select.l');
  let cat = div.querySelector('div.category select');
  let wi = div.querySelector('input.wi');
  let we = div.querySelector('input.we');
  let wm = div.querySelector('input.wm');
  let saveButton = div.querySelector('button.sp-save');
  let template ={
    div:div,
    cat:cat,
    l:l,
    wi:wi,
    we:we,
    wm:wm,
    saveButton:saveButton
  };
  return template;
  }

}//func
}