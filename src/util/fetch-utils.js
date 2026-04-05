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
state.method = (state.body)?'POST' :'GET';
let headers = new Headers();
headers.append("sp","sp");
headers.append("Content-Type", "application/json");
headers.append("sp-su", state.url);
headers.append("sp-nsu", state.nextState?state.nextState.url:"");
if(state.isMainPost){
headers.append("sp-main-post","main-post");
}
let option = {headers:headers,method:state.method};
if(state.isAdmin){
this.errorMessage = (state.errorMessage)?state.errorMessage: `Error retrieving ${state.component}`;//???
if(!state.handler){
state.handler = state.method=='POST'?'save':'find';
}
///
//option.credentials = 'include';
headers.append("sp-sid",this.spSid);
headers.append("sp-stp",this.spStp);   
//
headers.append("sp-select",state.select?state.select:"");
headers.append("sp-where",state.where?state.where:"");
headers.append("sp-vals",state.vals?state.vals:"");//
}
if(state.body){
    option.body = state.body;
}
//now
headers.append("sp-handler",state.handler);
let url = (state.isAdmin)? this.main.fu.getApi(state.username,true)+`/${state.handler}` : state.link;
let request = new Request(url,option);
let response;
let responseJson;
try{
response = await window.fetch(request);
console.log("response headers");
console.log(response.headers);
let spSid = response.headers.get('sp-sid');
if(spSid){
    this.spSid = spSid;
}
let spStp = response.headers.get('sp-stp');
if(spStp){
    this.spStp = spStp;
}
responseJson = await response.json();
}catch(error){
if(state.isRoot){
console.log(error);
}
this.main.utils.notify(this.errorMessage,2,state.isAdmin?'s':'m');
}// end fetch
let notifications = document.querySelectorAll('.notification') || [];
for(let n of notifications){
    n.innerHTML = '';
}
//NOW PROCESS RESULT
console.log(responseJson);
if(typeof responseJson=='object' && ('errorMessage' in responseJson && !this.main.utils.isNull(responseJson.errorMessage))){
            if(state.isRoot){
                //if dev instead;
            console.log(responseJson.errorMessage);
        }
   this.main.handleError(responseJson,state);
   return false;
}//
else{
    //no error here, process response normally
    return responseJson;
}
}//func
//########## GENERAL ##########
/**
 * 
 * @param {string} username 
 * @param {boolean} admin 
 * @returns 
 */
getApi(username,admin){
let apiBase = this.main.config.BASE_URL;
let url;
if(admin){
url = apiBase + username + "/admin";
}
else{
    if(username){
        url = apiBase + username;
    }else{
        url = apiBase;
    }
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