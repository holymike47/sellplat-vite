// // @ts-check
// export class MediaHandler {
//     /**
//      * 
//      * @param {any} main 
//      */
// constructor(main){
// this.main = main;
// }
// /**
//  * 
//  * @param {any} div 
//  */
// async uploadToServer(div){
// try{
// let image = div.querySelector('.main-media');
// let input = div.querySelector('.sp-input');
// let imageId;
// if(!image.src){
//     imageId = '';
// }
// if(image.src?.includes("/images")){
// //using image from public folder
// imageId = image.src.substring(image.src.indexOf('/images'));
// }else if(image.src.includes('imagedelivery')){
//     //already have an image
//     let paths = image.src.split('/');
//     imageId = paths[4];
// }else if(image.src.startsWith('data:image')){
// //firstly, get upload link
// let data = {"mediaType":"image"};
// let state = this.main.utils.clone(this.main.state);
// state.body = JSON.stringify(data);
// state.link = this.main.fu.getApi('app/presignurl');
// let r = await this.main.fu.fetch(state);
// this.main.log(r,0,`MediaHandler.uploadToServer(): cloudflare upload link`);
// if(r){
// //now we have the link, upload
// let file = input.files[0];
// let formData = new FormData();
// formData.append("file", file);
// let data = {
// link:r.result.uploadURL,
// body:formData,
// method:"POST"
// };
// r = await this.main.fu.fetchExt(data);
// if(r.success==true){
//     this.main.log(r,0,`MediaHandler.uploadToServer(): cloudflare upload response`);
//     imageId = r.result.id;
//     let template = {div:div,"mediaType":"image"};
//     this.main.media.getNewMedia(template,{src:this.main.mh.getImageUrl(r.result.id,'public')});
//     image.src = this.getImageUrl(r.result.id,'public');
// }else{
//     this.main.utils.notify("Error uploading image",2,'d');
//     throw new Error();
// }
// }
// }
// let oldMediaId = div.querySelector('.main-media').getAttribute('oldMediaId');
// if(oldMediaId?.includes('imagedelivery')){
//     //prepare for delete
//     this.main.oldImageIds.push(oldMediaId.split('/')[4]);
// }
// return imageId;
// }catch(error){
// this.main.utils.notify("Error uploading image",2,'d');
// this.main.log(error,0,'MediaHandler.uploadToServert(): fetch error');
// throw new Error();
// }
// }//func
// /**
//  * 
//  * @param {any} data
//  * @returns 
//  */
// async deleteFromServer(data){
// let state = this.main.utils.clone(this.main.state);
// let imageIds = [];
// if(data==null){
// imageIds = [...this.main.oldImageIds];
// this.main.oldImageIds = [];
// }else if(data.src){
// if(data.src.includes('imagedelivery')){
//     imageIds.push(data.src.split('/')[4]);
// }
// }
// else if(data.imageIds){
// imageIds = [...data.imageIds];
// }else if(data.items){
//     for(let i of data.items){
//             if(i.featuredImageUrl){
//                 imageIds.push(i.featuredImageUrl);
//             }
//             if(data.component=='post'){
//             let mainContent = i.mainContent;
//             let matches = [...mainContent.matchAll(/"src":"(.*?)"/g)];
//             let values = matches.map(m => m[1]);
//             imageIds.push(...values);
//         }
//         }
// }

// if(imageIds.length>0){
// this.main.log(imageIds,0,`MediaHandler.deleteFromServer(): imageids`);
// let input = {
// "type":"cloudflare",
// "job":"delete",
// "imageIds":imageIds
// };
// state.link = this.main.fu.getApi('app/token');
// state.body = JSON.stringify(input);
// let r = await this.main.fu.fetch(state);
// this.main.log(r,0,`MediaHandler.deleteFromServer(): image deleted?`);
// return r;
// }
// }//func

// /**
//  * 
//  * @param {string} imageId 
//  * @param {string} variant 
//  * @param {boolean} showPlaceholder
//  * @returns 
//  */
// getImageUrl(imageId,variant,showPlaceholder=false){
// let url = '';
// if(!imageId){
//     if(showPlaceholder){
//         url = '/images/placeholder/sp_placeholder_800by400.png';
//     }
// }else if (imageId.startsWith("/images")){
// url = imageId;
// }else{
// url = this.main.config.IMG_DELIVERY + `/${imageId}/${variant}`;
// }
// return url;
// }//func
// }//class
