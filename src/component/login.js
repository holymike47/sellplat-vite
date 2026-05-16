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
this.title = "login";
this.getTemplate();
}//

getTemplate(){
  //always: the dynamic nature doesnt allow reuse
let $this = this;
this.loginComponent = this.main.pbu.createElement('main',['form-signin','w-100','m-auto']);
this.loginComponent.innerHTML = 
`
   <img class="mb-4" src="/images/logo/sp_logo.png" alt="" width="72" height="57">
   <h3 class="h3 mb-3 fw-normal sp-title">Please sign in</h3>
  <form class="auth">
    <section>
    ${this.main.pbu.createFormControl({serialize:true,title:"Email",type:'email',clasz:['email','sp-validation-required']})}
    ${this.main.pbu.createFormControl({serialize:true,title:"Password",type:'password',withSubmit:true,clasz:['password','sp-validation-required']})}
    <p class="float-end"><a class="sp-forgot-password" type="button">Forgot password?</a></p>
    <p class="text-center small"><a href="/app/register">Don't have an account? Sign up</a></p>
   </section>
  </form>
`;
this.main.pbu.mount(this.loginComponent);
//
this.authForm = this.loginComponent.querySelector('form.auth');
this.formTitle = this.loginComponent.querySelector('h3.sp-title');
this.emailControl = this.loginComponent.querySelector('input.email');
this.passwordControl = this.loginComponent.querySelector('input.password');
this.forgotPasswordButton = this.loginComponent.querySelector('a.sp-forgot-password');
this.loginButton = this.loginComponent.querySelector('button.sp-button');

addEvents();
//finally
function addEvents(){
$this.main.pbu.listen($this.loginButton,'click',()=>{
$this.login();
});
//password reset
$this.main.pbu.listen($this.forgotPasswordButton,'click',(e)=>{
e.preventDefault();
$this.resetPassword();
});
}//inner
}//func


async login(){
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
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(this.state.username,false,`login`);
state.body = JSON.stringify(user);
let r = await this.main.fu.fetch(state);
if(r){
  console.log("response");
  console.log(r);
  let tempData = r;
this.formTitle.textContent="Please enter the token sent to you";
let authTokenTemplate = this.main.tu.authToken();
this.main.pbu.replace(this.authForm,authTokenTemplate.section);
//event
this.main.pbu.listen(authTokenTemplate.button,'click',()=>{
  if(!this.main.vu.validate(authTokenTemplate.input)){ return;}
  if(authTokenTemplate.input.value != tempData.token){
    this.main.utils.notify('Wrong, please try again',2,'m');
  }else{
    if(this.state.nextState){
      this.state.nextState.stateObject= tempData.stateObject;
     this.main.navigate(this.state.nextState);
    }else{
      let username = tempData.user.username;
    this.main.setTheme(tempData.option);
    this.main.utils.setCache('user',tempData.user);
    this.main.utils.setCache('option',tempData.option);  
            let dashboardState = {
                component:'dashboard',
                username:username,
                url:`/app/${username}/dashboard/page/detail/0`,
                isAdmin:true
                };
                this.main.navigate(dashboardState);
                  }
  }

});
}
}//func

resetPassword(){
let email,password;
this.formTitle.textContent="Forgot your password?";
this.authForm.innerHTML = 
`
<section>
<p>You will receive a token to reset your password</p>
    ${this.main.pbu.createFormControl({serialize:true,title:"Email",type:'email',withSubmit:true,clasz:['email','sp-validation-required']})}
</section>
`;
let emailControl = this.authForm.querySelector('.email');
let submitButton = this.authForm.querySelector('.sp-button');
//event
this.main.pbu.listen(submitButton,'click',async()=>{
if(! this.main.vu.validate(emailControl)){return;}
email = emailControl.value;
let state = this.main.utils.clone(this.state);
state.body = JSON.stringify({email:email});
state.link  = this.main.fu.getApi(state.username,false,'resettoken',[{n:'type',v:'token'}]);
let r = await this.main.fu.fetch(state);
if(r){
  let authToken = r;
  this.formTitle.textContent="Please enter the token sent to you";
  let authTokenTemplate = this.main.tu.authToken();
this.main.pbu.replace(this.authForm,authTokenTemplate.section);
//event
this.main.pbu.listen(authTokenTemplate.button,'click',()=>{
  if(! this.main.vu.validate(authTokenTemplate.input)){return;}
    if(authTokenTemplate.input.value!=authToken){
      this.main.utils.notify('Wrong, please try again',2,'m');
    }else{
      this.formTitle.textContent="Reset your password";
      this.authForm.innerHTML = 
      `
      ${this.main.pbu.createFormControl({serialize:true,title:"Password",type:'password',clasz:['password','sp-validation-required']})}
      ${this.main.pbu.createFormControl({serialize:true,title:"Confirm Password",type:'password',withSubmit:true,clasz:['confirm-password','sp-validation-required']})}
      `;
      let passwordControl = this.authForm.querySelector('input.password');
      let confirmPasswordControl = this.authForm.querySelector('input.confirm-password');
      let submitButton = this.authForm.querySelector('.sp-button');
      //event
      this.main.pbu.listen(submitButton,'click',async()=>{
        if(! this.main.vu.validate(passwordControl,confirmPasswordControl )){return;}
        if(passwordControl.value != confirmPasswordControl.value){
          this.main.utils.notify('Password must be same',2,'m');
          return;
        }
        password = passwordControl.value;
        //now submit password for reset
        state.link = this.main.fu.getApi(state.username,false,'resettoken',[{n:'type',v:'update'}]);
        state.body = state.body = JSON.stringify({email:email,password:password});
        let r = await this.main.fu.fetch(state);
        if(r=='ok'){
          this.formTitle.textContent="Reset successful, please login to your account";
          let href = `/app/${state.username}/login`;
          this.authForm.innerHTML = `<a href="${href}" class="btn btn-primary w-100 py-2" >Submit</button>`;
        }
      });
      

    }
});

}
});
///


}//func

}//#class
