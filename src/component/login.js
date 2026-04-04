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
this.cache = null;
//this.loginViewInitialized = false;
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
    <h1 class="h3 mb-3 fw-normal login">Please sign in</h1>
      <section class='login'>
     ${this.main.pbu.createFormControl({serialize:true,id:'email',title:"Email",name:'Email'})}
    ${this.main.pbu.createFormControl({serialize:true,id:'password',title:"Password",name:'Password',type:'password'})}
    <button class="btn btn-primary w-100 py-2 login" type="button">Sign in</button>
   </section>

    <section class="auth-token d-none">
    div class="sp-form-control mb-2">
    <input type="text" class="form-control auth-token">
    </div>
    <button class="btn btn-primary w-100 py-2 auth-token" type="button">Verify</button>
    </section>
  </form>
`;
this.main.pbu.mount(this.loginComponent);
//
this.formTitle = this.loginComponent.querySelector('h1.login');
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
  //validate
if(! this.main.vu.validate(this.emailControl,this.passwordControl)){
    return;
}
let email = this.emailControl.value;
let password = this.passwordControl.value;
let user = {
email:email,
password:password,
};
this.user = user;
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(undefined,false)+ 'login';
state.body = JSON.stringify(this.user);
let r = await this.main.fu.fetch(state);
if(r){
this.cache=r;
if(this.state.nextState && this.cache.stateObject){
  this.state.nextState.stateObject= this.cache.stateObject.body;
}
console.log("this.cache");
console.log(this.cache);
this.username = this.cache.tenant.username;
this.sendAuthToken();
}
}//func

sendAuthToken(){
let authToken= "1234";
//send()
this.loginSection.remove();
this.main.pbu.show(this.authTokenSection);
this.formTitle.textContent="Please enter the token sent to you";
return true;
}//func
verifyAuthToken(){
  if(this.authTokenControl.value == ''){
    //normalize tenantId
    this.cache.tenant.tenantId = this.cache.tenant.id;
    this.main.cache = this.cache;
    this.main.setTheme(this.cache.option.activeTheme);
    //settheme
    console.log('this.cache');
    console.log(this.cache);
    //display link of dashboard
    if(this.state.nextState){
      if(('errorMessage' in this.state.nextState.stateObject && !this.main.utils.isNull(this.state.nextState.stateObject.errorMessage))){
            this.main.utils.notify(this.state.nextState.stateObject.message,1,'m');
      }else{
        this.main.navigate(this.state.nextState);
      }
    }else{
            let dashboardState = {
                component:'dashboard',
                username:this.username,
                url:`/app/${this.username}/dashboard/page/detail/0`,
                isAdmin:true,
                }
                this.main.navigate(dashboardState);
                  }
  }
  else{
    //wrong token
    this.formTitle.textContent = 'Wrong, please try again';
  }
}//func

}//#class
