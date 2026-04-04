// @ts-check
import { Post } from "./post";
export class Register{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
//
this.title = "register";
this.tenant={};
this.cache = undefined;
this.getTemplate();
}//

getTemplate(){
let $this = this;
this.registerComponent = this.main.pbu.createElement('main',['form-signin','w-100','m-auto']);
this.registerComponent.innerHTML = 
`
  <form>
  
    <img class="mb-4" src="/cc_logo_trans.png" alt="" width="72" height="57">
    <h1 class="h3 mb-3 fw-normal login">Register</h1>
      <section class='login'>
     ${this.main.pbu.createFormControl({serialize:true,id:'email',title:"Email",name:'Email'})}
    ${this.main.pbu.createFormControl({serialize:true,id:'password',title:"Password",name:'Password',type:'password'})}
    <button class="btn btn-primary w-100 py-2 login" type="button">Submit</button>
   </section>

    <section class="auth-token d-none">
    <div class="sp-form-control mb-2">
    <input type="text" class="form-control auth-token">
    </div>
    <button class="btn btn-primary w-100 py-2 auth-token" type="button">Verify</button>
    </section>

    <section class="dashboard d-none">
    <button class="btn btn-primary w-100 py-2 dashboard" type="button">Dashboard</button>
    </section>
  </form>
`;
this.main.pbu.mount(this.registerComponent);
//
this.formTitle = this.registerComponent.querySelector('h1.login');
this.loginSection = this.registerComponent.querySelector('section.login');
this.emailControl = this.registerComponent.querySelector('input#email');
this.passwordControl = this.registerComponent.querySelector('input#password');
this.loginButton = this.registerComponent.querySelector('button.login');
//
this.authTokenSection = this.registerComponent.querySelector('section.auth-token');
this.authTokenControl = this.registerComponent.querySelector('input.auth-token');
this.authTokenButton = this.registerComponent.querySelector('button.auth-token');
//
this.dashboardSection = this.registerComponent.querySelector('section.dashboard');
this.dashboardButton = this.registerComponent.querySelector('button.dashboard');

addEvents();
function addEvents(){}
$this.main.pbu.listen($this.loginButton,'click',()=>{
$this.exists();
});

$this.main.pbu.listen($this.authTokenButton,'click',()=>{
$this.verifyAuthToken();
});

$this.main.pbu.listen(this.dashboardButton,'click',()=>{
   let dashboardState = {
  component:'dashboard',
  username:$this.username,
  url:`/app/${$this.username}/dashboard/page/detail/0`,
  isAdmin:true
  }
  $this.main.navigate(dashboardState);
});
}//func
/**
 * 
 * @returns check if tenant exist, if not, send auth token to verify email
 */
async exists(){
if(! this.main.vu.validate(this.emailControl,this.passwordControl)){
    return;
}
let tenant = {
email: this.emailControl.value,
password:this.passwordControl.value
};
this.tenant = tenant;
console.log(this.tenant);
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(undefined,false)+ 'exists';
state.body = tenant.email;
//dont springify a single value like email else extra double quote will be added
let r = await this.main.fu.fetch(state);
if(r){
this.authToken= r.message;
this.loginSection.remove();
this.main.pbu.show(this.authTokenSection);
this.formTitle.textContent="Please enter the token sent to you";
}
// if(r.message=='Ok'){
// await this.sendAuthToken();
// }
}//

// async sendAuthToken(){
// let state = this.main.utils.clone(this.state);
// state.link = this.main.fu.getApi(undefined,false)+ 'token';
// state.body = this.tenant.email;
// let r = await this.main.fu.fetch(state);
// if(r){
// this.authToken= r;
// this.loginSection.remove();
// this.main.pbu.show(this.authTokenSection);
// this.formTitle.textContent="Please enter the token sent to you";
// }
// }//

verifyAuthToken(){
if(this.authTokenControl.value == this.authToken){
this.authTokenSection.remove();
this.formTitle.textContent = 'Verified';
//now register client
this.register()
}
else{
//wrong token
this.formTitle.textContent = 'Wrong, please try again';
}
}//func

async register(){
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(undefined,false)+ 'register';
state.body = JSON.stringify(this.tenant);
let r = await this.main.fu.fetch(state);
if(r){
console.log(r);
this.cache = r;
this.username = this.cache.tenant.username;
//normalize tenantId
this.cache.tenant.tenantId = this.cache.tenant.id;
this.main.cache = this.cache;
this.formTitle.textContent = 'Thank you, please visit your dashboard';
this.authTokenSection.remove();
//display link of dashboard; dashboard link is inside a div which is initially hidden
this.main.pbu.show(this.dashboardSection);
}

}//func

}//#class
