// @ts-check
import { Dashboard } from "./dashboard";
export class User{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
this.isRoot = true;
///######
this.title = "user";
this.user$=null;
this.users$=null;
this.displayUsers = null;
}//

async process(){
if(this.state.type=='list'){
let r = await this.main.fu.fetch(this.state);
if(r){
this.users$ = r;
await this.setDisplay();
console.log('this.users$');
console.log(this.users$);
return this.getListTemplate();
}

}else{
    //not list
if(this.state.isAdmin && (this.state.type=='new' && this.state.id==-1)){
this.user$ = this.getNewUser();
//await this.setDisplay();//??
return this.getFormTemplate();
}else if(this.state.isAdmin && this.state.type=='edit'){
let r = await this.main.fu.fetch(this.state);
if(r){
this.user$ = await this.main.fu.fetch();
//await this.setDisplay();//??
return this.getFormTemplate();
}
}//#edit
}
}//func

async setDisplay(){
if(!this.users$){

}
this.displayUsers = this.users$;
}//func

getListTemplate(){
let $this = this;
this.userComponent= this.main.pbu.createElement('main',['user-component']);
this.userComponent.innerHTML =
`
<section>
<header>
   <a type="button" href="/app/${this.state.username}/user/page/new/-1" class="btn new-user sp-link sp-admin-link sp-route-link">Add User </a> 
   </header>
   <section class="sp-table user-table"> <section>
   
  </section>
`;

this.addUserButton = this.userComponent.querySelector('a.new-user');
updateView();
addEvents();
return this.userComponent;
function updateView(){
let titles = ["First Name","Last Name","Email","Role"];
let posts = [];
for(let u of $this.displayUsers){
let p = {
id:u.id,
href:`/${$this.state.username}/user/page/category/${u.name}/${u.id}`,
titles:[u.firstName,u.lastName,u.email,u.topRole],
editHref:`/app/${$this.state.username}/user/page/edit/${u.id}`,
deleteHref:`/app/${$this.state.username}/user/page/delete/${u.id}`
};
posts.push(p);
}//for
let menuTable = $this.main.pbu.createTable({titles:titles,posts:posts});
$this.main.pbu.appendChild($this.userComponent,menuTable);
}//inner
function addEvents(){
    $this.main.pbu.listen($this.addUserButton,'click',(e)=>{
        e.preventDefault();
         let state = $this.main.getState(e,true);
        $this.main.navigate(state);
        // if($this.users$.length==$this.main.config.MAX_USERS){
        //     $this.main.utils.notify($this.main.config.MAX_USERS_ERROR,1,'s');
        //     return;
        // }else{
        //     let state = $this.main.getState(e,true);
        //     $this.main.navigate(state);
        // }
    });
}//inner
}//func
getFormTemplate(){
let $this = this;
let u = this.user$;
this.userComponent= this.main.pbu.createElement('main',['user-component']);
this.main.pbu.appendChild(this.userComponent,
`
<section">
<form name="userForm" id="userForm">
${this.main.pbu.createFormControl({id:"email",title:"E-mail",value:u.email})}
${this.main.pbu.createFormControl({id:"firstName",title:"First Name",value:u.firstName})}
${this.main.pbu.createFormControl({id:"middleName",title:"Middle Name",value:u.middleName})}
${this.main.pbu.createFormControl({id:"lastName",title:"Last Name",value:u.lastName})}
${this.main.pbu.createFormControl({id:"website",title:"Website",value:u.website})}
<section>
${this.main.pbu.createFormControl({id:"password",type:'password',title:"Password",value:''})}
</section>
`,
this.main.pbu.createSelectElement({id:"topRole",title:"Role",value:u.topRole,items:this.main.config.ROLES}),
`
<button type="button" id="saveUserButton"  class="btn float-start">Submit</button>
</form>
</section>
`
);

//get handles

this.emailControl = this.userComponent.querySelector('#email');
this.firstNameControl = this.userComponent.querySelector('#firstName');
this.middleNameControl = this.userComponent.querySelector('#middleName');
this.lastNameControl = this.userComponent.querySelector('#lastName');
this.websiteControl = this.userComponent.querySelector('#website');
this.passwordControl = this.userComponent.querySelector('#password');
this.topRoleSelector=this.userComponent.querySelector('#topRole');//<select>
this.saveUserButton=this.userComponent.querySelector('#saveUserButton');
//
updateView();
addEvents();
return this.userComponent;
function updateView(){
$this.passwordControl.placeholder = ($this.state.type=='new')?'Password':'Leave empty to use current password';
}//inner

function addEvents(){
$this.main.pbu.listen($this.saveUserButton,'click',()=>{
$this.saveUser();
});
}//inner
}//func
async saveUser(){
if(!this.main.vu.required(this.emailControl,this.firstNameControl)){
return;
}
let user={
id:this.user$.id,
email:this.emailControl.value,
firstName:this.firstNameControl.value,
middleName:this.middleNameControl.value,
lastName:this.lastNameControl.value,
website:this.websiteControl.value,
topRole:this.topRoleSelector.value,
password:this.passwordControl.value,
username:this.main.cache.tenant.username,
tenantId:this.main.cache.tenant.tenantId,
tenantUuid:this.main.cache.tenant.tenantUuid,
}
console.log("user");
console.log(user);
// if(!this.validate(user)){
//     return;
// }
let state = this.state;
state.body = JSON.stringify(user);
let r = await this.main.fu.fetch(state);
if(r>0){
this.state = this.main.replaceState(this.user$,this.state,r);
this.main.utils.notify("Saved",0,'s');
}
}//func

/**
 * 
 * @param {any} user 
 * @returns 
 */
validate(user){
//validate fields
//validate data integrity
let valid = true;
    if(this.state.id==-1){
        for (let u of this.users$) {
					if (u.email==user.email) {
                        valid = false;
						// user exists
						this.main.utils.notify(this.main.config.EMAIL_EXISTS_ERROR,1,'m');
						break;
					}
				}
    }else{
        let otherUsersEmail = this.users$.filter(u => u.id!=user.id).map(u => u.email);
				if (otherUsersEmail.includes(user.email)) {
                    valid = false;
					// cant use an email of an existing user
					this.main.utils.notify(this.main.config.EMAIL_EXISTS_ERROR,1,'m');
				}
    }
    return valid;
}//
getNewUser(){
    let user={
        id:-1,
        email:"",
        firstName:"",
        middleName:"",
        lastName:"",
        dob:"",
        website:"",
        topRole:"",
        password:"",
        username:"",
        tenantId:"",
        tenantUuid:"",
        creationDate:"",
        lastUpdate:""
    }
    return user;
}//func

getItems(){
    return this.users$;
}
/**
 * 
 * @param {any} items 
 */
async setItems(items){
this.users$ = items;
await this.setDisplay();
}
}//class