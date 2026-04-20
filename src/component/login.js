import { th } from "intl-tel-input/i18n";

// @ts-check
export class Login{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
//
this.title = "login";
this.user={};
/**@type {string}*/this.username='';
//this.cache = null;
this.getTemplate();
}//

getTemplate(){
  //always: the dynamic nature doesnt allow reuse
let $this = this;
this.loginComponent = this.main.pbu.createElement('main',['form-signin','w-100','m-auto']);
this.loginComponent.innerHTML = 
`
  <form>
  
    <img class="mb-4" src="/cc_logo_trans.png" alt="" width="72" height="57">
    <h3 class="h3 mb-3 fw-normal login">Please sign in</h3>
      <section class='login'>
     ${this.main.pbu.createFormControl({serialize:true,id:'email',title:"Email",name:'Email'})}
    ${this.main.pbu.createFormControl({serialize:true,id:'password',title:"Password",name:'Password',type:'password'})}
    <button class="btn btn-primary w-100 py-2 login" type="button">Sign in</button>
   </section>

    <section class="auth-token d-none">
    <div class="sp-form-control mb-2">
    <input type="text" class="form-control auth-token">
    </div>
    <button class="btn btn-primary w-100 py-2 auth-token" type="button">Verify</button>
    </section>
  </form>
`;
this.main.pbu.mount(this.loginComponent);
//
this.formTitle = this.loginComponent.querySelector('h3.login');
this.loginSection = this.loginComponent.querySelector('section.login');
this.emailControl = this.loginComponent.querySelector('input#email');
this.passwordControl = this.loginComponent.querySelector('input#password');
this.loginButton = this.loginComponent.querySelector('button.login');
//
this.authTokenSection = this.loginComponent.querySelector('section.auth-token');
this.authTokenControl = this.loginComponent.querySelector('input.auth-token');
this.authTokenButton = this.loginComponent.querySelector('button.auth-token');
//
addEvents();
//finally
function addEvents(){
$this.main.pbu.listen($this.loginButton,'click',()=>{
$this.submit();
});
//
$this.main.pbu.listen($this.authTokenButton,'click',()=>{
  $this.verifyAuthToken();
});
}//inner
}//func


async submit(){
if(! this.main.vu.validate(this.emailControl,this.passwordControl)){
    return;
}
let email = this.emailControl.value;
let password = this.passwordControl.value;

let user = {
email:email,
password:password,
clientUUID:this.main.utils.getUUID()
};
this.user = user;
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(undefined,false,'login');
state.body = JSON.stringify(this.user);
let r = await this.main.fu.fetch(state);
if(r){
  console.log("response");
  console.log(r);
   this.authToken = r.token;
if(this.state.nextState){
  this.state.nextState.stateObject= r.stateObject;
}else{
console.log("main before");
console.log(this.main);
this.main.cache = r;
console.log("main after");
console.log(this.main);
this.username = this.main.cache.tenant.username;
}
this.loginSection.remove();
this.main.pbu.show(this.authTokenSection);
this.formTitle.textContent="Please enter the token sent to you";
}
}//func


verifyAuthToken(){
  if(this.authTokenControl.value == this.authToken){
    //display link of dashboard
    if(this.state.nextState){
     this.main.navigate(this.state.nextState);
    }else{
      //normalize tenantId
    this.main.cache.tenant.tenantId = this.main.cache.tenant.id;
    this.main.setTheme(this.main.cache.option.activeTheme);
            let dashboardState = {
                component:'dashboard',
                username:this.username,
                url:`/app/${this.username}/dashboard/page/detail/0`,
                isAdmin:true,
                };
                this.main.navigate(dashboardState);
                  }
  }
  else{
    //wrong token
    this.formTitle.textContent = 'Wrong, please try again';
  }
}//func

}//#class
