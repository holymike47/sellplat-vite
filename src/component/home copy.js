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
this.main.pb.getCoverComponent({
type:'detail',
    v:{
    variant : 1,
    headingText:'SellPlat',
    bodyText :'Welcome',
    imageSrc:'',
    b1Text:'Login',
    b1Href:'',
    b2Text:'Register',
    b2Href:'',
    }
});
this.homeSection=this.main.pbu.createElement('main',['home']);
this.main.pbu.mount(this.homeSection);
this.homeSection.innerHTML = 
`
<div class="d-flex align-items-center justify-content-center">
<h3>Welcome Home</h3>
<a class="login-link" href="login">Login</a>
<a class="register-link" href="register">Register</a>
</div>
`;

this.loginLink = this.homeSection.querySelector('a.login-link');
this.registerLink = this.homeSection.querySelector('a.register-link');
addEvents();
//finally
function addEvents(){
$this.pbu.listen($this.loginLink,'click',(e)=>{
    e.preventDefault();
    $this.main.navigate({component:'login',url:'/app/login',isAdmin:false});
});

$this.pbu.listen($this.registerLink,'click',(e)=>{
    e.preventDefault();
    $this.main.navigate({component:'register',url:'/app/register',isAdmin:false});
});
}//inner
}//func
}//class