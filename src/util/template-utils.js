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
}//

/**
 * 
 * @param {boolean} serialize 
 */
getModalTemplate(serialize=false){
let div = this.main.pbu.createElement('div',['prompt-modal']);
div.innerHTML = 
`
<button id="promptModalTrigger" data-bs-toggle="modal" data-bs-target="#promptModal"></button>
<div class="modal fade" id="promptModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <p class="modal-notice"></p>
        <div class="modal-body">

        </div>
        <div class="modal-footer">
          <span id="modalButton"></span>
        </div>
      </div>
    </div>
  </div>
`;
return serialize?div.outerHTML:div;
}

}//class