// @ts-check
export class User{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
///######
this.user$=null;
this.users$=null;
this.displayUsers = null;
}//

async setDisplay(){
if(this.state.stateObject){
if(this.state.type=='list'){
this.users$ = this.state.stateObject.users;
this.displayUsers = this.users$;
}else{
if(this.state.type=='new' && this.state.id==-1){
this.user$ = this.getNewUser();
}else if(this.state.type=='edit'){
this.user$ = this.state.stateObject.user;
}
}
}//
}//func

async getListTemplate(){
await this.setDisplay();
let $this = this;
this.userComponent= this.main.pbu.createElement('main',['user-component']);
this.userComponent.innerHTML =
`
<section>
<header>
   <a type="button" href="/app/${this.state.username}/user/page/new/-1" class="btn btn-primary new-user sp-admin sp-route-link">Add User </a> 
   </header>
   <section class="sp-table user-list-table"> </section>
   
  </section>
`;
this.userListTableSection = this.userComponent.querySelector('.user-list-table'); 
this.addUserButton = this.userComponent.querySelector('a.new-user');
updateView();
addEvents();
return this.userComponent;
function updateView(){
$this.setListTable();
}//inner
function addEvents(){
}//inner
}//func
async getFormTemplate(){
await this.setDisplay();
let $this = this;
let u = this.user$;
this.userComponent= this.main.pbu.createElement('main',['user-component']);
this.main.pbu.appendChild(this.userComponent,
`
<section">
<form name="userForm" id="userForm">
${this.main.pbu.createFormControl({title:"E-mail",type:'email',value:u.email,clasz:['email','sp-validation-required'],serialize:true})}
${this.main.pbu.createFormControl({title:"First Name",value:u.firstName,clasz:['first-name','sp-validation-required'],serialize:true})}
${this.main.pbu.createFormControl({title:"Middle Name",value:u.middleName,clasz:['middle-name'],serialize:true})}
${this.main.pbu.createFormControl({title:"Last Name",value:u.lastName,clasz:['last-name'],serialize:true})}
${this.main.pbu.createFormControl({title:"Website",type:'url',value:u.website,clasz:['website'],serialize:true})}
<section>
${this.main.pbu.createFormControl({title:"Password",type:'password',value:'',clasz:['password',(this.state.type=='new')?'sp-validation-required':''],serialize:true})}
</section>
${this.main.pbu.createSelectElement({title:"Role",value:u.topRole,clasz:['top-role'],items:this.main.config.ROLES,serialize:true})}
<button type="button" id="saveUserButton"  class="btn btn-primary float-start">Submit</button>
</form>
</section>
`
);

//get handles

this.emailControl = this.userComponent.querySelector('.email');
this.firstNameControl = this.userComponent.querySelector('.first-name');
this.middleNameControl = this.userComponent.querySelector('.middle-name');
this.lastNameControl = this.userComponent.querySelector('.last-name');
this.websiteControl = this.userComponent.querySelector('.website');
this.passwordControl = this.userComponent.querySelector('.password');
this.topRoleSelector=this.userComponent.querySelector('.top-role');//<select>
this.saveUserButton=this.userComponent.querySelector('#saveUserButton');
//
updateView();
addEvents();
return this.userComponent;
function updateView(){
if($this.state.type=='new'){
$this.passwordControl.placeholder = 'Password';
$this.main.pbu.addClass($this.passwordControl,['sp-validation-required']);
}else{
    $this.passwordControl.placeholder = 'Leave empty to use current password';
}
}//inner

function addEvents(){
$this.main.pbu.listen($this.saveUserButton,'click',()=>{
$this.saveUser();
});
}//inner
}//func
setListTable(){
let titles = ["First Name","Last Name","Email","Role"];
let posts = [];
for(let u of this.displayUsers){
let p = {
id:u.id,
href:`/${this.state.username}/user/page/category/${u.name}/${u.id}`,
titles:[u.firstName,u.lastName,u.email,u.topRole],
editHref:`/app/${this.state.username}/user/page/edit/${u.id}`,
deleteHref:`/app/${this.state.username}/user/page/delete/${u.id}`
};
posts.push(p);
}//for
let menuTable = this.main.pbu.createTable({titles:titles,posts:posts});
this.main.pbu.replace(this.userListTableSection,menuTable);
}//func
async saveUser(){
if(!this.main.vu.validate(this.userComponent.querySelectorAll('input.sp-validation'))){
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
password:this.passwordControl.value
}
this.main.utils.sign(user);
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
this.main.utils.notify("Saved",0,'d');
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
        topRole:"AUTHOR",
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
this.state.stateObject.users = items;
await this.setDisplay();
}
}//class