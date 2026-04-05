// @ts-check
import { MediaHandler } from "./media-handler";
export class Option{
/**
 * 
 * @param {any} main 
 * @param {any} state 
 */
constructor(main,state){
this.main = main;
this.state = state;
this.state.component = 'option';
//
this.title = "option";
/**@type {any}*/this.option$={};
}//

getTemplate(){
if(!this.option$){return;}
let $this = this;
let o = this.option$;
this.optionSection=this.main.pbu.createElement('section',['option']);
///
this.main.pbu.appendChild(this.optionSection,
this.main.pbu.createFormControl({id:"siteName",title:"Site Name",value:o.siteName}),
this.main.pbu.createFormControl({id:"tagline",title:"Tagline",value:o.tagline}),
this.main.pbu.createFormControl({id:"siteUrl",title:"Website",value:o.siteUrl}),
this.main.pbu.createCheckedInputElement({id:"activeTheme",title:"Theme",value:o.activeTheme,type:'radio',items:this.main.config.ACTIVE_THEME}),
`
<div class="mb-3 row">
<label for="logoImageDiv" class="col-sm-2 col-form-label">Site Logo </label>
<div class="col-sm-10" id="logoImageDiv">

</div>
</div>
`,
`
<div class="mb-3 row">
<label for="iconImageDiv" class="col-sm-2 col-form-label">Site Icon </label>
<div class="col-sm-10" id="iconImageDiv">

</div>
</div> 
`,
`<button id="saveButton" type="button" class="btn btn-primary float-end">Save</button>`,
);
//handle
this.siteNameControl=this.optionSection.querySelector('#siteName');//<input>
this.taglineControl=this.optionSection.querySelector('#tagline');//<input>
this.siteUrlControl=this.optionSection.querySelector('#siteUrl');//<input>
this.activeThemeDiv=this.optionSection.querySelector('#activeTheme');//<input>[check]
//images
//logo
this.logoImageDiv = this.optionSection.querySelector('#logoImageDiv');
this.logoImageTemplate = this.main.mh.getImageTemplate({src:o.logoUrl,width:"72", height:"57"});
this.logoImageTemplate.insertIcon.remove();
this.main.pbu.replace(this.logoImageDiv,this.logoImageTemplate.div);

//icon
this.iconImageDiv = this.optionSection.querySelector('#iconImageDiv');
this.iconImageTemplate = this.main.mh.getImageTemplate({src:o.iconUrl,width:"72", height:"57"});
this.iconImageTemplate.insertIcon.remove();
this.main.pbu.replace(this.iconImageDiv,this.iconImageTemplate.div);

this.saveButton = this.optionSection.querySelector('#saveButton');

///

///
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
this.siteNameControl;
if(! this.main.vu.required(this.siteNameControl)){
    return;
}
let option = {
id:this.option$.id,
siteName:this.siteNameControl.value,
tagline:this.taglineControl.value,
siteUrl:this.siteUrlControl.value,
activeTheme:this.activeThemeDiv.querySelector('input:checked').value,
logoUrl:this.logoImageTemplate.image.src,
iconUrl:this.iconImageTemplate.image.src,
username:this.main.cache.tenant.username,
tenantId:this.main.cache.tenant.tenantId,
tenantUuid:this.main.cache.tenant.tenantUuid,
};
console.log('before submit');
console.log(option);
let state = this.state;
state.handler = 'save';
state.body = JSON.stringify(option);
let r = await this.main.fu.fetch(state);
if(r==this.option$.id){
this.option$ = option;
this.main.cache.option = option;
this.main.setTheme(this.option$.activeTheme);
this.main.utils.notify("Saved",0,'s');
}
}//
}//class
