// @ts-check
export class Video {
    /**
     * 
     * @param {any} main 
     */
constructor(main){
this.main = main;
}

/**
 * 
 * @param {any} template
 * @param {any} source
 */
getNewPlayer(template,source={src:'',type:''}){
    if(template.playerInit){
        let oldPlayer = videojs(template.video);
        oldPlayer?.dispose();
    }
if(template.variant == 'video'){
template.videoDiv.innerHTML = `
<video-js width="640" height="264" class="sp-video-js video-js">
</video-js>
`;  
}else{
template.videoDiv.innerHTML = `<audio class="sp-video-js video-js">/</audio>`;
}
  template.video = template.div.querySelector('.sp-video-js');
  template.video.setAttribute('data-src',source.src);
  template.video.setAttribute('data-variant',template.variant);

  let option = {
 controls: true,
  autoplay: false,
  preload: 'auto',
  responsive: true,
  sources:[{ "type": source.type, "src": source.src}],
  techOrder :["html5","youtube"]
};
  videojs(template.video, option);
  template.playerInit = true;
  this.main.pbu.show(template.videoDiv);

}//func
/**
 * 
 * @param {any} data 
 * @returns 
 */
getVideoTemplate(data={src:''}){   
let $this = this;
//let playerId = 'sp_id'+this.main.utils.getRandomInt();
let iconClasz = (data.variant=='video')?'bi-youtube':'bi-music-note';
let div = this.main.pbu.createElement('div',['card','video-template']);
div.innerHTML = 
`
<div class='sp-placeholder border border-secondary  m-2'>
<input class="d-none sp-input" type="file" accept="${data.variant}/*">
<p class="small"><i class="bi ${iconClasz} mx-2"></i>Upload ${data.variant} or insert a URL</p>
<button class="btn btn-sm btn-primary upload-video m-2" type="button">Upload</button>
<button class="btn btn-sm btn-primary insert-video m-2" type="button">Insert Link</button>
<i class="bi bi-trash sp-remove m-2 ${this.main.pbu.addClassIf(!data.src,['d-none'])}" style="color: #FF0000;"></i>
</div>

<div class="main-video ${this.main.pbu.addClassIf(data.divClasz,data.divClasz)} ${this.main.pbu.addClassIf(!data.src,['d-none'])}">
</div>
`;
//handle
let input = div.querySelector('.sp-input');
let videoDiv = div.querySelector('div.main-video');
let placeholdersection = div.querySelector('.sp-placeholder');
let uploadButton = div.querySelector('.upload-video');
let insertButton = div.querySelector('.insert-video');
let remove = div.querySelector('.sp-remove');
//
let template = {
div:div,
uploadButton:uploadButton,
insertButton:insertButton,
input:input,
video:null,
videoDiv:videoDiv,
remove:remove,
placeholdersection:placeholdersection,
playerInit:false,
variant:data.variant
};
if(data.src){
let type = (data.variant=='video')? "video/mp4":"audio/mp3" ;
if(data.src.includes('youtube.com') || data.src.includes('youtu.be')){
    type =  "video/youtube";
}

this.getNewPlayer(template,{src:data.src,type:type});
}
if(data.isView){
    return videoDiv;
}else{
attachEvents();
return template;
}


async function attachEvents(){
$this.main.pbu.listen(uploadButton,'click',()=>input.click());
//
$this.main.pbu.listen(input,'change',()=>{
    $this.handleVideo(template,'upload');
});
//
$this.main.pbu.listen(insertButton,'click',()=>{
$this.handleVideo(template,'insert');
});

$this.main.pbu.listen(remove,'click',async ()=>{
let video = template.video;
if(video.src?.includes('imagedelivery')){
//throw exception if cnamt delete and return, no action taken
}
let player = videojs(video);
player?.dispose();
$this.main.pbu.hide(videoDiv,remove);
});
}//inner
}//func

/**
 * 
 * @param {any} template 
 * @param {string} type 
 */
handleVideo(template,type='upload'){
let $this=this;
let originalVideoSrc = template.video?.src;
let src;
switch(type){
    case 'upload':
    const file = template.input.files[0];
if (file) {
//validate file, eg size, type
if(!file.type.startsWith(template.variant)){
    this.main.utils.notify('Wrong file type uploaded',1,'m');
    return;
}
//read file and preview;
const reader = new FileReader();
reader.onload = async function(e) {
src = e.target.result;
// src = '/videos/sample-15s.mp4';
// src = '/audios/audio.mp3';
$this.main.log(file,0,'Video.handleVideo(): file');
if(src){
$this.getNewPlayer(template,{src:src,type:file.type});
}else{
$this.main.pbu.hide(template.videoDiv,template.remove);
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
//finally
if(originalVideoSrc?.includes('imagedelivery')){
    template.videoSource.setAttribute('oldVideoId',originalVideoSrc);
}
}//func
}
