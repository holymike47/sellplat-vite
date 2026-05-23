// @ts-check
export class Register{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
this.getTemplate();
}//

getTemplate(){
let $this = this;
this.registerComponent = this.main.pbu.createElement('main',['form-signin','w-100','m-auto']);
this.registerComponent.innerHTML = 
`
<img class="mb-4" src="/images/logo/sp_logo.png" alt="" width="72" height="57">
    <h3 class="h3 mb-3 fw-normal sp-title">Register</h3>
  <form class="auth">
    <section'>
    ${this.main.pbu.createFormControl({serialize:true,title:"First Name",clasz:['first-name','sp-validation-required']})}
    ${this.main.pbu.createFormControl({serialize:true,title:"Last Name",clasz:['last-name','sp-validation-required']})}
     ${this.main.pbu.createFormControl({serialize:true,title:"Email",type:'email',clasz:['email','sp-validation-required']})}
    ${this.main.pbu.createFormControl({serialize:true,title:"Password",type:'password',withSubmit:true,clasz:['password','sp-validation-required']})}
    <p class="text-center small"><a href="/app/login">Already have an account? Log in</a></p>
   </section>
  </form>
`;
this.main.pbu.mount(this.registerComponent);
//
this.authForm = this.registerComponent.querySelector('form.auth');
this.formTitle = this.registerComponent.querySelector('h3.sp-title');
this.firstNameControl = this.registerComponent.querySelector('input.first-name');
this.lastNameControl = this.registerComponent.querySelector('input.last-name');
this.emailControl = this.registerComponent.querySelector('input.email');
this.passwordControl = this.registerComponent.querySelector('input.password');
this.loginButton = this.registerComponent.querySelector('button.sp-button');
//
addEvents();
function addEvents(){}
$this.main.pbu.listen($this.loginButton,'click',()=>{
$this.register();
});
}//func
/**
 * 
 * @returns check if tenant exist, if not, send auth token to verify email
 */
async register(){
if(! this.main.vu.validate(this.authForm.querySelectorAll('input.sp-validation'))){
    return;
}
let firstName = this.firstNameControl.value;
let lastName = this.lastNameControl.value;
let email = this.emailControl.value;
let password = this.passwordControl.value;
let tenant = {
firstName:firstName,
lastName:lastName,
email: email,
password:password,
clientUUID:this.main.utils.getUUID()
};

let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi('sp',false,'exists',[{n:'type',v:'token'}]);
state.body = JSON.stringify({email:email});
//dont springify a single value like email else extra double quote will be added
let r = await this.main.fu.fetch(state);
if(r){
  let authToken = r;
  this.formTitle.textContent="Please enter the token sent to you";
  let authTokenTemplate = this.main.tu.authToken();
this.main.pbu.replace(this.authForm,authTokenTemplate.section);
//event
this.main.pbu.listen(authTokenTemplate.button,'click',async()=>{
  if(! this.main.vu.validate(authTokenTemplate.input)){return;}
    if(authTokenTemplate.input.value!=authToken){
      this.main.utils.notify('Wrong, please try again',2,'m');
    }else{
      //now register client
state.link = this.main.fu.getApi(undefined,false,'register');
state.body = JSON.stringify(tenant);
let r = await this.main.fu.fetch(state);
if(r){
this.main.log(r,0,'Register.register(): Registeration success - tenant info');
this.main.utils.setCache('user',r.user);
this.main.utils.setCache('option',r.option);
let username = r.user.username;
this.formTitle.textContent = 'Thank you, please visit your dashboard';
//display link of dashboard; 
this.authForm.innerHTML = `<a href="/app/${username}/dashboard/page/detail/0" class="btn btn-primary w-100 py-2" >Dashboard</button>`;
}
    }
});

}
}//func

}//#class
