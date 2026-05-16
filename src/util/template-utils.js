// @ts-check
export class TemplateUtils{
/**
 * 
 * @param {any} main 
 */
constructor(main){
    this.main = main;
}

/**
 * 
 * @param {boolean} serialize 
 */
authToken(serialize=false){
    let section = this.main.pbu.createElement('section',['auth-token']);
    section.innerHTML = 
    `
    <div class="sp-form-control mb-2">
    <input type="text" class="form-control sp-validation-required auth-token">
    </div>
    <button class="btn btn-primary w-100 my-2 auth-token" type="button">Verify</button>
    `;
    let input = section.querySelector('input.auth-token');
    let button = section.querySelector('button.auth-token');
   return serialize?section.outerHTML:{section:section,input:input,button:button};
}
}//class