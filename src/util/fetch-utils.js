// @ts-check
export class FetchUtils{
/**
 * 
 * @param {any} main 
 */
constructor(main){
    this.main = main;
    this.errorMessage = 'Error';
    this.spSid = '';
    this.spStp = '';
}


/**
 * 
 * @param {any} state 
 * @returns 
 */
async fetch(state){
state = this.main.utils.clone(state);
if(!state.method){
state.method = (state.body)?'POST' :'GET';
}
let headers = new Headers();
headers.append("sp","sp");
headers.append("Content-Type", "application/json");
headers.append("sp-nsu", state.nextState?`/api${state.nextState.url}`:"");
if(state.isMainPost){
    //eg searches
headers.append("sp-main-post","main-post");
}
let option = {headers:headers,method:state.method,credentials: 'include'};
if(state.isAdmin){
this.errorMessage = (state.errorMessage)?state.errorMessage: `Error retrieving ${state.component}`;//???
//option.credentials = 'include';

//
// headers.append("sp-select",state.select?state.select:"");
// headers.append("sp-where",state.where?state.where:"");
// headers.append("sp-vals",state.vals?state.vals:"");//
}
if(state.body){
    option.body = state.body;
}
//now
//headers.append("sp-handler",state.handler);
let url = (state.link)? state.link: this.getApi(state.username,'dashboard',state.url,null);
if(state.isAdmin){
console.log(state);
console.log("url: "+url);
//return;
}

let request = new Request(url,option);
let response;
let responseJson;
try{
response = await window.fetch(request);
console.log("response headers");
console.log(response.headers);
responseJson = await response.json();
}catch(error){
if(import.meta.env.MODE=='development'){
console.error(error);
}
this.main.utils.notify(this.errorMessage,2,state.isAdmin?'s':'m');
throw new Error();
}// end fetch
let notifications = document.querySelectorAll('.notification') || [];
for(let n of notifications){
    n.innerHTML = '';
}
//NOW PROCESS RESULT
console.log(responseJson);
if(typeof responseJson=='object' && ('errorMessage' in responseJson && !this.main.utils.isNull(responseJson.errorMessage))){
   this.main.handleError(responseJson,state);
}//
else{
    //no error here, process response normally
    return responseJson.result;
}
}//func

/**
 * 
 * @param {any} data 
 * @returns 
 */
async fetchExt(data){
let headers = new Headers();
if(data.authToken){
headers.append("Authorization", `Bearer ${data.authToken}`);
}
let method = (data.body)?'POST' :'GET';
let option = {headers:headers,method:method};
if(data.body){
    option.body = data.body;
}
//now
let request = new Request(data.link,option);
console.log("request headers");
console.log(request.headers);
try{
let response = await window.fetch(request);
console.log("response headers");
console.log(response.headers);
let responseJson = await response.json();
console.log("response headers");
console.log(responseJson);
return responseJson;
}catch(error){
if(import.meta.env.MODE=='development'){
console.error(error);
}
this.main.utils.notify(this.errorMessage,2,'m');
return false;
}// end fetch
}//func

//########## GENERAL ##########
/**
 * 
 * @param {string} username 
 * @param {boolean|string} admin 
 * @param {string|null} path; 
 * @param {string[]|null} searchParams; 
 * @returns 
 */
getApi(username,admin,path,searchParams){
let apiBase = this.main.config.BASE_URL;
let url = apiBase + '/app';
if(admin){
if(admin=='dashboard'){
return apiBase + path;
}else{
    url = url + `/${username}/admin`;
}
}

else{
    //not admin
    if(username){
        url = url + `/${username}`;
    }
}

if(path){
    if(path.startsWith('/')){
        path = url + path;
    }else{
        url = url + `/${path}`;
    }
    
}

if(searchParams){
let params = new URLSearchParams();
for(let p of searchParams){
params.append(p.n, p.v);
}
url = url + `?${params}`;
}
return url;
}//

getApi2(username,admin){
let apiBase = this.main.config.BASE_URL;
//
if(!username && !admin){return apiBase;}
if(admin){
apiBase = apiBase + username + "/admin";
}else{
apiBase = apiBase + username;
}
return apiBase;
}//
}//class