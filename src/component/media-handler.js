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
<img class="main-image d-none">
</div>

<div>
<i class="bi main-icon fs-1 mb-4 d-none"></i>
</div>

<div class='sp-placeholder'>
<p class="small"><i class="bi bi-image mx-2"></i>Upload image or insert an image URL</p>
<input class="d-none sp-input" type="file" accept="image/*">
<button class="btn btn-sm btn-primary original-image d-none m-2" type="button"><i class="bi bi-image mx-2"></i>Original</button>
<button class="btn btn-sm btn-primary upload-image m-2" type="button">Upload</button>
<button class="btn btn-sm btn-primary insert-image m-2" type="button">Insert Link</button>
<button class="btn btn-sm btn-primary select-icon m-2" type="button">Add Icon</button>
<i class="sp-remove d-none bi bi-trash m-2" style="color: #FF0000;"></i>
</div>
`;
let imageDiv = div.querySelector('div.main-image');
let image = div.querySelector('img.main-image');
let iconDiv= div.querySelector('div.main-icon');
let icon =div.querySelector('i.main-icon');
//used to easily reset icon to default state
//let iconClass = ['bi','main-icon','fs-1','mb-4'];
/**@type {HTMLDivElement} */let placeholdersection = div.querySelector('.sp-placeholder');
let input = div.querySelector('.sp-input');
let originalImageButton = div.querySelector('.original-image');
let uploadButton = div.querySelector('.upload-image');
let insertImageLinkButton = div.querySelector('.insert-image');
let selectIconButton = div.querySelector('.select-icon');
let remove = div.querySelector('.sp-remove');
//
let template = {
div:div,
input:input,
uploadButton:uploadButton,
originalButton:originalImageButton,
insertButton:insertImageLinkButton,
insertIcon:selectIconButton,
icon:icon,
iconDiv:iconDiv,
image:image,
imageDiv:imageDiv,
remove:remove,
placeholdersection:placeholdersection
};
//
if(data.width && data.height){
image.width=data.width; 
image.height=data.height;
}else{
    this.main.pbu.addClass(image,['card-img-top']);
}
if(data.clasz){
    this.main.pbu.addClass(image,data.clasz);
}
if(data.divClasz){
    this.main.pbu.addClass(div,data.divClasz);
}
//
if(data.src){
image.src = data.src;
this.main.pbu.show(image);
this.main.pbu.show(remove);
this.removeIcon(template);
}else if(data.icon){
//initially
this.removeIcon(template);
icon.classList.add(data.icon);
this.main.pbu.show(icon);
icon.setAttribute('icon',data.icon);
this.main.pbu.show(remove);
this.removeImage(template);
}

if(data.isView){
    return image;
}
///

//add events
//########## IMAGE ##############
this.main.pbu.listen(originalImageButton,'click',()=>{
    image.src = data.src;
    image.removeAttribute('oldimageid');
    this.main.pbu.hide(originalImageButton);
});
//
this.main.pbu.listen(uploadButton,'click',()=>input.click());
//
this.main.pbu.listen(insertImageLinkButton,'click',()=>{
this.handleImage(template,'insert');
});
//
this.main.pbu.listen(input,'change',()=>{
    this.handleImage(template,'upload');
});
//
this.main.pbu.listen(image,'load',()=>{
this.main.pbu.show(image);
this.main.pbu.show(remove); 
this.removeIcon(template);
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
this.removeIcon(template);
icon.classList.add(iClasz);
icon.setAttribute('icon',iClasz);
this.main.pbu.show(icon);
//remove image
this.removeImage(template);
}
modal.dismiss.click();
});
});
//
this.main.pbu.listen(remove,'click',()=>{
//hide image or icon
if(image.src){
this.removeImage(template);
}else{
this.removeIcon(template);
}
this.main.pbu.hide(remove);
});
//finally
return template;

// function removeImage(){
// if(image.src?.includes('imagedelivery')){
// $this.deleteFromServer({src:image.src});
// }
// image.src='';
// $this.main.pbu.hide(image);
// uploadButton.textContent = 'Upload';
// }//inner
// function removeIcon(){
// let iconClass = ['bi','main-icon','fs-1','mb-4'];//
// icon.removeAttribute('class');
// icon.removeAttribute('icon');
// $this.main.pbu.addClass(icon,[...iconClass]);
// $this.main.pbu.hide(icon);
// }
}//func

///
/**
 * 
 * @param {any} t - image template
 */
removeImage(t){
if(t.image.src?.includes('imagedelivery')){
this.deleteFromServer({src:t.image.src});
}
t.image.src='';
this.main.pbu.hide(t.image);
t.uploadButton.textContent = 'Upload';
}//func
/**
 * 
 * @param {any} t - image template
 */
removeIcon(t){
let iconClass = ['bi','main-icon','fs-1','mb-4'];//
t.icon.removeAttribute('class');
t.icon.removeAttribute('icon');
this.main.pbu.addClass(t.icon,[...iconClass]);
this.main.pbu.hide(t.icon);
}//func
///

/**
 * 
 * @param {any} template 
 * @param {string} type 
 */
handleImage(template,type='upload'){
let input = template.input;
let image = template.image;
//let oldImageId;
let uploadButton = template.uploadButton;
let insertButton = template.insertButton;
let remove = template.remove;

if(type=='upload'){
const file = input.files[0];
if (file) {
//validate file, eg size, type
let $this=this;
//read file and preview;
const reader = new FileReader();
reader.onload = async function(e) {
image.src = e.target.result;
if(image.src){
uploadButton.textContent = 'Change';
}else{
$this.main.pbu.hide(image);
$this.main.pbu.hide(remove);
uploadButton.textContent = 'Upload';
}
}
reader.readAsDataURL(file);
}
}else if(type=='insert'){
let modal = this.main.utils.setModal('Insert Link',null);
//
this.main.pbu.listen(modal.confirm,'click',()=>{
//check image source
let value = modal.input.value;
let src;
if(!value){
    this.main.utils.notify('No image inserted',1,'c',modal.notice);
    return;
}
//will validate
if(value.startsWith("/images")){
    //inserting from public folder
    if(!this.main.vu.validate(modal.input)){return;}
    src = value;
}else{
modal.input.type='url';
if(!this.main.vu.validate(modal.input)){
        return;
}
src = modal.input.getAttribute('data-href');//set if validation passes;
}

if(src){
image.src = src;
this.removeIcon(template);
modal.dismiss.click();
}
});
}
//finally
let originalImageSrc = image.src;
if(originalImageSrc && originalImageSrc.includes('imagedelivery')){
    this.main.pbu.show(template.originalButton);
    image.setAttribute('oldImageId',originalImageSrc);
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

/**
 * 
 * @param {any} imageTemplate 
 */
async uploadToServer(imageTemplate){
try{
let image = imageTemplate.querySelector('.main-image');
let input = imageTemplate.querySelector('.sp-input');
let imageId;
if(image.src?.includes("/images")){
imageId = image.src.substring(image.src.indexOf('/images'));
}else if(image.src?.startsWith('data:image')){
//firstly, get upload link
let state = this.main.utils.clone(this.main.state);
state.link = this.main.fu.getApi(state.username,true,'token');
let data = {
"type":"cloudflare",
"job":"uploadLink"
};
state.body = JSON.stringify(data);
let r = await this.main.fu.fetch(state);
this.main.log(r,0,`MediaHandler.uploadToServer(): cloudflare upload link`);
if(r){
//now we have the link, upload
let file = input.files[0];
let formData = new FormData();
formData.append("file", file);
let data = {
link:r.result.uploadURL,
body:formData
};
r = await this.main.fu.fetchExt(data);
if(r){
    imageId = r.result.id;
    image.src = this.main.mh.getImageUrl(r.result.id,'public');
}
}
}else if(image.src?.includes('imagedelivery')){
    let paths = image.src.split('/');
    imageId = paths[4];
}
return imageId;
}catch(error){
this.main.utils.notify("Error uploading image",2,'d');
this.main.log(error,0,'MediaHandler.uploadToServert(): fetch error');
}finally{
let oldImageId = imageTemplate.querySelector('.main-image').getAttribute('oldImageId');
if(oldImageId?.includes('imagedelivery')){
    this.main.oldImageIds.push(oldImageId.split('/')[4]);
}
}
}//func
/**
 * 
 * @param {any} data
 * @returns 
 */
async deleteFromServer(data){
let state = this.main.utils.clone(this.main.state);
let imageIds = [];
if(data==null){
imageIds = [...this.main.oldImageIds];
this.main.oldImageIds = [];
}else if(data.src){
if(data.src.includes('imagedelivery')){
    imageIds.push(data.src.split('/')[4]);
}
}
else if(data.imageIds){
imageIds = [...data.imageIds];
}else if(data.items){
    for(let i of data.items){
            if(i.featuredImageUrl){
                imageIds.push(i.featuredImageUrl);
            }
            if(data.component=='post'){
            let mainContent = i.mainContent;
            let matches = [...mainContent.matchAll(/"src":"(.*?)"/g)];
            let values = matches.map(m => m[1]);
            imageIds.push(...values);
        }
        }
}

if(imageIds.length>0){
this.main.log(imageIds,0,`MediaHandler.deleteFromServer(): imageids`);
state.link = this.main.fu.getApi(state.username,true,'token');
let input = {
"type":"cloudflare",
"job":"delete",
"imageIds":imageIds
};
state.body = JSON.stringify(input);
this.main.fu.fetch(state).then(r=>{
this.main.log(r,0,`MediaHandler.deleteFromServer(): image deleted?`);
});
}
}//func

/**
 * 
 * @param {string} imageId 
 * @param {string} variant 
 * @returns 
 */
getImageUrl(imageId,variant){
if(!imageId){
    return '';
}else if (imageId.startsWith("/images")){
return imageId;
}else{
return this.main.config.IMG_DELIVERY + `/${imageId}/${variant}`;
}

}//func
}//class
