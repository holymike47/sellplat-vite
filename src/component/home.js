// @ts-check
export class Home{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.config = main.config;
this.utils = main.utils;
this.pbu = main.pbu;
this.fu = main.fu;
this.state = state;
//
this.title = "Home";
this.getTemplate();
document.title = "Home";
}//

getTemplate(){
let $this = this;
let cover = this.main.pb.getCoverComponent({
type:'detail',
dClass:[],
    v:{
    variant : 1,
    headingText:'SellPlat',
    bodyText :'Welcome',
    imageSrc:'/cc_logo_trans.png',
    b1Text:'Login',
    b1Href:'',
    b2Text:'Register',
    b2Href:'',
    },
});

this.homeComponent=this.main.pbu.createElement('main',['home','mx-auto']);
this.homeComponent.appendChild(cover.querySelector('[m]'));
this.main.pbu.mount(this.homeComponent);

addEvents();
//finally
function addEvents(){
let buttons = $this.homeComponent.querySelectorAll('.sp-button');
for(let b of buttons){
    $this.pbu.listen(b,'click',()=>{
    let component = b.textContent.toLowerCase();
    $this.main.navigate({component:component,url:`/app/${component}`,isAdmin:false});
});
}
}//inner
}//func
}//class