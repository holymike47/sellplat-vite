// @ts-check
export class FetchUtils{
/**
 * 
 * @param {any} main 
 */
constructor(main){
    this.main = main;
    this.errorMessage = 'An unexpected error occurred';
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
let option = {headers:headers,method:state.method};
//let option = {headers:headers,method:state.method,credentials: 'include'};
if(state.isAdmin || state.component=='login' || state.component=='register'){
this.errorMessage = (state.errorMessage)?state.errorMessage: `Error processing ${state.component}`;//???
option.credentials = 'include';
}
if(state.body){
    option.body = state.body;
}
//now
let url = (state.link)? state.link: this.getApi(state.username,'dashboard',state.url,null);
let request = new Request(url,option);
let response;
let responseJson;
try{
response = await window.fetch(request);
responseJson = await response.json();
}catch(error){
this.main.log(error,0,'FetchUtils.fetch(): fetch error');
this.main.utils.notify(this.errorMessage,2,state.isAdmin?'d':'m',state.notice);
throw new Error();
}// end fetch
let notifications = document.querySelectorAll('.notification') || [];
for(let n of notifications){
    n.innerHTML = '';
}
//NOW PROCESS RESULT
this.main.log(responseJson,0,'FetchUtils.fetch(): responseJson');
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
try{
let response = await window.fetch(request);
let responseJson = await response.json();
this.main.log(responseJson,0,'FetchUtils.fetchExt(): responseJson');
return responseJson;
}catch(error){
this.main.log(error,0,'FetchUtils.fetchExt(): fetch error');
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
//let apiBase = this.main.config.BASE_URL;
let host = window.location.host;
this.main.log(host,0,'FetchUtils.getApi(): host');
let apiBase;
if(host=='localhost:5173'){
apiBase = this.main.config.BASE_URL;
}else{
//apiBase = 'https://' + host + '/api';
apiBase = 'https://sellplat.codecapt.com/api';
}
//for now
apiBase = 'https://sellplat.codecapt.com/api';
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
        url = url + path;
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
this.main.log(url,0,'FetchUtils.getApi(): fetch link');
return url;
}//

}//class