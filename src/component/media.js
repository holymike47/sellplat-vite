import { th } from "intl-tel-input/i18n";

// @ts-check
export class Media {
    /**
     * 
     * @param {any} main 
     */
constructor(main){
this.main = main;
//awaiting deletion
this.oldMediaIds = [];
}

/**
 * 
 * @param {HTMLDivElement} div 
 * @param {any} source 
 * @param {string} mediaType 
 * @param {boolean} isInit 
 */
getNewMedia(div,source={src:'',type:''},mediaType,isInit){
let originalMediaSrc = div.querySelector('.main-media')?.src;
let mediaDiv = div.querySelector('div.main-media-container');
let media;
let remove = div.querySelector('.sp-remove')
if(mediaType=='image'){
mediaDiv.innerHTML = 
`
<img src ="${source.src}" class="main-media img-fluid" data-src="${source.src}" data-media-type="image"/>
`; 
media = mediaDiv.querySelector('.main-media');
}else{
    //VIDEO PLAYER
if(isInit){
        let oldMedia = div.querySelector('.main-media');
        let oldPlayer = videojs(oldMedia);
        oldPlayer?.dispose();
    }
if(mediaType == 'video'){
mediaDiv.innerHTML = `
<video-js width="640" height="264" class="main-media">
</video-js>
`;  
}else{
mediaDiv.innerHTML = `<audio class="main-media">/</audio>`;
}
  media = mediaDiv.querySelector('.main-media');
  this.main.pbu.addClass(media,["sp-video-js","video-js"]);
  media.setAttribute('data-src',source.src);
  media.setAttribute('data-media-type',mediaType);

  let option = {
 controls: true,
  autoplay: false,
  preload: 'auto',
  responsive: true,
  sources:[{ "type": source.type, "src": source.src}],
  techOrder :["html5","youtube"]
};
  videojs(media, option);
}
//finally
  this.main.pbu.show(mediaDiv,remove);
  if(originalMediaSrc?.startsWith(this.main.r2Domain)){
    media.setAttribute('originalMediaSrc',originalMediaSrc);
  }
}//func
/**
 * 
 * @param {any} data 
 * @returns 
 */
getTemplate(data={src:'',mediaType:''}){   
let $this = this;
//let iconClasz = 
let div = this.main.pbu.createElement('div',['card','media-template']);
div.innerHTML = 
`
<div class='sp-placeholder border border-secondary  m-2'>
<input class="d-none sp-input" type="file" accept="${data.mediaType}/*">
<p class="small"><i class="bi ${this.main.config.ICON_CLASZ[data.mediaType]} mx-2"></i>Upload ${data.mediaType} or insert URL</p>
<button class="btn btn-sm btn-primary upload-media m-2" type="button">Upload</button>
<button class="btn btn-sm btn-primary insert-media m-2" type="button">Insert Link</button>
<i class="bi bi-trash sp-remove m-2 ${this.main.pbu.addClassIf(!data.src,['d-none'])}" style="color: #FF0000;"></i>
</div>

<div class="main-media-container ${this.main.pbu.addClassIf(data.divClasz,data.divClasz)} ${this.main.pbu.addClassIf(!data.src,['d-none'])}">
</div>
`;
//handle
let input = div.querySelector('.sp-input');
let mediaDiv = div.querySelector('div.main-media-container');
let placeholdersection = div.querySelector('.sp-placeholder');
let uploadButton = div.querySelector('.upload-media');
let insertButton = div.querySelector('.insert-media');
let remove = div.querySelector('.sp-remove');
//
// let template = {
// div:div,
// uploadButton:uploadButton,
// insertButton:insertButton,
// input:input,
// media:null,
// mediaDiv:mediaDiv,
// remove:remove,
// placeholdersection:placeholdersection,
// init:false,
// mediaType:data.mediaType
// };

if(data.src){
let type = (data.variant=='video')? "video/mp4":"audio/mp3" ;
if(data.src.includes('youtube.com') || data.src.includes('youtu.be')){
    type =  "video/youtube";
}
this.getNewMedia(div,{src:data.src,type:type},data.mediaType,false);
}
if(data.isView){
    return mediaDiv;
}else{
attachEvents();
return div;
}
async function attachEvents(){
$this.main.pbu.listen(uploadButton,'click',()=>input.click());
//
$this.main.pbu.listen(input,'change',()=>{
    $this.handleMedia(div,'upload',data.mediaType);
});
//
$this.main.pbu.listen(insertButton,'click',()=>{
$this.handleMedia(div,'insert',data.mediaType);
});

$this.main.pbu.listen(remove,'click',async ()=>{
$this.addMediaIds({div:div});
$this.main.pbu.hide(mediaDiv,remove);
$this.main.utils.notify("Removed",0,'d');
});
}//inner
}//func

/**
 * 
 * @param {any} template 
 * @param {string} type 
 */
handleMedia(div,type='upload',mediaType){
let $this=this;
let src;
let input = div.querySelector('.sp-input');
switch(type){
    case 'upload':
    const file = input.files[0];
if (file) {
//validate file, eg size, type
if(!file.type.startsWith(mediaType)){
    this.main.utils.notify('Wrong file type uploaded',1,'m');
    return;
}
//read file and preview;
const reader = new FileReader();
reader.onload = async function(e) {
src = e.target.result;
$this.main.log(file,0,'Media.handleMedia(): file');
if(src){
$this.getNewMedia(div,{src:src,type:file.type},mediaType,true);
}else{
$this.main.pbu.hide(template.mediaDiv,template.remove);
}
}
reader.readAsDataURL(file);
}
    break;
    case 'insert':
let modal = this.main.utils.setModal('Insert Video',null);
//
this.main.pbu.listen(modal.confirm,'click',()=>{
//check image source
let src = modal.input.value;
if(!src){
    this.main.utils.notify('No video link inserted',1,'c',modal.notice);
    return;
}
//will validate
if(! src.startsWith("/videos")){modal.input.type='url';}
if(!this.main.vu.validate(modal.input)){return;}
let type = "video/mp4";
if(src.includes('youtube.com') || src.includes('youtu.be')){
    type =  "video/youtube";
}
this.getNewPlayer(template,{src:src,type:type});
//now
modal.dismiss.click();
});
        break;
}
}//func

/**
 * 
 * @param {HTMLDivElement} div - the main container:placeholder,input etc
 */
async uploadToServer(div){
try{
let media = div.querySelector('.main-media');
if(! media){
    return '';
}
let mediaType = this.main.pbu.getAttribute(media,"data-media-type");
let input = div.querySelector('.sp-input');
//let mediaDiv = div.querySelector('.sp-input');
let mediaId;
let src = this.main.pbu.getAttribute(media,'data-src');
if(!src){
    mediaId = '';
}else if(src.startsWith(this.main.r2Domain)){
    mediaId = this.getMediaUrl(src,false);
}else if(src.startsWith('data:')){
//firstly, get upload link
let file = input.files[0];
let contentType = file.type;
let bucketKey = this.getBucketKey(file);
this.main.log(bucketKey,0,'Media.uploadToServert(): bucketKey');
let data = {
"mediaType":mediaType,
"bucketKeys":[bucketKey],
"contentType":contentType,
"action":"geturl"
};
let state = this.main.utils.clone(this.main.state);
state.body = JSON.stringify(data);
state.link = this.main.fu.getApi('app/presignurl');
let r = await this.main.fu.fetch(state);
this.main.log(r,0,`MediaHandler.uploadToServer(): cloudflare upload link`);
if(r){
//now we have the link, upload
let data = {
link:r,
body:file,
method:"PUT",
contentType:contentType,
noResponse:true
};
r = await this.main.fu.fetchExt(data);
if(r==true){
    this.main.log(r,0,`MediaHandler.uploadToServer(): cloudflare upload response`);
    mediaId = bucketKey;
    src = this.getMediaUrl(mediaId,true);
    this.getNewMedia(div,{"src":src,type:contentType},mediaType,true);
}else{
    this.main.utils.notify("Error uploading image",2,'d');
    throw new Error();
}
}
}
let oldMediaId = this.main.pbu.getAttribute(media,'originalMediaSrc');
if(oldMediaId?.startsWith(this.main.r2Domain)){
    //prepare for delete
    this.oldMediaIds.push(this.getMediaUrl(oldMediaId,false));
}
return mediaId;
}catch(error){
this.main.utils.notify(`Error uploading media`,2,'d');
this.main.log(error,0,'MediaHandler.uploadToServert(): fetch error');
throw new Error();
}
}//func

/**
 * 
 * @param {File} file 
 * @returns 
 */
getBucketKey(file){
let currentDate = new Date();
let year = currentDate.getFullYear();  // Returns the 4-digit year (e.g., 2026)
let month = currentDate.getMonth() + 1; // Returns 1-12 (getMonth() is 0-indexed)
let day = currentDate.getDate();
let mediaType = file.type.split('/')[0];
let fileName = file.name;
//remove tld from username
let domain = this.main.username.split('.')[0];
return `tenant/${domain}/${mediaType}/${year}/${month}/sp-${this.main.utils.getUUID(5)}-${fileName}`;
}//func

/**
 * 
 * @param {string} mediaId 
 * @param {boolean} withDomain - if to return the id with the domain name
 * @param {boolean} showPlaceholder - if to return the placeholder for images if no url
 * @returns 
 */
getMediaUrl(mediaId,withDomain=true,showPlaceholder=true){
let url = '';
if(withDomain){
//here mediaId is the bucketKey
if(mediaId){
url = `${this.main.r2Domain}/${mediaId}`;
}else{
if(showPlaceholder){
    url = 'https://r2.senplat.com/public/image/sp_placeholder.png';
}
}
}else{
//here media is eg: https://r2.senplat.com/tenant/godlysensation/image/2026/7/1/sp-8a5a4cf9pic.png
url = mediaId.split(`${this.main.r2Domain}/`)[1];
}
return url;
}//func

async deleteFromServer(data){
let state = this.main.utils.clone(this.main.state);
let mediaIds = [];
if(data==null){
mediaIds = [...this.oldMediaIds];
}else if(data.mediaIds){
mediaIds = [...data.mediaIds];
}else if(data.items){
    for(let i of data.items){
            if(i.featuredImageUrl){
                mediaIds.push(i.featuredImageUrl);
            }
            if(data.component=='post'){
            let mainContent = i.mainContent;
            let matches = [...mainContent.matchAll(/"src":"(.*?)"/g)];
            let values = matches.map(m => m[1]);
            mediaIds.push(...values);
        }
        }
}

if(mediaIds.length>0){
this.main.log(mediaIds,0,`MediaHandler.deleteFromServer(): imageids`);
let data = {
"bucketKeys":mediaIds,
"action":"delete"
};
state.link = this.main.fu.getApi('app/presignurl');
state.body = JSON.stringify(data);
let r = await this.main.fu.fetch(state);
this.main.log(r,0,`MediaHandler.deleteFromServer(): image deleted?`);
this.oldMediaIds = [];
return r;
}
}//func

/**
 * 
 * @param {any} data 
 * @returns 
 */
addMediaIds(data){
let $this = this;
if(data.div){
let mediaEls = data.div.querySelectorAll('.main-media');
for(let media of mediaEls){
let mediaType = this.main.pbu.getAttribute(media,'data-media-type');
let mediaSrc = $this.main.pbu.getAttribute(media,'data-src');
if(mediaSrc?.includes($this.main.r2Domain)){
$this.oldMediaIds.push(this.getMediaUrl(mediaSrc,false));
}
let originalMediaSrc =  $this.main.pbu.getAttribute(media,'originalMediaSrc');
if(originalMediaSrc?.includes($this.main.r2Domain)){
$this.oldMediaIds.push(this.getMediaUrl(originalMediaSrc,false));
}
//
if(mediaSrc && mediaType=='image'){
        media.remove();
    }else if(mediaSrc && (mediaType=='audio' || mediaType=='video')){
let player = videojs(media);
player?.dispose();
}
}
}else if(data.items){
    for(let i of data.items){
            if(i.featuredImageUrl){
                $this.oldMediaIds.push(this.getMediaUrl(i.featuredImageUrl,false));
            }
            if(data.component=='post'){
            let mainContent = i.mainContent;
            let matches = [...mainContent.matchAll(/"src":"(.*?)"/g)];
            let values = matches.map(m => m[1]);
            for(let v of values){
                $this.oldMediaIds.push(this.getMediaUrl(v,false));
            }
        }
    }
        }
$this.main.log($this.oldMediaIds,0,'Media.getTemplate.attachEvents: oldMediaIds');
return this.oldMediaIds;
}//func

resetMediaIds(){
this.oldMediaIds = [];
this.main.log(this.oldMediaIds,0,'Media.resetMediaIds(): oldMediaIds');
}
}//class
