// @ts-check
export class ValidationUtils{
/**
 * 
 * @param {any} main 
 */
constructor(main){
    this.main = main;
    this.VALIDATION_CLASS = ['border','border-danger'];
    this.VALIDATION_EMAIL_MESSAGE = 'Please enter a valid email';
    this.VALIDATION_NUMBER_MESSAGE = 'Please enter a valid number';
    this.VALIDATION_URL_MESSAGE = 'Please enter a valid link';
    this.failed = [];
}
/**
 * 
 * @param {HTMLInputElement[]} els 
 */
sanitize(els){
let valid = true;
let regex = /script/;
for(let el of els){
//let type = el.type;
let value = el.value;
//note: no value when an input like number has validation message or error
if(el.validationMessage){
//url is quite different
if(el.type!='url'){
this.finalize(el,false,el.validationMessage);
}
}
if(!value){continue;}
if(regex.test(value)){
this.finalize(el,false,'Invalid character');
}
}
valid = this.failed.length==0;
this.failed = [];
return valid;
}//func
/**
 * 
 * @param {HTMLInputElement} el 
 */
required(el){
let valid = true;
let isText = el.type=='text' || el.type=='password';
if(!el.value){
valid = false;
}
let message;
if(isText){
message = `${el.name?el.name:'This field'} is required`;
}else{
message = `Please enter a valid ${el.type}`;
}
this.finalize(el,valid,message);
return valid;
}//func

/**
 * 
 * @param {HTMLInputElement[]} els 
 */
validate(...els){
let valid = false;
let regex;
let fields = [];
for(let el of els){
if(Array.isArray(el) || el instanceof NodeList){
    fields.push(...el);
}else{
    fields.push(el);
}
}
valid = this.sanitize(fields);
if(!valid){
return false;
}
for(let el of fields){
let type = el.getAttribute('type');
let isRequired = el.classList.contains('sp-validation-required');
let value = el.value;
value?.trim();
console.log(el);
switch(type){
    case 'number':
        if(isRequired){
        valid = this.required(el);
        }
            if(value){
                   regex = /^-?\d+(\.\d+)?$/;
                if(!regex.test(value)){
                    valid = false;
                }
                this.finalize(el,valid,this.VALIDATION_EMAIL_MESSAGE);
            }
        
        break;
    case 'tel':
        if(isRequired){
        valid = this.required(el);
        }
            if(value){
                let iti = this.main.intlTelInput.getInstance(el);
                console.log(iti);
                if(iti.isValidNumber()){
                    let tel = iti.getNumber();
                    el.setAttribute('data-tel',tel);
                }else{
                    valid = false;
                }
            this.finalize(el,valid,iti.getValidationError());
            }
        
        break;
    case 'email':
        if(isRequired){
           valid = this.required(el);
        }
            if(value){
                regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if(!regex.test(el.value)){
                    valid = false;
                }
            this.finalize(el,valid,this.VALIDATION_EMAIL_MESSAGE);
            }
        
       break;
       case 'url':
        if(isRequired){
            valid = this.required(el);
        }
        if(value){
            let protocol = value.substring(0,value.indexOf(':'));
            if(! protocol){
            value = 'http://' + value;
            }

        try {
            let u = new URL(value);
            valid = u.protocol === "http:" || u.protocol === "https:";
            if(u.hostname!='localhost'){
                let parts= u.hostname.split(".");
            if(parts.length<=1){
                valid = false;
            }else{
                let tld = parts[parts.length - 1];
                valid = tld.length >= 2;
            }
            }
            if(valid){
                    el.setAttribute('data-href',u.href);
                }
        } catch(error) {
            valid = false;
        }
        this.finalize(el,valid,this.VALIDATION_URL_MESSAGE);
        }
        break;
        case 'text':
        default:
        if(isRequired){
            valid = this.required(el);
        }
        break;
}//switch
}//for
valid = this.failed.length==0;
this.failed = [];
return valid;
}//func

/**
 * 
 * @param {HTMLInputElement} el 
 * @returns 
 */
url(el){
let url = el.value;
if(!url){
    return true;
}
url = url.trim();
let valid = false;
let protocol = url.substring(0,url.indexOf(':'));
if(! protocol){
        url = 'http://' + url;
         }

 try {
    let u = new URL(url);
    valid = u.protocol === "http:" || u.protocol === "https:";
    if(u.hostname!='localhost'){
        let parts= u.hostname.split(".");
    if(parts.length<=1){
        valid = false;
    }else{
        let tld = parts[parts.length - 1];
        valid = tld.length >= 2;
    }
    }
    
  } catch(error) {
    valid = false;
  }
  this.finalize(el,valid,'Invalid Link');
  if(valid){
    return url;
  }else{
    return false;
  }
  
}//func

/**
 * add or remove validation notice
 * @param {HTMLElement} el 
 * @param {boolean} valid 
 * @param {string} message
 */
finalize(el,valid,message){
if(!valid){
  this.failed.push(false);  
}
let parent = el.closest('div.sp-form-control');
let span = parent.querySelector('.sp-span');
if(valid){
if(span){
        span.remove();
        this.main.pbu.removeClass(el,this.VALIDATION_CLASS);
    }
}else{
    this.main.pbu.addClass(el,this.VALIDATION_CLASS);
    if(span){
        span.textContent = message;
    }else{
        span = this.main.pbu.createElement('span',['sp-span','text-danger'],message);
        parent.appendChild(span);
    }
    
}
}
}//class