// @ts-check
export class Option{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
this.state.component = 'option';//important, could be setting
/**@type {any}*/this.option$={};
}//

async setDisplay(){
if(this.state.stateObject){
this.option$ = this.state.stateObject;
}//

}//func

async getTemplate(){
await this.setDisplay();
let $this = this;
let o = this.option$;
this.optionSection=this.main.pbu.createElement('section',['option']);
///
this.main.pbu.appendChild(this.optionSection,
`
${this.main.pbu.createFormControl({title:"Site Name",value:o.siteName,clasz:['site-name'],required:true,serialize:true})}
${this.main.pbu.createFormControl({title:"Tagline",value:o.tagline,clasz:['tagline'],serialize:true})}
${this.main.pbu.createFormControl({title:"Website",type:'url',value:o.siteUrl,clasz:['site-url'],serialize:true})}
${this.main.pbu.createCheckedInputElement({title:"Theme",type:'radio',value:o.activeTheme,clasz:['active-theme'],items:this.main.config.ACTIVE_THEME,serialize:true})}

<div class="mb-3 row">
<label for="logoImageDiv" class="col-sm-2 col-form-label">Site Logo </label>
<div class="col-sm-10" id="logoImageDiv">

</div>
</div>

<div class="mb-3 row">
<label for="iconImageDiv" class="col-sm-2 col-form-label">Site Icon </label>
<div class="col-sm-10" id="iconImageDiv">

</div>
</div> 
<button id="saveButton" type="button" class="btn btn-primary float-end">Save</button>
`
);
//handle
this.siteNameControl=this.optionSection.querySelector('.site-name');//<input>
this.taglineControl=this.optionSection.querySelector('.tagline');//<input>
this.siteUrlControl=this.optionSection.querySelector('.site-url');//<input>
this.activeThemeDiv=this.optionSection.querySelector('.active-theme');//<input>[check]
//images
//logo
this.logoImageDiv = this.optionSection.querySelector('#logoImageDiv');
this.logoImageTemplate = this.main.mh.getImageTemplate({src:$this.main.mh.getImageUrl(o.logoUrl,'grid'),width:"300", height:"300",divClasz:['w-50']});
this.logoImageTemplate.insertIcon.remove();
this.main.pbu.replace(this.logoImageDiv,this.logoImageTemplate.div);
//icon
// this.iconImageDiv = this.optionSection.querySelector('#iconImageDiv');
// this.iconImageTemplate = this.main.mh.getImageTemplate({src:$this.main.mh.getImageUrl(o.iconUrl,'grid'),width:"300", height:"300",divClasz:['w-50']});
// this.iconImageTemplate.insertIcon.remove();
// this.main.pbu.replace(this.iconImageDiv,this.iconImageTemplate.div);
this.saveButton = this.optionSection.querySelector('#saveButton');
addEvents();
return this.optionSection;
function addEvents(){
$this.main.pbu.listen($this.saveButton,'click',()=>{
    $this.saveOption();
});
}//inner

//
}//

async saveOption(){
if(! this.main.vu.validate(this.optionSection.querySelectorAll('input.sp-form-control:not([type="radio"])'))){
    return;
}
let logoImageId = await this.main.mh.uploadToServer(this.logoImageDiv.querySelector('div.image-template'));
//let iconImageId = await this.main.mh.uploadToServer(this.iconImageTemplate.div);
//don't touch these first properties
let option = {
id:this.option$.id,
siteName:this.siteNameControl.value,
tagline:this.taglineControl.value,
siteUrl:this.siteUrlControl.value,
activeTheme:this.optionSection.querySelector('input.active-theme:checked').value,
logoUrl:logoImageId,
iconUrl:'',
};
this.main.log(option,0,'Option.saveOption(): Before submit');
let state = this.main.utils.clone(this.state);
state.link = this.main.fu.getApi(state.url);
state.body = JSON.stringify(option);
let r = await this.main.fu.fetch(state);
if(r && r==this.option$.id){
this.main.utils.setCache('option',this.option$);
this.main.setTheme(this.option$);
this.main.utils.notify("Saved",0,'m');
this.main.mh.deleteFromServer(null);
}
}//
}//class
