// @ts-check
export class MediaHandler {
    /**
     * 
     * @param {any} main 
     */
constructor(main){
this.main = main;
}
/**
 * 
 * @param {any} data 
 * @returns 
 */
getImageTemplate(data={src:'',icon:'',imageOnly:false}){   
let $this = this;
let div = this.main.pbu.createElement('div',['card','image-template']);
div.innerHTML = 
`
<div>
<img class="main-image d-none ${data.clasz?data.clasz.join(' '):''}">
</div>

<div>
<i class="bi main-icon fs-1 mb-4 d-none"></i>
</div>

<div class='sp-placeholder'>
<p class="small"><i class="bi bi-image mx-2"></i>Upload image or insert an image URL</p>
<input class="d-none sp-input" type="file" accept="image/*">
<button class="btn btn-sm upload-image m-2" type="button">${(data.src)?'Update': 'Upload'}</button>
<button class="btn btn-sm insert-image m-2" type="button">Insert Link</button>
<button class="btn btn-sm select-icon m-2" type="button">Add Icon</button>
<i class="sp-remove d-none bi bi-trash m-2" style="color: #FF0000;"></i>
</div>
`;
let imageDiv = div.querySelector('div.main-image');
let image = div.querySelector('img.main-image');
let iconDiv= div.querySelector('div.main-icon');
let icon =div.querySelector('i.main-icon');
//used to easily reset icon to default state
let iconClass = ['bi','main-icon','fs-1','mb-4'];
/**@type {HTMLDivElement} */let placeholdersection = div.querySelector('.sp-placeholder');
let input = div.querySelector('.sp-input');
let uploadButton = div.querySelector('.upload-image');
let insertImageLinkButton = div.querySelector('.insert-image');
let selectIconButton = div.querySelector('.select-icon');
let remove = div.querySelector('.sp-remove');
//
if(data.width && data.height){
image.width=data.width; 
image.height=data.height;
}else{
    this.main.pbu.addClass(image,['card-img-top']);
}

//
if(data.src){
image.src = data.src;
this.main.pbu.show(image);
this.main.pbu.show(remove);
removeIcon();
}else if(data.icon){
removeIcon();
icon.classList.add(data.icon);
this.main.pbu.show(icon);
icon.setAttribute('icon',data.icon);
this.main.pbu.show(remove);
removeImage();
}

if(data.isView){
    return image;
}
///
let template = {
div:div,
input:input,
uploadButton:uploadButton,
insertButton:insertImageLinkButton,
insertIcon:selectIconButton,
icon:icon,
iconDiv:iconDiv,
image:image,
imageDiv:imageDiv,
remove:remove,
placeholdersection:placeholdersection
};
//add events
//########## IMAGE ##############
this.main.pbu.listen(uploadButton,'click',()=>input.click());
//
this.main.pbu.listen(insertImageLinkButton,'click',(e)=>{
//e.preventDefault();
let modal = this.main.utils.setModal('Insert Link',null);
modal.input.type='url';
//
this.main.pbu.listen(modal.confirm,'click',()=>{
if(!this.main.vu.validate(modal.input)){
        return;
}
let src = modal.input.getAttribute('data-href');//set if validation passes;
if(src){
image.src = src;
removeIcon();
modal.dismiss.click();
}
});
});
//
this.main.pbu.listen(input,'change',()=>this.handleImage(template));
//
this.main.pbu.listen(image,'load',()=>{
this.main.pbu.show(image);
this.main.pbu.show(remove); 
removeIcon();
});
//######### ICON ##################
this.main.pbu.listen(selectIconButton,'click',(e)=>{
//e.preventDefault();
//let selectIconDiv = this.main.pbu.createSelectElement({clasz:['sp-modal-select'],items:this.main.config.ICONS});
let select = this.main.pbu.createElement('select');
this.main.pbu.appendChild(select,`<option value="">None</option>`);
 ;
for(let i of this.main.config.ICONS){
    let option = `<option value="${i}"> ${i}</option>`;
    this.main.pbu.appendChild(select,option);
}
let modal = this.main.utils.setModal('Pick an icon',select);
//
this.main.pbu.listen(modal.confirm,'click',()=>{
//let iClasz = selectIconDiv.querySelector('.sp-modal-select').value;
let iClasz = select.value;
if(iClasz){
removeIcon();
icon.classList.add(iClasz);
icon.setAttribute('icon',iClasz);
this.main.pbu.show(icon);
//remove image
removeImage();
}
modal.dismiss.click();
});
});
//
this.main.pbu.listen(remove,'click',()=>{
//hide image or icon
if(image.src){
removeImage();
}else{
removeIcon();
}
this.main.pbu.hide(remove);
});
//finally
return template;

function removeImage(){
image.src='';
$this.main.pbu.hide(image);
uploadButton.textContent = 'Upload';
}//inner
function removeIcon(){
icon.removeAttribute('class');
icon.removeAttribute('icon');
$this.main.pbu.addClass(icon,[...iconClass]);
$this.main.pbu.hide(icon);
}
}//func

getImageTemplate2(data={src:'',icon:'',imageOnly:false}){   
let $this = this;
let div = this.main.pbu.createElement('div',['card','image-template']);

/**@type {HTMLDivElement} */let placeholdersection = this.main.pbu.createElement('div',['placeholder-section']);
div.appendChild(placeholdersection);
let bi = this.main.pbu.createElement('i',['bi','bi-image','mx-2']);
let description = this.main.pbu.createElement('p',['small'],'Upload image or insert an image URL');
description.prepend(bi);
placeholdersection.appendChild(description);
//
let input = this.main.pbu.createElement('input',['d-none']);
input.type = 'file';
input.accept = 'image/*';

let uploadButton = this.main.pbu.createElement('button',['btn','btn-sm','upload-button','m-2'],(data.src)?'Update': 'Upload',[{n:'type',v:'button'}]);
let insertImageLinkButton = this.main.pbu.createElement('button',['btn','btn-sm','insert-image-button','m-2'],'Insert Link',[{n:'type',v:'button'}]);
let insertIconClassButton = this.main.pbu.createElement('button',['btn','btn-sm','insert-icon-button','m-2'],'Insert Icon',[{n:'type',v:'button'}]);
let remove = this.main.pbu.createElement('i',['d-none','bi','bi-trash','m-2']);
remove.style.color = '#FF0000';
this.main.pbu.appendChild(placeholdersection,input,uploadButton,insertImageLinkButton,insertIconClassButton,remove);
/////
let imageDiv = this.main.pbu.createElement('div');
/**@type {HTMLImageElement}*/let image = this.main.pbu.createElement('img',['main-image','d-none']);
////**@type {HTMLImageElement}*/let image = this.main.pbu.createElement('img',['main-image','card-img-top','image-fluid','d-none']);
imageDiv.appendChild(image);
if(data.width && data.height){
image.width=data.width; 
image.height=data.height;
}else{
    this.main.pbu.addClass(image,['card-img-top']);
}
if(data.clasz){
this.main.pbu.addClass(image,data.clasz);
}


let iconDiv = this.main.pbu.createElement('div');
//used to easily reset icon to default state
let iconClass = ['bi','main-icon','fs-1','mb-4'];
/**@type {HTMLImageElement}*/let icon =this.main.pbu.createElement('i',[...iconClass,'d-none']);
iconDiv.appendChild(icon);
div.prepend(imageDiv,iconDiv);
//
if(data.src){
image.src = data.src;
this.main.pbu.show(image);
this.main.pbu.show(remove);
removeIcon();
}else if(data.icon){
removeIcon();
icon.classList.add(data.icon);
this.main.pbu.show(icon);
icon.setAttribute('icon',data.icon);
this.main.pbu.show(remove);
removeImage();
}

if(data.isView){
    return image;
}
///
let template = {
div:div,
input:input,
uploadButton:uploadButton,
insertButton:insertImageLinkButton,
insertIcon:insertIconClassButton,
icon:icon,
iconDiv:iconDiv,
image:image,
imageDiv:imageDiv,
remove:remove,
placeholdersection:placeholdersection
};
//add events
//########## IMAGE ##############
this.main.pbu.listen(uploadButton,'click',()=>input.click());
//
this.main.pbu.listen(insertImageLinkButton,'click',(e)=>{
e.preventDefault();
let modal = this.main.utils.getModal(e);
//
this.main.pbu.listen(modal.save,'click',()=>{
let src = modal.input.value;
//validate()
if(src){
image.src = src;
removeIcon();
modal.close.click();
}else{
modal.validationMessage.textContent = 'Invalid....';
this.main.pbu.show(modal.validationMessage);
}
});
});
//
this.main.pbu.listen(input,'change',()=>this.handleImage(template));
//
this.main.pbu.listen(image,'load',()=>{
this.main.pbu.show(image);
this.main.pbu.show(remove); 
removeIcon();
});
//######### ICON ##################
this.main.pbu.listen(insertIconClassButton,'click',(e)=>{
e.preventDefault();
let modal = this.main.utils.getModal(e);
//
this.main.pbu.listen(modal.save,'click',()=>{
let ic = modal.input.value;//icon class
//validate()
if(ic){
removeIcon();
icon.classList.add(ic);
icon.setAttribute('icon',ic);
this.main.pbu.show(icon);
//remove image
removeImage();
modal.close.click();
}else{
modal.validationMessage.textContent = 'Invalid....';
this.main.pbu.show(modal.validationMessage);
}
});
});
//
this.main.pbu.listen(remove,'click',()=>{
//hide image or icon
if(image.src){
removeImage();
}else{
removeIcon();
}
this.main.pbu.hide(remove);
});
//finally
return template;

function removeImage(){
image.src='';
$this.main.pbu.hide(image);
uploadButton.textContent = 'Upload';
}//inner
function removeIcon(){
icon.removeAttribute('class');
icon.removeAttribute('icon');
$this.main.pbu.addClass(icon,[...iconClass]);
$this.main.pbu.hide(icon);
}
}//func

handleImage(template){
let input = template.input;
let image = template.image;
let uploadButton = template.uploadButton;
let insertButton = template.insertButton;
let remove = template.remove;

const file = input.files[0];
if (file) {
//validate file, eg size, type
let $this=this;
//read file and preview;
const reader = new FileReader();
reader.onload = async function(e) {
image.src = e.target.result;
if(image.src){
uploadButton.textContent = 'Update';
}else{
$this.main.pbu.hide(image);
$this.main.pbu.hide(remove);
uploadButton.textContent = 'Upload';
}
}
reader.readAsDataURL(file);
}
}//func

/**
 * 
 * @param {string} src 
 * @returns 
 */
getAudioTemplate(src){
let div = this.main.pbu.createElement('div',['card-body','audio-template']);
let icon = this.main.pbu.createElement('i',['bi','bi-music-note','mx-2']);
/**@type {HTMLParagraphElement} */let description = this.main.pbu.createElement('p');
description.textContent = 'Upload audio or insert an audio URL';
description.prepend(icon);
div.appendChild(description);
//
/**@type {HTMLDivElement} */let placeholdersection = this.main.pbu.createElement('div',['placeholder-section']);
div.appendChild(placeholdersection);
let input = this.main.pbu.createElement('input',['d-none']);
input.type = 'file';
input.accept = 'audio/*';

let uploadButton = this.main.pbu.createElement('button',['btn','upload-button','mx-2'],(src)?'Update': 'Upload');
let insertButton = this.main.pbu.createElement('button',['btn','insert-button','mx-2'],'Insert Audio Link');
let remove = this.main.pbu.createElement('i',['d-none','bi','bi-trash','mx-2']);
remove.style.color = '#FF0000';
this.main.pbu.appendChild(placeholdersection,input,uploadButton,insertButton,remove);
let p = this.main.pbu.createElement('p',['mt-3']);
/**@type {HTMLAudioElement}*/let audio = this.main.pbu.createElement('audio',['main-audio','d-none']);
audio.controls = true;
p.appendChild(audio);
div.appendChild(p);
if(src){
audio.src = src;
this.main.pbu.show(audio);
this.main.pbu.show(remove);
}
let template = {
div:div,
input:input,
uploadButton:uploadButton,
insertButton:insertButton,
icon:icon,
audio:audio,
remove:remove
};
//add events
this.main.pbu.listen(uploadButton,'click',()=>input.click());
//
this.main.pbu.listen(insertButton,'click',()=>{
let modal = this.main.utils.getModal();
placeholdersection.appendChild(modal.div);
//
this.main.pbu.listen(modal.save,'click',()=>{
let src = modal.input.value;
//validate()
if(src){
audio.src = src;
modal.close.click();
}else{
modal.validationMessage.textContent = 'Invalid....';
this.main.pbu.show(modal.validationMessage);
}
});
});
//
this.main.pbu.listen(input,'change',()=>this.handleAudio(template));
//
this.main.pbu.listen(audio,'canplay',()=>{
this.main.pbu.show(audio);
this.main.pbu.show(remove);   
});
//
this.main.pbu.listen(remove,'click',()=>{
audio.src=undefined;
this.main.pbu.hide(audio);
this.main.pbu.hide(remove);
uploadButton.textContent = 'Upload';
});
return template;
}//func

handleAudio(template){
let $this=this;
// let input = template.input;
// let image = template.image;
// let uploadButton = template.uploadButton;
// let insertButton = template.insertButton;
// let remove = template.remove;

const file = template.input.files[0];
if (file) {
//validate file, eg size, type
//read file and preview;
const reader = new FileReader();
reader.onload = async function(e) {
template.audio.src = e.target.result;
if(template.audio.src){
template.uploadButton.textContent = 'Update';
}else{
$this.main.pbu.hide(template.audio);
$this.main.pbu.hide(template.remove);
template.uploadButton.textContent = 'Upload';
}
}
reader.readAsDataURL(file);
}
}//func

}//class
