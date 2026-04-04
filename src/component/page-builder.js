// @ts-check
import { Category } from "./category";
export class PageBuilder{
/**
 * 
 * @param {any} main 
 * @param {any} parent 
 */
constructor(main,parent){
this.main = main;//used when using this component to create another

this.parent = parent;
if(parent){
this.parent.submitPost.bind(this.parent);
}

this.pbInput = '';
///**@type {string|undefined}*/this.type = undefined;
this.isView = false;//enables contentEditable attribute to be set
//
//this.mediaHandler = this.main.mh;

this.init = true;
this.blockMargin  ="mb-3";
this.pageText  = "";//??
//used by widgets
/**@type {any[]|null}*/this.posts$ = null;
/**@type {any[]|null}*/this.categories$ = null;
this.richTextLink;//string|undefined;
this.selectionRange;//:Range;
this.selectedText;//:string;
this.initialText='God wants you well. Understanding and living according to God’s plan is the key to life’s fulfillment.';
//this.subscriptions = [];//(()=>void)[]
//this.contextMenuList = [];
//this.cmSettings = [];
this.elClass = {
    heading:['sp-block','sp-heading'],
    button: ['sp-block','sp-button','btn'],
    form: ['sp-block','sp-form','w-100'],
    richText:['sp-block','sp-rich-text'],
    table:['sp-block','sp-table'],
    list:['sp-block','sp-list'],
    image:['sp-block','sp-image'],
    audio:['sp-block','sp-audio'],
    /** Components */
    cover:['sp-component','sp-cover'],
    card:['sp-component','sp-card','card',this.blockMargin],
    cta: ['sp-component','sp-cta','row','sp-border','p-2'],
    faq:['sp-component','sp-faq']
};
//current context menu element
this.cmCurrentElement = undefined;
}//

/**
 * 
 * @param {string} type 
 * @returns 
 */
async getTemplate(type) {
//not used standalone but within other components
let $this = this;
this.pbComponent=this.main.pbu.createElement('main',['page-builder']);
this.pbComponent.innerHTML = 
`
<!--Header-->
<header class="my-1 d-flex justify-content-between sticky-top" style="z-index: 9;">
<div class="btn-group" id="formatMenu">
<button name="Bold" type="button" class="format-button"><i class="bi bi-file-plus"></i>Bold</button>
<button name="Italic" type="button" class="format-button"><i class="bi bi-file-plus"></i>Italic</button>
<button name="Underline" type="button" class="format-button"><i class="bi bi-file-plus"></i>Underline</button>
<button name="Strikethrough" type="button" class="format-button"><i class="bi bi-file-plus"></i>Strikethrough</button>
<button name="Link" type="button" class="format-button"><i class="bi bi-file-plus"></i>Link</button>
</div>

<div class="btn-group" id="pbMenu">
<button id="switchEditorButton" type="button">Switch<i class="bi"></i></button>
<button id="addRowButton" type="button">Row<i class="bi bi-file-plus"></i></button>
<button id="previewButton" type="button">Preview<i class="bi"></i></button>
<button id="publishButton" type="button">Publish</button>
<button id="saveDraftButton" type="button">Save Draft</button>
</div>

</header>
  <!--#Header-->
     
        <div id="pageBuilder">
        
         </div>

<div class="container">
</div>
`;

this.previewButton = this.pbComponent.querySelector('#previewButton');
this.publishButton = this.pbComponent.querySelector('#publishButton');
this.saveDraftButton = this.pbComponent.querySelector('#saveDraftButton');
this.addRowButton = this.pbComponent.querySelector('#addRowButton');
this.switchEditorButton = this.pbComponent.querySelector('#switchEditorButton');
//
this.pageBuilder = this.pbComponent.querySelector('#pageBuilder');


if(type=='new'){
//set up and add focus to initial block
let wrapper = this.addRow(false);
let blockContainer = wrapper.firstChild;// next sibling is block control
let container = this.createColumn(1,false);
blockContainer.appendChild(container);
let c1 = container.querySelector('.sp-col');
this.main.pbu.appendChild(c1,this.getRichTextBlock(),this.getBlockMenu());
}else if(type=='edit'){
await this.initilizePageBuilder('edit');//edit section, there is also a preview/detail section
}
this.init = false;//??
addEvents();
return this.pbComponent;

function addEvents(){
$this.main.pbu.listen($this.publishButton,'click',()=>$this.save());
//entry point
$this.main.pbu.listen($this.addRowButton,'click',()=>{
$this.addRow();//
});
//richtext format
let formatButtons = $this.pbComponent.querySelectorAll('button.format-button');
for(let b of formatButtons){
    $this.main.pbu.listen(b,'click',()=>{
        $this.formatText(b);
    });
}//for

}//inner
}//func
/**
 * retrieves the serialized post content and setup the page builder
 * called from getTemplate for 'edit' only
 * @param {string} section if edit or detail, if edit, append the content to pagebuilder
 * if section is detail, return a response div
 */
async initilizePageBuilder(section){
let $this = this;
let n;//number of columns in each row
let isEdit = section=='edit';
//when returning 
let responseDiv = this.main.pbu.createElement('div');
//
let result = JSON.parse(this.pbInput);
for(let r of result.r){
n = r.n;
let bc;
if(isEdit){
let wrapper = this.addRow(false);
bc = wrapper.firstElementChild;
this.main.pbu.appendChild(this.pageBuilder,wrapper);
}else{
    bc = responseDiv; 
}
//
let container;
let row;
let col1,col2,col3,col4;
if(n==1){
container = this.createColumn(1,false);
row = container.querySelector('[n]');
col1 =row.querySelector('[c]');
await setMainElement(col1,r.c[0]);
}else if(n==2){
container = this.createColumn(2,false);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = row.lastElementChild;
await setMainElement(col1,r.c[0]);
await setMainElement(col2,r.c[1]);
}
else if(n==3){
container = this.createColumn(3,false);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = col1.nextElementSibling;
col3 = row.lastElementChild;
//
await setMainElement(col1,r.c[0]);
await setMainElement(col2,r.c[1]);
await setMainElement(col3,r.c[2]);
}else if(n==4){
container = this.createColumn(4,false);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = col1.nextElementSibling;
col3 = col2.nextElementSibling;
col4 = row.lastElementChild;
//
await setMainElement(col1,r.c[0]);
await setMainElement(col2,r.c[1]);
await setMainElement(col3,r.c[2]);
await setMainElement(col4,r.c[3]);
}else if(n==5){
container = this.createColumn(4,false);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = row.lastElementChild;
//
await setMainElement(col1,r.c[0]);
await setMainElement(col2,r.c[1]);
}else if(n==6){
container = this.createColumn(5,false);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = row.lastElementChild;
//
await setMainElement(col1,r.c[0]);
await setMainElement(col2,r.c[1]);
}
this.main.pbu.appendChild(bc,container);
//set class on row
this.genFormatedClass(r,row,'r',false);
}
if(section=='detail'){
    return responseDiv;
}

//inner
/**
 * 
 * @param {HTMLDivElement} col 
 * @param  {any[]} dbCol 
 */
async function setMainElement(col,dbCol){
let mains = dbCol.m;
for(let m of mains){
let bc;
let data = {
type:section,
v:m.v,
dClass:[]
};
switch(m.m){
//blocks
case 'heading':
bc = $this.getHeadingBlock(data);
break;
case 'button':
bc = $this.getButtonBlock(data);
break;
case 'richText':
bc = $this.getRichTextBlock(data);
break;
case 'table':
bc = $this.getTableBlock(data);
break;
case 'list':
bc = $this.getListBlock(data);
break;
case 'image':
bc = $this.getImageBlock(data);
break;
case 'form':
bc = $this.getFormBlock(data);
break;
//components :sp-component
case 'cover':
bc = $this.getCoverComponent(data);
break;
case 'card':
bc = $this.getCardComponent(data);
break;
case 'cta':
bc = $this.getCtaComponent(data);
break;
case 'faq':
bc = $this.getFaqComponent(data);
break;
//widgets :sp-widget
case 'recentPosts':
bc = await $this.parent.widget.getRecentPostsWidget(data);
if(n==1){
    let cards = bc.querySelectorAll('.sp-card');
    for(let card of cards){
        $this.main.pbu.addClass(card,['col-md-4']);
    }
}
    break;  
default:
    console.error('in Pagebuilder.setMainElement()');
continue;
}
let main = bc.querySelector('[m]');
let parent = main.parentElement;
$this.genFormatedClass(m,main,'m',false);
let block;
if(isEdit){
block = bc;
}else{
block = parent;
$this.main.pbu.replaceClass(block,'col-11','col-12');
}
col.appendChild(block);
}//for
if(isEdit){
col.prepend($this.getBlockSettings({wrapper:col,type:'c'}));
col.appendChild($this.getBlockMenu());
}
//finally
$this.genFormatedClass(dbCol,col,'c',false);
}//inner()
}//func

async initilizePageBuilder2(section){
let $this = this;
let n;//number of columns in each row
let isEdit = section=='edit';
let tempDiv = this.main.pbu.createElement('div');
//when returning 
let responseDiv = this.main.pbu.createElement('div');
//
tempDiv.innerHTML = this.pbInput;
let divs= (tempDiv.firstElementChild).children;
for(let d of divs){
let r = d.querySelector('[n]');
n = Number(this.main.pbu.getAttribute(r,'n'));
let cols = r.children;//
let bc;
if(isEdit){
let wrapper = this.addRow(false);
bc = wrapper.firstElementChild;
this.main.pbu.appendChild(this.pageBuilder,wrapper);
}else{
    bc = responseDiv; 
}
//
let container;
let row;
let col1,col2,col3,col4;
let blocks1,blocks2,blocks3,blocks4;
if(n==1){
container = this.createColumn(1,false);
this.main.pbu.appendChild(bc,container);
row = container.firstElementChild;
col1 =row.firstElementChild;
blocks1 = cols[0].children;
await setMainElement(col1,...blocks1);
this.main.pbu.genFormatedClass(cols[0],col1,'c',true);
}else if(n==2){
container = this.createColumn(2,false);
this.main.pbu.appendChild(bc,container);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = row.lastElementChild;
//
blocks1 = cols[0].children;
blocks2 = cols[1].children;
await setMainElement(col1,...blocks1);
await setMainElement(col2,...blocks2);
this.main.pbu.genFormatedClass(cols[0],col1,'c',true);
this.main.pbu.genFormatedClass(cols[1],col2,'c',true);
}
else if(n==3){
container = this.createColumn(3,false);
this.main.pbu.appendChild(bc,container);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = col1.nextElementSibling;
col3 = row.lastElementChild;
//
blocks1 = cols[0].children;
blocks2 = cols[1].children;
blocks3 = cols[2].children;
await setMainElement(col1,...blocks1);
await setMainElement(col2,...blocks2);
await setMainElement(col3,...blocks3);
this.main.pbu.genFormatedClass(cols[0],col1,'c',true);
this.main.pbu.genFormatedClass(cols[1],col2,'c',true);
this.main.pbu.genFormatedClass(cols[2],col3,'c',true);
}else if(n==4){
container = this.createColumn(4,false);
this.main.pbu.appendChild(bc,container);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = col1.nextElementSibling;
col3 = col2.nextElementSibling;
col4 = row.lastElementChild;
//
blocks1 = cols[0].children;
blocks2 = cols[1].children;
blocks3 = cols[2].children;
blocks4 = cols[3].children;
await setMainElement(col1,...blocks1);
await setMainElement(col2,...blocks2);
await setMainElement(col3,...blocks3);
await setMainElement(col4,...blocks4);
this.main.pbu.genFormatedClass(cols[0],col1,'c',true);
this.main.pbu.genFormatedClass(cols[1],col2,'c',true);
this.main.pbu.genFormatedClass(cols[2],col3,'c',true);
this.main.pbu.genFormatedClass(cols[3],col4,'c',true);
}else if(n==5){
container = this.createColumn(4,false);
this.main.pbu.appendChild(bc,container);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = row.lastElementChild;
//
blocks1 = cols[0].children;
blocks2 = cols[1].children;
await setMainElement(col1,...blocks1);
await setMainElement(col2,...blocks2);
this.main.pbu.genFormatedClass(cols[0],col1,'c',true);
this.main.pbu.genFormatedClass(cols[1],col2,'c',true);
}else if(n==6){
container = this.createColumn(5,false);
this.main.pbu.appendChild(bc,container);
row = container.firstElementChild;//row
col1 =row.firstElementChild;
col2 = row.lastElementChild;
//
blocks1 = cols[0].children;
blocks2 = cols[1].children;
await setMainElement(col1,...blocks1);
await setMainElement(col2,...blocks2);
this.main.pbu.genFormatedClass(cols[0],col1,'c',true);
this.main.pbu.genFormatedClass(cols[1],col2,'c',true);
}
//set class on row
this.main.pbu.genFormatedClass(r,row,'r',true);
}
if(section=='detail'){
    return responseDiv;
}

//inner
/**
 * 
 * @param {HTMLDivElement} col 
 * @param  {...HTMLElement} blocks 
 */
async function setMainElement(col,...blocks){
for(let b of blocks){
/**@type {HTMLElement}*/let el = b.cloneNode(true);
let m = $this.main.pbu.getAttribute(el,'m') ;//name
let bc;
let parent;
let main;
let data = {
type:section,
v:JSON.parse(el.getAttribute('v')),
dClass:[]
};
switch(m){
//blocks
case 'heading':
bc = $this.getHeadingBlock(data);
break;
case 'button':
bc = $this.getButtonBlock(data);
break;
case 'richText':
bc = $this.getRichTextBlock(data);
break;
case 'table':
bc = $this.getTableBlock(data);
break;
case 'list':
bc = $this.getListBlock(data);
break;
case 'image':
bc = $this.getImageBlock(data);
break;
case 'form':
bc = $this.getFormBlock(data);
break;
//components :sp-component
case 'cover':
bc = $this.getCoverComponent(data);
break;
case 'card':
bc = $this.getCardComponent(data);
break;
case 'cta':
bc = $this.getCtaComponent(data);
break;
case 'faq':
bc = $this.getFaqComponent(data);
break;
//widgets :sp-widget
case 'recentPosts':
data.l =el.getAttribute('l');
data.cat = el.getAttribute('cat');//single category
data.we = el.getAttribute('we')=='true';
data.wi = el.getAttribute('wi')=='true';
//
bc = await $this.parent.widget.getRecentPostsWidget(data);
if(n==1){
    let cards = bc.querySelectorAll('.sp-card');
    for(let card of cards){
        $this.main.pbu.addClass(card,['col-md-4']);
    }
}
    break;  
default:
    console.error('in Pagebuilder.setMainElement()');
continue;
}
main = bc.querySelector('[m]');
parent = main.parentElement;
$this.main.pbu.genFormatedClass(el,main,'m',true);

let block;
if(isEdit){
block = bc;
$this.main.pbu.appendChild(col,block);
}else{
block = parent;
$this.main.pbu.replaceClass(block,'col-11','col-12');
$this.main.pbu.appendChild(col,block);
}
}//for
if(isEdit){
col.prepend($this.getBlockSettings({wrapper:col,type:'c'}));
col.appendChild($this.getBlockMenu());
}

}//inner()
}//func

//######### INITIAL ##########
save(){
let result = {
    r:[]
};
let rows = this.pageBuilder.querySelectorAll('div[n]');//rows
for(let row of rows){
let r = {
n:this.main.pbu.getAttribute(row,'n'),
c:[]
};
this.genFormatedClass(row,r,'r',true);
result.r.push(r);

let cols = row.querySelectorAll('[c]');
for(let col of cols){
let c = {
    m:[]
};
this.genFormatedClass(col,c,'c',true);
r.c.push(c);
let els = col.querySelectorAll('[m]');
for(let el of els){
let name = this.main.pbu.getAttribute(el,'m');
let m = {
m:name,
ec:'',
pc:'',
v:null
};
this.genFormatedClass(el,m,'m',true);
c.m.push(m);
let headingtext;
let button;
let bodytext;
let image;
let input;
let variant;

switch(name){
case 'heading':
m.v ={
text:el.textContent,
h:el.nodeName.toLowerCase() 
};
break;
case 'button':
m.v = {
href:el.href,
text:el.textContent
};
break;
case 'richText':
m.v={
text: el.innerHTML  
};
break;
case 'table':
let variant = el.getAttribute('data-variant');
let isWrite = variant=='write';
let trv = [];
let theadInputs = [...el.querySelectorAll('.sp-th input')].map(i=>i.value);
let thv = theadInputs.join(this.main.config.SPLITTER);
trv.push(thv);
let trs = el.querySelectorAll('.sp-tr');
for(let tr of trs){
    let trInputs  = [...tr.querySelectorAll('.sp-td div')].map(i=>i.innerHTML);
    let tdv = trInputs.join(this.main.config.SPLITTER);
    trv.push(tdv);
}
m.v={
variant:variant,
tr:trv.join(this.main.config.SPLITTER2)
};
break;
case 'list':
let inputs = [...el.querySelectorAll('.sp-list div.sp-li')].map(i=>i.innerHTML);
m.v={
variant:el.querySelector('.sp-list-group').nodeName.toLowerCase(),
li:inputs
};
break;
case 'image':
m.v={
src:el.querySelector('.main-image')?.src
};
break;
case 'form':
let titles = [];
let formTitle = el.querySelectorAll('.sp-form-title');
for(let t of formTitle){
let input = t.nextElementSibling;
let required = input.classList.contains('sp-validation-required');
let field = [t.textContent,required,input.type];
titles.push(field.join(this.main.config.SPLITTER));
}
m.v={
title:titles.join(this.main.config.SPLITTER2)
};
break;
// ############## components :sp-component ###############
case 'cover':
headingtext = el.querySelector('.sp-heading').textContent;
bodytext = el.querySelector('.sp-body-text').textContent;
button = el.querySelectorAll('.sp-button');//max = 2
image = el.querySelector('.main-image');
m.v = {
variant : this.main.pbu.getAttribute(el,'data-variant'),
headingText:el.querySelector('.sp-heading').textContent,
bodyText : el.querySelector('.sp-body-text').textContent,
imageSrc:image?.src,
b1Text:button[0].textContent,
b1Href:button[0].href
};
//must have at least one button
if(button.length==2){
m.v.b2Text = button[1].textContent;
m.v.b2Href = button[1].href;
}
break;
case 'card':
image = el.querySelector('.main-image');
let icon = el.querySelector('.main-icon');
button = el.querySelector('.sp-button');//single button for card
m.v = {
headingText:el.querySelector('.sp-heading').textContent,
bodyText : el.querySelector('.sp-body-text').innerHTML,
imageSrc:image?.src,
bText:button?.textContent,
bHref:button?.href,
icon:icon?.getAttribute('icon')
};
break;
case 'cta':
button = el.querySelector('.sp-button');//single button
m.v={
headingText : el.querySelector('.sp-heading').textContent,
bodyText : el.querySelector('.sp-body-text').innerHTML,
bHref:button.href,
bText:button.textContent
};
break;
case 'faq':
let questions = el.querySelectorAll('.sp-faq-question');
let answers = el.querySelectorAll('.sp-faq-answer');
let qa = '';
for(let i=0;i<questions.length;i++){
    qa += `${questions[i].textContent}${this.main.config.SPLITTER}${answers[i].innerHTML}${this.main.config.SPLITTER2}`;
}
m.v={
headingText : el.querySelector('.sp-faq-title').textContent,
qa:qa
};
break;
// ############## widgets :sp-widget ###############
case 'recentPosts':
m.v={
l:this.main.pbu.getAttribute(el,'l'),
cat:this.main.pbu.getAttribute(el,'cat'),
we:this.main.pbu.getAttribute(el,'we'),
wi:this.main.pbu.getAttribute(el,'wi'),
wm:this.main.pbu.getAttribute(el,'wm')
};
break;
default:
    continue;
}//switch
}//for blocks
}//for cols
}//divs
let serial = JSON.stringify(result);
console.log(serial);
//return;
this.parent.submitPost(serial);
}//fu

/**
 * 
 * @param {HTMLElement} el 
 * @param {string[]} add 
 * @param {string[]} remove 
 * * @param {boolean} isEc
 */
addFormatedClass(el,add,remove,isEc=true){
let attribute = (isEc)? 'ec' : 'pc';
let formatedClass = [];
let previousFormatedClass = this.main.pbu.getAttribute(el,attribute);
if(previousFormatedClass){
formatedClass = previousFormatedClass.split(' ');
}
let parent = el.parentElement;
if(isEc){
this.main.pbu.removeClass(el,remove);
this.main.pbu.addClass(el,add);
}else{
  this.main.pbu.removeClass(parent,remove);
  this.main.pbu.addClass(parent,add);
}
for(let r of remove){
  this.main.pbu.pop(r,formatedClass);
}
//
formatedClass.push(...add);
//
el.setAttribute(attribute,formatedClass.join(' '));
}//func

/**
 * 
 * @param {HTMLElement|any} source 
 * @param {HTMLElement|any} recipient 
 * @param {string} type
 * @param {boolean} save 
 */
genFormatedClass(source,recipient,type,save=false){
let isColumn = type=='c';
let bgc,css,sp,ec,pc;
if(save){
bgc = this.main.pbu.getAttribute(source,'bgc');//background clolor
css = this.main.pbu.getAttribute(source,'css');//custom class
sp = this.main.pbu.getAttribute(source,'sp');//space
if(bgc){recipient.bgc =true;}
if(css){recipient.css = css;}
if(sp){recipient.sp = true;}
if(type=='m'){
ec = this.main.pbu.getAttribute(source,'ec');//element formatted class
pc = this.main.pbu.getAttribute(source,'pc');//parent formatted class
if(ec){recipient.ec = ec;}
if(pc){recipient.pc = pc;}
}
}else{
    //not saving
    if(source.bgc){
        recipient.setAttribute('bgc','true');
        this.main.pbu.addClass(recipient,['sp-bg-color']);
    }
    if(source.css){
        recipient.setAttribute('css',source.css);
        this.main.pbu.addClass(recipient,source.css.split(' '));
    }
    if(source.sp){
        recipient.setAttribute('sp','true');
        let hr = this.main.pbu.createHr();
      if(isColumn){
        recipient.appendChild(hr);
      }else{
        recipient.after(hr);
      }
    }
    //
    if(type=='m'){
if(source.ec){
    recipient.setAttribute('ec',source.ec);
    this.main.pbu.addClass(recipient,source.ec.split(' '));
}
if(source.pc){
recipient.setAttribute('pc',source.pc);
this.main.pbu.addClass(recipient.parentElement,source.pc.split(' '));
}
}
}
}//func

save2(){
let result = this.main.pbu.createElement('e');//storage container
let divs = this.pageBuilder.querySelectorAll('div[d]');//
for(let div of divs){
let d = this.main.pbu.createElement('d');
result.append(d);
//
let row = div.querySelector('div[n]');
let n = this.main.pbu.getAttribute(row,'n');
let r = this.main.pbu.createElement('r');
this.main.pbu.genFormatedClass(row,r,'r',false);
d.appendChild(r);
r.setAttribute('n',n);//number of columns 
let cols = row.querySelectorAll('[c]');
for(let col of cols){
let c = this.main.pbu.createElement('c');
r.appendChild(c);
this.main.pbu.genFormatedClass(col,c,'c',false);
let els = col.querySelectorAll('[m]');
for(let el of els){
let name = this.main.pbu.getAttribute(el,'m');//mainElement name
let m = this.main.pbu.createElement('m');
this.main.pbu.genFormatedClass(el,m,'m',false);
c.appendChild(m);
 m.setAttribute('m',name);
//cant use camel case on attributes
let headingtext;
let button;
let bodytext;
/**@type {HTMLImageElement}*/let image;
let imagesrc;
let input;
let data;
let variant;
let v;

switch(name){
case 'heading':
v={
text:el.textContent,
h:el.nodeName   
};
break;
case 'button':
button = el.querySelector('.sp-button');
v = {
href:button.href,
text:button.textContent
};
break;
case 'richText':
v={
text: el.innerHTML  
};
break;
case 'table':
let trv = [];
let theadInputs = [...el.querySelectorAll('.sp-th input')].map(i=>i.value);
let thv = theadInputs.join(this.main.config.SPLITTER);
trv.push(thv);
let trs = el.querySelectorAll('.sp-tr');
for(let tr of trs){
    let trInputs = [...tr.querySelectorAll('.sp-td input')].map(i=>i.value);
    let tdv = trInputs.join(this.main.config.SPLITTER);
    trv.push(tdv);
}
v={
variant:el.getAttribute('data-variant'),
tr:trv.join(this.main.config.SPLITTER2)
};
break;
case 'list':
let inputs = [...el.querySelectorAll('.sp-list input')].map(i=>i.value);
v={
variant:el.nodeName,
li:inputs.join(this.main.config.SPLITTER)
};
break;
case 'image':
v={
src:el.querySelector('.main-image')?.src
};
break;
case 'form':
let titles = [];
let formTitle = el.querySelectorAll('.sp-form-title');
for(let t of formTitle){
let input = t.nextElementSibling;
let required = input.classList.contains('sp-validation-required');
let field = [t.textContent,required,input.type];
titles.push(field.join(this.main.config.SPLITTER));
}
v={
title:titles.join(this.main.config.SPLITTER2)
};
break;
// ############## components :sp-component ###############
case 'cover':
headingtext = el.querySelector('.sp-heading').textContent;
bodytext = el.querySelector('.sp-body-text').textContent;
button = el.querySelectorAll('.sp-button');//max = 2
image = el.querySelector('.main-image');
variant = this.main.pbu.getAttribute(el,'data-variant');//type
v = {
variant : this.main.pbu.getAttribute(el,'data-variant'),
headingText:el.querySelector('.sp-heading').textContent,
bodyText : el.querySelector('.sp-body-text').textContent,
imageSrc:image?.src,
b1Text:button[0].textContent,
b1Href:button[0].href
};
//must have at least one button
if(button.length==2){
v.b2Text = button[1].textContent;
v.b2Href = button[1].href;
}
break;
case 'card':
image = el.querySelector('.main-image');
let icon = el.querySelector('.main-icon');
button = el.querySelector('.sp-button');//single button for card
v = {
headingText:el.querySelector('.sp-heading').textContent,
bodyText : el.querySelector('.sp-body-text').innerHTML,
imageSrc:image?.src,
bText:button?.textContent,
bHref:button?.href,
icon:icon?.getAttribute('icon')
};
break;
case 'cta':
button = el.querySelector('.sp-button');//single button
v={
headingText : el.querySelector('.sp-heading').textContent,
bodyText : el.querySelector('.sp-body-text').innerHTML,
bHref:button.href,
bText:button.textContent
};
break;
case 'faq':
let questions = el.querySelectorAll('.sp-faq-question');
let answers = el.querySelectorAll('.sp-faq-answer');
let qa = '';
for(let i=0;i<questions.length;i++){
    qa += `${questions[i].textContent}${this.main.config.SPLITTER}${answers[i].innerHTML}${this.main.config.SPLITTER2}`;
}
v={
headingText : el.querySelector('.sp-faq-title').textContent,
qa:qa
};
break;
// ############## widgets :sp-widget ###############
case 'recentPosts':
m.setAttribute('l',this.main.pbu.getAttribute(el,'l'));
m.setAttribute('cat',this.main.pbu.getAttribute(el,'cat'));
m.setAttribute('we',this.main.pbu.getAttribute(el,'we'));
m.setAttribute('wi',this.main.pbu.getAttribute(el,'wi'));
m.setAttribute('wm',this.main.pbu.getAttribute(el,'wm'));
break;
case 'categoryPosts':
m.setAttribute('cat',this.main.pbu.getAttribute(el,'cat'));
break;
default:
    continue;
}//switch
m.setAttribute('v',JSON.stringify(v));
}//for blocks
}//for cols
}//divs
let serial = result.outerHTML;
console.log(serial);
this.parent.submitPost(serial);
}//func
/**
 * 
 * @param {number} n 
 * @param {boolean} withMenu
 * @returns {HTMLElement}
 */
createColumn(n,withMenu=true){
let col1,col2,col3,col4;
let container = this.main.pbu.createElement('div',['container','sp-container',this.blockMargin]);
container.setAttribute('d','d');//just for ref
let row = this.main.pbu.createElement('div',['row','sp-row','g-2']);
row.setAttribute('n',n);
container.appendChild(row);//    
if(n==1){
col1 = this.main.pbu.createElement('div',['col-12','sp-col']);
row.appendChild(col1);//
}else if(n==2){
col1 = this.main.pbu.createElement('div',['col-md-6','sp-col']);
col2 = this.main.pbu.createElement('div',['col-md-6','sp-col']);
this.main.pbu.appendChild(row,col1,col2);
}
else if(n==3){
col1 = this.main.pbu.createElement('div',['col-md-4','sp-col']);
col2 = this.main.pbu.createElement('div',['col-md-4','sp-col']);
col3 = this.main.pbu.createElement('div',['col-md-4','sp-col']);
this.main.pbu.appendChild(row,col1,col2,col3);
}else if(n==4){
col1 = this.main.pbu.createElement('div',['col-md-3','sp-col']);
col2 = this.main.pbu.createElement('div',['col-md-3','sp-col']);
col3 = this.main.pbu.createElement('div',['col-md-3','sp-col']);
col4 = this.main.pbu.createElement('div',['col-md-3','sp-col']);
this.main.pbu.appendChild(row,col1,col2,col3,col4);
}else if(n==5){
col1 = this.main.pbu.createElement('div',['col-md-4','sp-col']);
col2 = this.main.pbu.createElement('div',['col-md-8','sp-col']);
this.main.pbu.appendChild(row,col1,col2);
}
else if(n==6){
col1 = this.main.pbu.createElement('div',['col-md-8','sp-col']);
col2 = this.main.pbu.createElement('div',['col-md-4','sp-col']);
this.main.pbu.appendChild(row,col1,col2);
}
col1?.setAttribute('c','c');
col2?.setAttribute('c','c');
col3?.setAttribute('c','c');
col4?.setAttribute('c','c');
if(withMenu){

//append the blockMenu to enable block section
col1?.append(this.getBlockSettings({wrapper:col1,type:'c'}),this.getBlockMenu());
col2?.append(this.getBlockSettings({wrapper:col2,type:'c'}),this.getBlockMenu());
col3?.append(this.getBlockSettings({wrapper:col3,type:'c'}),this.getBlockMenu());
col4?.append(this.getBlockSettings({wrapper:col4,type:'c'}),this.getBlockMenu());
}
return container;

}//func
/**
 * 
 * @param {boolean} withMenu 
 * @returns 
 */
addRow(withMenu=true){
let wrapper = this.main.pbu.createElement('div',['row','sp-wrapper','position-relative',this.blockMargin]);
//for element to create
let blockContainer = this.main.pbu.createElement('div',['col-11','sp-block-container','border','border-primary-subtle']);//??
//blockContainer.contentEditable = 'plaintext-only';//??
wrapper.appendChild(blockContainer);
if(withMenu){
//init is application start
//to hold initial col seclection
//let colums = this.main.pbu.createElement('div',['row','sp-button-group-placeholder']);
let colums = this.main.pbu.createElement('div',['row']);
let c1 = this.main.pbu.createElement('div',['col','d-flex','justify-content-center']);
c1.appendChild(this.main.pbu.createElement('div',['w-100','h-75','align-self-center','border']));

let c2 = this.main.pbu.createElement('div',['col','d-flex','justify-content-center']);
this.main.pbu.appendChild(c2,this.main.pbu.createElement('div',['w-50','h-75','align-self-center','border']));
this.main.pbu.appendChild(c2,this.main.pbu.createElement('div',['w-50','h-75','border']));

let c3 = this.main.pbu.createElement('div',['col']);
this.main.pbu.appendChild(c3,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c3,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c3,this.main.pbu.createElement('i',['bi','bi-square']));

let c4 = this.main.pbu.createElement('div',['col']);
this.main.pbu.appendChild(c4,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c4,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c4,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c4,this.main.pbu.createElement('i',['bi','bi-square']));



let c5 = this.main.pbu.createElement('div',['col']);
this.main.pbu.appendChild(c5,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c5,this.main.pbu.createElement('i',['bi','bi-square']));

let c6 = this.main.pbu.createElement('div',['col']);
this.main.pbu.appendChild(c6,this.main.pbu.createElement('i',['bi','bi-square']));
this.main.pbu.appendChild(c6,this.main.pbu.createElement('i',['bi','bi-square']));

// this.main.pbu.appendChild(b1,this.main.pbu.createText("+ 100%"));
// this.main.pbu.appendChild(b2,this.main.pbu.createText("++ 50 50"));
// this.main.pbu.appendChild(b3,this.main.pbu.createText("+++ 4/4/4"));
// this.main.pbu.appendChild(b4,this.main.pbu.createText("++ 4/8"));
// this.main.pbu.appendChild(b5,this.main.pbu.createText("++ 8/4"));

this.main.pbu.appendChild(colums,c1,c2,c3,c4,c5,c6);
blockContainer.appendChild(colums);

this.main.pbu.listen(c1,'click',()=>{
blockContainer.replaceChild(this.createColumn(1),colums);
});

this.main.pbu.listen(c2,'click',()=>{
blockContainer.replaceChild(this.createColumn(2),colums);
});

this.main.pbu.listen(c3,'click',()=>{
blockContainer.replaceChild(this.createColumn(3),colums);
});

this.main.pbu.listen(c4,'click',()=>{
blockContainer.replaceChild(this.createColumn(4),colums);
});

this.main.pbu.listen(c5,'click',()=>{
blockContainer.replaceChild(this.createColumn(5),colums);
});

this.main.pbu.listen(c6,'click',()=>{
blockContainer.replaceChild(this.createColumn(6),colums);
});
}
//######### section to delete and move block #########
const handle = this.main.pbu.createElement('div',['col-1','sp-block-container-handle']);
let blockSettings = this.getBlockSettings({type:'r',wrapper:wrapper});
handle.appendChild(blockSettings);
// handle.innerHTML = 
// `
// <div class="btn-group-vertical">
// <button name="bgColor" type="button" class="btn"><i class="bi bi-paint-bucket"></i></button>
// <button name="clasz" type="button" class="btn"><i class="bi bi-css"></i></button>
// <button name="remove" type="button" class="btn"><i class="bi bi-x-square"></i></button>
// <button name="moveUp" type="button" class="btn"><i class="bi bi-arrow-up-square"></i></button>
// <button name="moveDown" type="button" class="btn"><i class="bi bi-arrow-down-square"></i></button>
// <button name="spacer" type="button" class="btn"><i class="bi bi-distribute-vertical"></i></button>
// </div>
// `;

//append to wrapper
this.main.pbu.appendChild(wrapper,blockContainer,handle);
//############
this.main.pbu.appendChild(this.pageBuilder,wrapper);
if(!withMenu){
return wrapper;
}

}//func

/**
 * 
 * @param {any} data 
 */
getBlockSettings(data){
//data.wrapper : deleted
//container : class added
let isColumn = data.type=='c';
let isEl = data.type=='m';
let div = this.main.pbu.createElement('div');
div.innerHTML = 
`
<div class="${this.main.pbu.addClassIf(data.type=='r',['btn-group-vertical'])}">
    <button name="bgColor" type="button" class="btn"><i class="bi bi-paint-bucket"></i></button>
    <button name="clasz" type="button" class="btn ${this.main.pbu.addClassIf(isEl,['d-none'])}"><i class="bi bi-css"></i></button>
    <button name="remove" type="button" class="btn"><i class="bi bi-x-square"></i></button>
    <button name="moveUp" type="button" class="btn ${this.main.pbu.addClassIf(isColumn,['d-none'])}"><i class="bi bi-arrow-up-square"></i></button>
    <button name="moveDown" type="button" class="btn ${this.main.pbu.addClassIf(isColumn,['d-none'])}"><i class="bi bi-arrow-down-square"></i></button>
    <button name="spacer" type="button" class="btn"><i class="bi bi-distribute-vertical"></i></button>
</div>
`;
let names = div.querySelectorAll('[name]');
for(let n of names){
    this.main.pbu.listen(n,'click',()=>{
        let container;//if column container = el
        let wrapper = data.wrapper;//if column wrapper = bc;
        if(data.type=='r'){
            container = wrapper.querySelector('[n]');
        }else if(data.type=='c'){
            container = wrapper;
        }else if(data.type=='m'){
            container = wrapper.querySelector('[m]');
        }
        //let container = (data.type=='row')?wrapper.querySelector('[n]') :wrapper.querySelector('[m]');
        let name = this.main.pbu.getAttribute(n,"name");
        switch(name){
            case "bgColor":
            let bgc = 'sp-bg-color';
            if(container.classList.contains(bgc)){
            container.classList.remove(bgc);
            container.removeAttribute('bgc');
            }else{
            //we want to add bg color
            container.classList.add(bgc);
            container.setAttribute('bgc','bgc');
            }
                break;
                case "clasz":
                    let css = this.main.pbu.getAttribute(container,'css');
                    let form =  this.main.pbu.createElement('form');
                    form.innerHTML = 
                    `
                    <div class="sp-form-control">
                    <input type="text" value="${css}" class="form-control sp-css my-2" placeholder="Custom class"/>
                    </div>
                    `
                    let cssControl = form.querySelector('.sp-css');
                    let modal =  this.main.utils.setModal("Add custom class \nSeparate by space or comma",form);
                    this.main.pbu.listen(modal.confirm,'click',()=>{
                    let value = cssControl.value;//string
                    //validate();
                    this.main.pbu.removeClass(container,css?.split(' '));
                    if(value){
                    if(!this.main.vu.validate(cssControl)){return;}
                    css = value.trim().replaceAll(',',' ');
                        //they entered new values or updating
                    this.main.pbu.addClass(container,css.split(' '));
                    //array
                    }else{
                    //nothing supplied, probably removing current classes
                    css = '';
                    }
                    //always
                    container.setAttribute('css',css);
                    modal.dismiss.click();
                    });
                    break;
                    case "remove":
                        if(isColumn){
                            let bcs = container.querySelectorAll('.sp-bc');
                            for(let bc of bcs){
                                bc.remove();
                            }
                        }else{
                            wrapper.remove();
                        }
                        
                        break;
                    case "moveUp":
                        if(isColumn){

                        }else{
                            this.moveBlock(wrapper,'up');
                        }
                        
                        break;
                    case "moveDown":
                        if(isColumn){

                        }else{
                            this.moveBlock(wrapper,'down');
                        }
                        
                        break;
                    case "spacer":
                            let sp = this.main.pbu.getAttribute(container,'sp');
                            let hr = null;
                            if(sp){
                                //remove space
                                if(isColumn){
                                    hr = container.lastElementChild;
                                }else{
                                    hr = container.nextElementSibling;
                                }
                                
                                hr.remove();
                                container.removeAttribute('sp');
                            }else{
                                //add space
                                container.setAttribute('sp','sp');//just for ref
                                hr = this.main.pbu.createHr();
                                if(isColumn){
                                    container.appendChild(hr);
                                }else{
                                    container.after(hr);
                                }
                                
                            }
                        
        }

    });
}//for
return div;
}//
getBlockMenu(){
//called within each column of the initially added row
let dropDown = this.main.pbu.createElement('div',['dropdown','sp-dropdown']);
dropDown.innerHTML = 
`
  <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Add</button>
  <ul class="dropdown-menu">
    <li><button action="getButtonBlock" block-type="block" class="dropdown-item" type="button">Button</button></li>
    <li><button action="getHeadingBlock" block-type="block" class="dropdown-item" type="button">Heading</button></li>
    <li><button action="getRichTextBlock" block-type="block" class="dropdown-item" type="button">Rich Text</button></li>
    <li><button action="getTableBlock" block-type="block" class="dropdown-item" type="button">Table</button></li>
    <li><button action="getListBlock" block-type="block" class="dropdown-item" type="button">List</button></li>
    <li><button action="getImageBlock" block-type="block" class="dropdown-item" type="button">Image</button></li>
    <li><button action="getFormBlock" block-type="block" class="dropdown-item" type="button">Form</button></li>
    <li><button action="getAudioBlock" block-type="block" class="dropdown-item" type="button">Audio</button></li>
    <li><button action="getVideoBlock" block-type="block" class="dropdown-item" type="button">Video</button></li>
	 <li><hr class="dropdown-divider"></li>
    <li><button action="getCoverComponent" block-type="component" data-variant="1" class="dropdown-item" type="button">Cover 1</button></li>
    <li><button action="getCoverComponent" block-type="component" data-variant="2" class="dropdown-item" type="button">Cover 2</button></li>
    <li><button action="getCardComponent" block-type="component" class="dropdown-item" type="button">Card</button></li>
    <li><button action="getCtaComponent" block-type="component" class="dropdown-item" type="button">Call To Action</button></li>
    <li><button action="getFaqComponent" block-type="component" class="dropdown-item" type="button">FAQ</button></li>
    <li><hr class="dropdown-divider"></li>
     <li><button action="getRecentPostsWidget" block-type="widget" class="dropdown-item" type="button">Recent Posts</button></li>
  </ul>
`;
let dropdownItems = dropDown.querySelectorAll('.dropdown-item');
for(let di of dropdownItems){
this.main.pbu.listen(di,'click',async ()=>{
    let action = this.main.pbu.getAttribute(di,'action');
    let blockType = this.main.pbu.getAttribute(di,'block-type');
    let block;
    if(blockType=='widget'){
        block = await this.parent.widget[action]();
    }else{
        //check it its cover as there are types
        let variant = this.main.pbu.getAttribute(di,'data-variant');
        if(variant){
            block = this[action]({type:'new',v:{variant:variant},dClass:[]});
        }else{
            block = this[action]();
        }
        
    }
    dropDown.before(block);
});//#listen
}
return dropDown;
}//func

/**
 * 
 * @param {any} data
 * @returns 
 */
getBlockContainer(data ={name:'',main:'div',clasz:[]}){
let blockContainer = this.main.pbu.createElement('div',['sp-bc',this.blockMargin,'container-fluid']);
let row =
`
<div class="row position-relative">
<div class="col-1" contenteditable="false" width = "1px">
    <div class="position-absolute block-settings" style="top: 0px;left: 5px;">
    <button name="${data.name}" type="button" class="btn sp-cm"><i name="${data.name}" class="bi bi-three-dots-vertical"></i></button>
    </div>
</div>
    <div p="${data.name}-parent" class="col-11">
    <${data.main} class="mb-2 p-2" m="${data.name}"></${data.main}>
    </div>
  </div>
`;
this.main.pbu.appendChild(blockContainer,row);
let blockSettingsDiv = blockContainer.querySelector('.block-settings');
let cm = blockContainer.querySelector('.sp-cm');
let parent = blockContainer.querySelector('[p]');
let mainElement = blockContainer.querySelector('[m]');
this.main.pbu.addClass(mainElement,[...data.clasz]);

///########## GENERAL SETTINGS ###########
let cmSettings = this.main.pbu.createElement('div');
cmSettings.innerHTML =
`
<div id="cmSettings" class="my-2">

  <section class="general-settings my-1">
<p>General Setting</p>
  </section>

  <section class="css">
  <p>Css</p>
  <div class="sp-form-control css">
    <input type="text" class="css form-control sp-validation-required  my-2" placeholder="Custom class"/>
    </div>
  </section>


<section class="other-settings"><section>
<div>
`;
let generalSettings = cmSettings.querySelector('section.general-settings');
let otherSettings = cmSettings.querySelector('section.other-settings');
let cssControl = cmSettings.querySelector('input.css');
this.main.pbu.replace(generalSettings,this.getBlockSettings({wrapper:blockContainer,type:'m'}));
let cMenu = {
otherSettings:otherSettings
};
///########### SIZE SETTINGS ################
//if(data.sizeData){
if(data.withSize){
let sizeClasz = ['fs-6','fs-4','fs-1'];
if(data.name=='button'){
    sizeClasz = ['btn-sm','btn-md','btn-lg'];
}
let sizeSettings = this.main.pbu.createElement('div',['my-2']);
sizeSettings.innerHTML = 
`
<p>Size</p>
<div class="sp-size btn-group m-2" role="group">
  <button type="button" data-size="small" class="btn sp-small">Small</button>
  <button type="button" data-size="medium" class="btn sp-medium">Medium</button>
  <button type="button" data-size="large" class="btn sp-large">Large</button>
</div>
`;
generalSettings.appendChild(sizeSettings);
let buttons = sizeSettings.querySelectorAll('button');
for(let b of buttons){
    this.main.pbu.listen(b,'click',()=>{
        //button is created using pbu.createButton(); different from others
        //let el = (data.name=='button')? this.cmCurrentElement.querySelector('a.sp-button'):this.cmCurrentElement;
        // let el = (data.name=='button')? mainElement.querySelector('a.sp-button'):mainElement;
        let size = b.getAttribute('data-size');
        switch(size){
            case 'small':this.addFormatedClass(mainElement,[sizeClasz[0]],[sizeClasz[1],sizeClasz[2]],true);
                break;
            case 'medium':this.addFormatedClass(mainElement,[sizeClasz[1]],[sizeClasz[0],sizeClasz[2]],true);
                break;
            case 'large': this.addFormatedClass(mainElement,[sizeClasz[2]],[sizeClasz[0],sizeClasz[1]],true);
                break;
        }
    });
}

}//data.withSize
//########### ALIGN SETTINGS ###########
if(data.withAlign){
let alignClasz = ['text-start','text-center','text-end'];
//let alignClasz = ['justify-content-start','justify-content-center','justify-content-end'];
let alignSettings = this.main.pbu.createElement('div',['my-2']);
alignSettings.innerHTML =
`
<p>Align</p>
<div class="sp-align btn-group m-2" role="group">
  <button data-align="left" type="button" class="btn sp-left">Left</button>
  <button data-align="center" type="button" class="btn sp-center">Center</button>
  <button data-align="right" type="button" class="btn sp-right">Right</button>
</div>
`;
generalSettings.appendChild(alignSettings);
let buttons = alignSettings.querySelectorAll('button');
for(let b of buttons){
    this.main.pbu.listen(b,'click',()=>{
        //let el = (data.name=='button')? this.cmCurrentElement.querySelector('.sp-button'):this.cmCurrentElement;
        let el = (data.name=='button')? mainElement.querySelector('a.sp-button'):mainElement;
        let align = b.getAttribute('data-align');
        switch(align){
            case 'left':this.addFormatedClass(mainElement,[alignClasz[0]],[alignClasz[1],alignClasz[2]],false);
                break;
            case 'center':this.addFormatedClass(mainElement,[alignClasz[1]],[alignClasz[0],alignClasz[2]],false);
                break;
            case 'right': this.addFormatedClass(mainElement,[alignClasz[2]],[alignClasz[1],alignClasz[0]],false);
                break;
        }
    });
}

}
//events
this.main.pbu.listen(cm,'click',async()=>{
//this.cmCurrentElement = mainElement;
let template = await data.cmCallback(false);
if(template){
    this.main.pbu.replace(otherSettings,template);
}
let ec = this.main.pbu.getAttribute(mainElement,'ec');
cssControl.value = ec;
let modal = this.main.utils.setModal(`${data.name} settings`,cmSettings);
this.main.pbu.listen(modal.confirm,'click',async ()=>{
   let saved = await data.cmCallback(true);
   if(saved){
    //check if class is to be applied
    let css = cssControl.value;
    if(css){
        if(!this.main.vu.validate(cssControl)){return;}
        css = css.trim().replaceAll(',',' ');
        this.main.pbu.addClass(mainElement,css.split(' '));
        mainElement.setAttribute('ec',css);
    }else{
        //ec probably removed
        if(ec){
            this.main.pbu.removeClass(mainElement,ec.split(' '));
            mainElement.removeAttribute('ec');
        }
    }
    modal.dismiss.click();
   }
    
});
});

//
if(this.isView){
   mainElement.contentEditable = false;
}
return {bc:blockContainer,el:mainElement,parent:parent,cMenu:cMenu};
}//func


//########### BASIC BLOCKS ##########
/**
 * 
 * @param {any} data 
 * @param {string[]} dClass 
 * @returns {HTMLElement}
 */
getAudioBlock(data={standAlone:true,withCm:true,type:'new',src:''},dClass=[]){
let $this = this;
/**@type {HTMLElement}*/ let bc;
/**@type {HTMLElement}*/let el;
/**@type {HTMLElement}*/let parent;
let elClass = [...this.elClass.audio,...dClass];
/**@type {any}*/let audioTemplate;
/**@type {HTMLElement}*/let audio;
//standAlone,main,text,clasz,attr
let r = this.getBlockContainer(data.withCm,'div',elClass,'audio');
bc = r.bc;
el=r.el;
parent = r.parent;
//
audioTemplate = this.main.mh.getAudioTemplate(data.src);
audio = audioTemplate.audio;
if(this.isView){
    audioTemplate.div.removeChild(audioTemplate.div.querySelector('.placeholder-section'));
}
this.main.pbu.appendChild(el,audioTemplate.div);

if(data.withCm && !this.isView){
attachEvents();
}
//finally
return bc;

async function attachEvents(){
$this.audioCm = [];
 
}//inner()

}//func
/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getImageBlock(data={type:'new',v:{src:''},dClass:[]}){
let $this = this;
let elClass = [...this.elClass.image,...data.dClass];
let r = this.getBlockContainer({name:'image',main:'div',clasz:elClass,cmCallback:attachEvents});
let imageTemplate = this.main.mh.getImageTemplate({src:data.v.src,isView:this.isView});

if(this.isView){
if(data.v.src){
    r.el.appendChild(imageTemplate);
}
}else{
r.el.appendChild(imageTemplate.div);
imageTemplate.insertIcon.remove();
imageTemplate.insertButton.remove();
attachEvents(null);
}
//finally
return r.bc;
/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==true){
    return true;
}

}//inner()

}//func
/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getRichTextBlock(data={type:'new',v:{text:this.initialText},dClass:[]}){
let $this = this;
let elClass = [...this.elClass.richText,...data.dClass];
let r =this.getBlockContainer({name:'richText',main:'main',clasz:elClass,withAlign:true,cmCallback:attachEvents});
r.el.innerHTML = data.v.text;
if(this.isView){

}else{
r.el.contentEditable = 'true';
this.makeEditable(r.el);
attachEvents(null);
}
//finally
return r.bc;
/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==true){
return true;
}

}//inner

}//func

/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getTableBlock(data={type:'new',v:{variant:'write'},dClass:[]}){
let $this = this;
let isWrite = data.v.variant=='write';
let count = 1;
let elClass = [...this.elClass.table,...data.dClass];
let r =this.getBlockContainer({name:'table',main:'div',clasz:elClass,cmCallback:attachEvents});
r.el.innerHTML = 
`
<div class="table-responsive">
<table class="table table-striped">
<thead class="">
<tr class="sp-delete-column"></tr>
<tr class="sp-thead-row"></tr>
</thead>
  <tbody>
  </tbody>
</table>
</div>

<div class="d-flex sp-handle ${this.main.pbu.showIf(!this.isView)}">
<a class="sp-table-add-row btn btn-sm me-2">+ Add Row</a>
<a class="sp-table-add-column btn btn-sm ${this.main.pbu.showIf(!isWrite)}">+ Add Column</a>
</div>
`;
let theadRow  = r.el.querySelector('thead tr.sp-thead-row');
let theadRemoveColumRow = r.el.querySelector('thead tr.sp-delete-column');
let tbody = r.el.querySelector('tbody');
let addRowButton= r.el.querySelector('.sp-table-add-row');
let addColumnButton = r.el.querySelector('.sp-table-add-column');

if(data.type=='new'){
for(let i=0;i<count;i++){
this.main.pbu.appendChild(theadRow,`<th class="sp-th" scope="col"><input class="form-control"/></th>`);
this.main.pbu.appendChild(theadRemoveColumRow,`<th scope="col"><a id="a${this.main.utils.getRandomInt()}" class="sp-table-remove-column btn btn-sm">X</a></th>`);
addNewRow(null);
}

}else{
let valueArr = data.v.tr.split(this.main.config.SPLITTER2);
let thvArr = valueArr[0].split(this.main.config.SPLITTER);
count = thvArr.length;
for(let i=0;i<count;i++){
if(this.isView){
this.main.pbu.appendChild(theadRow,`<th class="sp-th" scope="col">${thvArr[i]}</th>`);
}else{
this.main.pbu.appendChild(theadRow,`<th class="sp-th" scope="col"><input class="form-control" value="${thvArr[i]}"/></th>`);
this.main.pbu.appendChild(theadRemoveColumRow,`<th scope="col"><a id="a${this.main.utils.getRandomInt()}" class="sp-table-remove-column btn btn-sm">X</a></th>`);
}

}
for(let i=1;i<valueArr.length;i++){
    addNewRow(valueArr[i]);
}
}

if(this.isView){
}else{
r.el.setAttribute('data-variant',data.v.variant);
attachEvents(null);
}
//finally
return r.bc;
//
/**
 * 
 * @param {string|null} t 
 */
async function addNewRow(t){
let tr = $this.main.pbu.createElement('tr',['sp-tr']);
let tds;
if(t){
    tds = t.split($this.main.config.SPLITTER);
}
for(let i=0;i<count;i++){
if(t){
    $this.main.pbu.appendChild(tr,getTd(tds[i]));
}else{
$this.main.pbu.appendChild(tr,getTd(''));
}

}
if(! $this.isView){
$this.main.pbu.appendChild(tr,`<td class="sp-delete"><a type="button" class="sp-delete btn btn-sm btn-danger mx-1">X</a></td>`);
let remove = tr.querySelector('a.sp-delete');
$this.main.pbu.listen(remove,'click',()=>{
    tr.remove();
});
}

tbody.appendChild(tr);
}//inner

function addNewColumn(){
$this.main.pbu.appendChild(theadRow,`<th class="sp-th" scope="col"><input class="form-control"/></th>`);
let buttonId = `a${$this.main.utils.getRandomInt()}`;
$this.main.pbu.appendChild(theadRemoveColumRow,`<th scope="col"><a id="${buttonId}" class="sp-table-remove-column btn btn-sm">X</a></th>`);
let b = theadRemoveColumRow.querySelector(`#${buttonId}`);
$this.main.pbu.listen(b,'click',()=>{
removeColumn(b);
});

let trs = r.el.querySelectorAll('tr.sp-tr');
for(let tr of trs){
    let td = getTd('');
    let remove = tr.querySelector('td.sp-delete');
    remove.before(td);
}
count += 1;
}//inner

/**
 * 
 * @param {string} value 
 * @returns 
 */
function getTd(value=''){
let td = $this.main.pbu.createElement('td',['sp-td']);
td.innerHTML = `<div ${$this.main.pbu.setAttributeIf(!$this.isView,[{n:"contenteditable",v:"plaintext-only"}])}>${value}</div>`;
if(!$this.isView){
    $this.makeEditable(td.querySelector('div'));
}
return td;
}//inner

/**
 * 
 * @param {HTMLElement} b 
 */
function removeColumn(b){
    //firstly
    let ths = theadRow.querySelectorAll('th');
     if(ths.length==1){
        $this.main.utils.notify('Cant remove',1,'s');
        return;
    }
    //get index of target element
    let idx;
    let buttons = r.el.querySelectorAll('a.sp-table-remove-column');
    for(let i=0;i<buttons.length;i++){
        if(b.id==buttons[i].id){
            idx=i;
            break;
        }
    }
    
    ths[idx].remove();//??
   /**@type {NodeList}*/let trs = r.el.querySelectorAll('tr.sp-tr');
   for(let tr of trs){
    let tds = tr.querySelectorAll('td.sp-td');
    tds[idx].remove();
   }
   b.parentElement.remove();
   count -=1;
}//inner
/**
 * 
 * @param {boolean|null} save 
 */
function attachEvents(save){
if(save==null){
$this.main.pbu.listen(addRowButton,'click',()=>{
addNewRow(null);
});
//
$this.main.pbu.listen(addColumnButton,'click',()=>{
addNewColumn();
});

let removeColumnButtons = r.el.querySelectorAll('.sp-table-remove-column');
for(let b of removeColumnButtons){
$this.main.pbu.listen(b,'click',()=>{
removeColumn(b);
});
}
}

if(save==true){
    return true;
}

}//inner

}//func

/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getListBlock(data={type:'new',v:{variant:'ul'},dClass:[]}){
let $this = this;
let isOrdered = data.v.variant=='ol';
let elClass = [...this.elClass.list,...data.dClass];
let r =this.getBlockContainer({name:'list',main:'div',clasz:elClass,cmCallback:attachEvents});
r.el.innerHTML = 
`
<${data.v.variant} class="list-group list-group-flush sp-list-group ${this.main.pbu.addClassIf(isOrdered,['list-group-numbered'])}">
</${data.v.variant}>
<div class="d-flex sp-handle mt-1 ${this.main.pbu.showIf(!this.isView)}">
<a class="sp-list-add-item btn btn-sm me-2">+ Add Item</a>
</div>
`;
let list = r.el.querySelector('.sp-list-group');
let addItemButton = r.el.querySelector('.sp-list-add-item');
if(data.type=='new'){
this.main.pbu.appendChild(list,getLi());
}else{
for(let i of data.v.li){
this.main.pbu.appendChild(list,getLi(i));
}
}

if(this.isView){

}else{
attachEvents(null);
}
//finally
return r.bc;
//

/**
 * 
 * @param boolean*} serialize 
 * @param {string} value 
 * @returns 
 */
function getLi(value=''){
let li = $this.main.pbu.createElement('li',['list-group-item','position-relative','sp-li']);
if($this.isView){
    //li.textContent = value;
    li.innerHTML = `<i class="mx-2 bi bi-check-circle"></i>${value}`;
}else{
    
    li.innerHTML = 
    `
    <div class="d-flex">
    <i class="bi bi-check-circle"></i>
    <div class="sp-li mx-2 bg-secondary" style="width: 95%;max-width: 100%;" ${$this.main.pbu.setAttributeIf(!$this.isView,[{n:"contenteditable",v:"plaintext-only"}])}>${value}</div>
    <button type="button" class="sp-remove btn-sm text-danger ms-4 position-absolute z-10" style="right: -25px;top: 25%;">X</button>
    </div>
    
    `;

if(!$this.isView){
    $this.makeEditable(li.querySelector('div.sp-li'));
    //
    let remove = li.querySelector('.sp-remove');
    $this.main.pbu.listen(remove,'click',()=>{
        if(list.children.length==1){
            $this.main.utils.notify('Cant Remove',1,'s');
            return;
        }
        li.remove();
    });
}

    
}
return li;
}//inner

/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
let settingsTemplate;
if(save==null){
$this.main.pbu.listen(addItemButton,'click',()=>{
$this.main.pbu.appendChild(list,getLi());
});
}else if(save==false){
settingsTemplate = $this.main.pbu.createSelectElement({title:"List Type",value:data.v.variant,items:['ul','ol']});
return settingsTemplate;
}else if(save==true){
let variant = r.cMenu.otherSettings.querySelector('select').value;
if(variant!=data.v.variant){
    let newList = $this.main.pbu.createElement(variant,['list-group','sp-list-group']);
    if(variant=='ol'){
        $this.main.pbu.addClass(newList,['list-group-numbered']);
    }
    let lis = r.el.querySelectorAll('.sp-list-group li');
    for(let li of lis){
        newList.appendChild(li);
    }
    list.remove();
    r.el.prepend(newList);
    list = newList;
    data.v.variant = variant;
}
return true;
}
}//inner

}//func
/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getFormBlock(data={type:'new',v:{},dClass:[]}){
let $this = this;
let elClass = ['sp-contact-form',...this.elClass.form,...data.dClass];
/**@type {HTMLElement}*/let controls;
/**@type {HTMLElement}*/let addField;
let r = this.getBlockContainer({name:'form',main:'form',clasz:elClass,cmCallback:attachEvents});
//section for controls
controls = this.main.pbu.createElement('div',['sp-form-controls']);
this.main.pbu.appendChild(r.el,controls);
//initial field
if(data.type=='new'){
controls.appendChild(this.getFormControl());
}else{
    let titles = data.v.title.split(this.main.config.SPLITTER2);
    for(let t of titles){
        let r = t.split(this.main.config.SPLITTER);
        let title = r[0];
        let required = r[1];
        let type = r[2];
        let formControl = this.getFormControl({type:type,title:title,required:required});
        this.main.pbu.appendChild(controls,formControl);
    }
}

//section for message ie textarea
let div2 = 
`
<div class="${this.blockMargin}">
<label for="sp-form-message">Message</label>
<textarea id="sp-form-message" rows="3" class="form-control sp-form-message sp-validation-required"></textarea>
</div>
<button type="button" class="btn sp-form-submit-button">Submit</button>
<a type="button" class="${this.main.pbu.showIf(!this.isView)} sp-form-add-field btn btn-sm float-end">+ Add Field</a>
`;
this.main.pbu.appendChild(r.el,div2);
//
if(!this.isView){
attachEvents(null);
}
//finally
return r.bc;

/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==null){
addField = r.el.querySelector('a.sp-form-add-field');
$this.main.pbu.listen(addField,'click',()=>{
$this.main.pbu.appendChild(controls,$this.getFormControl());
});
}

if(save==true){
    return true;
}
//
}//inner

}//func
/**
 * @returns {HTMLElement}
 */
getFormControl(data={}){
let $this = this;
let required = data?.required==true ||data?.required=='true';
let type = (data?.type)?data?.type:'text';
let row = this.main.pbu.createElement('div',['row']);
row.innerHTML = 
`
<div class ="col-8">
<div class="${this.blockMargin} sp-form-control">
<label data-type="${type}" ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-form-title form-label">${data.title?data.title:'Title'}</label>
<input type="${type}" class="sp-form-control form-control ${this.main.pbu.addClassIf(required,['sp-validation-required'])}"/>
</div>
</div>
<div class ="d-flex col-4 sp-form-handle ${this.main.pbu.showIf(!this.isView)} position-relative">
<input ${required?'checked':''} type="checkbox" class="form-check-input sp-checkbox mx-1"/>
${this.main.pbu.createSelectElement({serialize:true,value:type,items:['text','number','email','tel','url']})}
<a style="right: 0px;top: 50%;z-index: 101;" type="button" class="sp-form-remove-field btn btn-sm btn-danger position-absolute">X</a>
</div>
`;

if(this.isView){

}else{
attachEvents();
}

return row;
async function attachEvents(){
let control = row.querySelector('input.sp-form-control');
let typeSelector = row.querySelector('select.sp-select');
let requiredValidationInput = row.querySelector('input.sp-checkbox');
let remove = row.querySelector('a.sp-form-remove-field');
//
$this.main.pbu.listen(requiredValidationInput,'click',()=>{
    if(requiredValidationInput.checked){
        $this.main.pbu.addClass(control,['sp-validation-required']);
    }else{
        $this.main.pbu.removeClass(control,['sp-validation-required']);
    }
});
//
$this.main.pbu.listen(typeSelector,'change',()=>{
    control.type = typeSelector.value;
});
//
$this.main.pbu.listen(remove,'click',()=>{
    row.remove();
});
}
}//func
/**
 * 
 * @param {any} data
 * @returns {HTMLElement}
 */
getHeadingBlock(data={type:'new',v:{text:'Heading'},dClass:[]}){
let $this = this;
let elClass = ['sp-h',...this.elClass.heading,...data.dClass];
let r = this.getBlockContainer({name:'heading',main:'h3',clasz:elClass,withSize:true,withAlign:true,cmCallback:attachEvents});
r.el.textContent = data.v.text;
if(this.isView){

}else{
r.el.contentEditable = 'plaintext-only'
attachEvents(null);
}
//finally
return r.bc;
///
/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==true){
    return true;
}
}//inner()

}//func

/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getButtonBlock(data={type:'new',v:{text:'Learn More',href:''},dClass:[]}){
let $this = this;
let elClass = ['sp-btn',...this.elClass.button,...data.dClass];
let titleControl,linkControl;
let r = this.getBlockContainer({name:'button',main:'a',clasz:elClass,withSize:true,withAlign:true,cmCallback:attachEvents});
r.el.textContent = data.v.text;
r.el.href = data.v.href;
//
if(!this.isView){
attachEvents(null);
}
//finally
return r.bc;
/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
    if(save==false){
    let form = $this.main.pbu.createElement('form',['search-post']);
    form.innerHTML = 
    `
    <p>Link</p>
    <div class="sp-form-control">
    <input type="text" value="${data.v.text}" class="form-control sp-validation-required sp-title my-2" placeholder="Title"/>
    </div>
    <div class="sp-form-control">
    <input type="url" value="${data.v.href}" class="form-control sp-link" placeholder="Link"/>
    </div>
    `
    titleControl = form.querySelector('.sp-title');
    linkControl = form.querySelector('.sp-link');
      //search
    $this.main.pbu.listen(linkControl,'input',()=>{
    $this.main.utils.searchPosts(linkControl,false);
  });//
    return form;
}
    if(save==true){
        //validate title
      if(!$this.main.vu.validate(titleControl,linkControl)){
        return;
      }
      r.el.textContent = data.v.text = titleControl.value;
      //############## link 
      let href = linkControl.getAttribute('data-href');//set if validation passes
      let icon = r.el.querySelector('.bi');
      if(href){
          r.el.href = data.v.href = href;
          if(!icon){
            $this.main.pbu.appendChild(r.el,`<i class="bi bi-link"></i>`);
          }
          
      }else{
        //link removed
        r.el.href = data.v.href = '';
        if(icon){
            icon.remove();
        }
      }
      return true;
    }

      
   
}//inner()

}//func

/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getButtonBlock2(data={type:'new',v:{text:'Learn More',href:''},dClass:[]}){
let $this = this;
let elClass = ['sp-btn',...this.elClass.button,...data.dClass];
let r = this.getBlockContainer({name:'button',main:'div',clasz:elClass,withSize:true,withAlign:true,cmCallback:attachEvents});
let button = this.main.pbu.createButton(data.v.text,data.v.href,[],this.isView);
 r.el.appendChild(button);
//
if(!this.isView){
attachEvents(null);
}
//finally
return r.bc;
/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){

}//inner()

}//func

/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getCoverComponent(data={type:'new',v:{variant:1},dClass:[]}){
let $this = this;
let elClass = ['container-fluid','sp-border',...this.elClass.cover,...data.dClass];
let r = this.getBlockContainer({name:'cover',main:'main',clasz:elClass,cmCallback:attachEvents});
let imageTemplate;
//el.style.height = '80vh';
if(data.v.variant==1){
imageTemplate = this.main.mh.getImageTemplate({src:data.v.imageSrc,width:"72", height:"57",isView:this.isView});
    r.el.innerHTML = 
 `
<div class="text-center sp-cover-image">
    <h1 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-heading display-5 fw-bold text-body-emphasis">${data.v.headingText?data.v.headingText:'Heading'}</h1>
    <div class="col-lg-6 mx-auto">
      <p ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-body-text lead mb-4">${data.v.bodyText?data.v.bodyText:this.initialText}</p>
      <div class="sp-button-section d-grid gap-2 d-sm-flex justify-content-sm-center">
      </div>
    </div>
  </div>
`;
}else if(data.v.variant==2){
imageTemplate = this.main.mh.getImageTemplate({src:data.v.imageSrc,isView:this.isView});
r.el.innerHTML = 
`
<div class="container col-xxl-8 px-4 py-5">
    <div class="row flex-lg-row-reverse align-items-center g-5 py-5">
      <div class="col-10 col-sm-8 col-lg-6 sp-cover-image">

      </div>
      <div class="col-lg-6">
        <h1 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="text-body-emphasis sp-heading display-5 fw-bold lh-1 mb-3">${data.v.headingText?data.v.headingText:'Heading'}</h1>
        <p ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="lead sp-body-text">${data.v.bodyText?data.v.bodyText:this.initialText}</p>
        <div class="sp-button-section d-grid gap-2 d-md-flex justify-content-md-start">
        </div>
      </div>
    </div>
  </div>    
`;
}

//handle
let coverImageDiv = r.el.querySelector('div.sp-cover-image');
let buttonSection = r.el.querySelector('.sp-button-section');
let buttonClass = ['sp-btn','btn-lg','sp-cover-button','px-4','gap-3'];
//
buttonSection.innerHTML = '';
if(data.type=='new'){
buttonSection.appendChild(this.main.pbu.createButton('Learn More','',buttonClass,this.isView));
}else{
//there are a max of 2 buttons
    if(data.v.b1Text){
      buttonSection.appendChild(this.main.pbu.createButton(data.v.b1Text,data.v.b1Href?data.v.b1Href:'',buttonClass,this.isView));  
    }
    if(data.v.b2Text){
      buttonSection.appendChild(this.main.pbu.createButton(data.v.b2Text,data.v.b2Href?data.v.b2Href:'',buttonClass,this.isView));  
    }
}

if(this.isView){
if(data.v.imageSrc){
coverImageDiv.prepend(imageTemplate);
}
}else{
coverImageDiv.prepend(imageTemplate.div);
r.el.setAttribute('data-variant',data.v.variant);
attachEvents(null);
}
//finally
return r.bc;

/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==null){
}


// let bgImage = $this.main.pbu.createElement('button',['btn'],'Background Image');
// let img;
// $this.main.pbu.listen(bgImage,'click',()=>{
// if(!img){
// let imageTemplate = $this.main.utils.getImageTemplate('');
// img = imageTemplate.image;
// imageTemplate.input.click();
// $this.main.pbu.listen(img,'load',()=>{
// $this.main.pbu.addClass(el,['sp-bg']);//??
// el.setAttribute('data-bgimage-src',img.src);
// el.style.backgroundImage = `url(${img.src})`;
// el.style.backgroundSize = 'cover';
// el.style.backgroundPosition ='center';
// el.style.backgroundRepeat = 'no-repeat';
// el.style.height = '100vh';
// });
// }else{
// $this.main.pbu.removeClass(el,['sp-bg']);//??
// el.removeAttribute('data-bgimage-src');
// el.style.removeProperty('background-image');
// img = undefined;
// }
// });
//

if(save==false){
let addButton = $this.main.pbu.createElement('button',['btn'],'Add 2nd button');
$this.main.pbu.listen(addButton,'click',()=>{
if(buttonSection.children.length==1){
buttonSection.appendChild($this.main.pbu.createButton('Learn More','',buttonClass,$this.isView));
addButton.textContent  = 'Remove 2nd button'
}
else if(buttonSection.children.length==2){
buttonSection.removeChild(buttonSection.lastElementChild);
addButton.textContent = 'Add 2nd button';
}
});
return addButton;
}

if(save==true){
    return true;
}
}//

}//func

/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getCardComponent(data={type:'new',v:{imageSrc:''},dClass:[]}){
let $this = this;
let elClass = [...this.elClass.card,...data.dClass];
let r = this.getBlockContainer({name:'card',main:'div',clasz:elClass,cmCallback:attachEvents});
let imageTemplate = this.main.mh.getImageTemplate({src:data.v.imageSrc,isView:this.isView});
r.el.style.width = '18rem';
//
this.main.pbu.appendChild(r.el,
 `
  <div class="card-body sp-card-body">
    <h5 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="card-title sp-heading sp-h">${data.v.headingText?data.v.headingText:'Heading'}</h5>
    <p ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="card-text sp-body-text">${data.v.bodyText?data.v.bodyText:this.initialText}</p>
  </div>
  `
);
///
let cardBody = r.el.querySelector('.sp-card-body');
//card may not have a button, evident when editing
if(data.type=='new'){
cardBody.appendChild(this.main.pbu.createButton('Learn More','',['align-self-center','sp-btn'],this.isView));
}else{
if(data.v.bText){
cardBody.appendChild(this.main.pbu.createButton(data.v.bText,data.v.bHref?data.v.bHref:'',['sp-btn'],this.isView));
}
}
///
if(this.isView){
r.el.prepend(imageTemplate);
}else{
r.el.prepend(imageTemplate.div);
attachEvents(null);
}
//finally
return r.bc;

/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==false){
let removeButton = $this.main.pbu.createElement('button',['btn'],'Remove Button');
$this.main.pbu.listen(removeButton,'click',()=>{
if(cardBody.querySelector('.sp-button')){
cardBody.removeChild(cardBody.lastElementChild);
removeButton.textContent = 'Add Button';
}else{
cardBody.appendChild($this.main.pbu.createButton(data.v.bText,data.v.bHref?data.v.bHref:'',[],$this.isView));
removeButton.textContent = 'Remove Button';
}
});
return removeButton;
}

if(save==true){
    return true;
}
}//inner

function formatView(){
}//inner
}//func
/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getCtaComponent(data={type:'new',v:{},dClass:[]}){
let $this = this;
let elClass = [...this.elClass.cta,...data.dClass];
let r = this.getBlockContainer({name:'cta',main:'main',clasz:elClass,cmCallback:attachEvents});
//
r.el.innerHTML =
 `
 <div class="col-8"><h3 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-heading sp-h fs-4 w-100">${data.v.headingText?data.v.headingText:'Heading'}</h3>
 <p ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-body-text">${data.v.bodyText?data.v.bodyText:this.initialText}</p>
 </div>
  <div class="col-4 d-flex align-items-center justify-content-center"></div>
 `;
//append block to col1
let col2 = r.el.querySelector('.col-4');
//append block to col2
let buttonTemplate = this.main.pbu.createButton(data.v.bText?data.v.bText:'Learn More',data.v.bHref?data.v.bHref:'',['sp-btn'],this.isView);
col2.appendChild(buttonTemplate);
if(this.isView){

}else{

//
attachEvents(null);
}
//finally
return r.bc;
/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==true){
    return true;
}

}//inner
}//func
/**
 * 
 * @param {any} data 
 * @returns {HTMLElement}
 */
getFaqComponent(data={type:'new',v:{},dClass:[]}){
let $this = this;
let elClass = [...this.elClass.faq,...data.dClass];
let r = this.getBlockContainer({name:'faq',main:'main',clasz:elClass,cmCallback:attachEvents});
//
this.main.pbu.appendChild(r.el,
`<h3 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-title">${data.v.headingText?data.v.headingText:'FAQ TITLE'}</h3>
<div class="row q-and-a">
<h5 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-question">- What is Love?</h5>
<p ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-answer">${this.initialText}</p>
</div>
 <div class="sp-footer ${this.main.pbu.showIf(!this.isView)}">
    <a type="button" class="btn sp-faq-button" contenteditable="false">Add FAQ</a>
</div>
`
);
//create question and answer container
let questionAndAnswerSection = r.el.querySelector('.q-and-a');
//let footer = r.el.querySelector('.sp-footer');
let addFaq = r.el.querySelector('.sp-faq-button');
//now append to main
//this.main.pbu.appendChild(r.el,questionAndAnswerSection);
if(data.type=='new'){
}else{
    //
    questionAndAnswerSection.innerHTML = '';
    let qaArray = data.v.qa.split(this.main.config.SPLITTER2);//question and answer
    //last item is an empty string
    qaArray.pop();
    for(let qas of qaArray){
        let qa = qas.split(this.main.config.SPLITTER);
        let question = qa[0];
        let answer = qa[1];
        this.main.pbu.appendChild(questionAndAnswerSection,
  `<h3 ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-question">${question}</h3>
  <p ${this.main.pbu.setAttributeIf(!this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-answer">${answer}</p>
  `
);
    }
}

if(!this.isView){
attachEvents(null);
}
//finally
return r.bc;

/**
 * 
 * @param {boolean|null} save 
 */
async function attachEvents(save){
if(save==null){
$this.main.pbu.listen(addFaq,'click',()=>{
let questionAndAnswer = $this.main.pbu.createElement('div');
$this.main.pbu.addClass(questionAndAnswer,'container');
$this.main.pbu.appendChild(questionAndAnswerSection,
    `
    <div class="row q-and-a">
<h5 ${$this.main.pbu.setAttributeIf(!$this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-question">- What is Love?</h5>
<p ${$this.main.pbu.setAttributeIf(!$this.isView,[{n:"contenteditable",v:"plaintext-only"}])} class="sp-faq-answer">${$this.initialText}</p>
</div>
  `
);
});
}
if(save==true){
    return true;
}
}//inner
}//func



/**
 * 
 * @param {HTMLButtonElement} formatButton 
 * @returns 
 */
formatText(formatButton){
let name = this.main.pbu.getAttribute(formatButton,'name');
let selectedText = this.selectedText;
if(!selectedText){
return;
}
let range = this.selectionRange;
let parentNode = range.commonAncestorContainer;
if (parentNode?.nodeType === Node.TEXT_NODE) {
parentNode = parentNode.parentNode ; // Get the parent element of the text node
}
let parent = parentNode?.parentNode ;
switch(name){
case 'Bold': 
let isBold = parentNode?.nodeName === 'STRONG';
if(isBold){
parent.replaceChild(this.main.pbu.createText(selectedText ),parentNode);
}else{
let strong = this.main.pbu.createElement('strong');
this.main.pbu.appendChild(strong,this.main.pbu.createText(selectedText ));
range?.deleteContents();
range?.insertNode(strong);
}
break;
case 'Italic':
let isItalic = parentNode?.nodeName === 'EM';
if(isItalic){
parent.replaceChild(this.main.pbu.createText(selectedText ),parentNode);
}else{
let em = this.main.pbu.createElement('em');
this.main.pbu.appendChild(em,this.main.pbu.createText(selectedText ));
range?.deleteContents();
range?.insertNode(em);
}
break;
case 'Underline':
let isUnderline = parentNode?.nodeName === 'U';
if(isUnderline){
parent.replaceChild(this.main.pbu.createText(selectedText ),parentNode);
}else{
let u = this.main.pbu.createElement('u');
this.main.pbu.appendChild(u,this.main.pbu.createText(selectedText ));
range?.deleteContents();
range?.insertNode(u);
}
break;
case 'Link':
let isLink = parentNode?.nodeName === 'A';
if(isLink){
let text = parentNode.textContent ;
parent.replaceChild(this.main.pbu.createText(text),parentNode);
}else{
///
let form = this.main.pbu.createElement('form',['my-1']);
    form.innerHTML = 
    `
    <input class="form-control sp-link"/>
    `
    let linkControl = form.querySelector('.sp-link');
    let modal = this.main.utils.setModal('Link',form);
    linkControl.focus();
    this.main.pbu.listen(modal.confirm,'click',()=>{
        //validate
    let href = linkControl.value;
    if(!href){return;}
    let a = this.main.pbu.createElement('a');
    a.href = 'http://'+href;
    a.textContent = selectedText;
    //this.main.pbu.appendChild(a,this.main.pbu.createText(selectedText));
    range?.deleteContents();
    range?.insertNode(a);
    modal.dismiss.click();
    });
}
break;
case 'Strikethrough':
    break;
}

}//func

/**
 * 
 * @param {HTMLElement} el 
 */
async makeEditable(el){
this.main.pbu.listen(el,'mouseout',()=>{
let selection = document.getSelection();
if(selection){
let selectedText = selection.toString();
this.selectedText = selectedText ;
let range = selection.getRangeAt(0);
this.selectionRange = range.cloneRange();
}
});
}//func

// ######### MENU ##########
/**
 * 
 * @param {PointerEvent} evt 
 */

/**
 * 
 * @param {HTMLElement} el 
 * @param {string} direction 
 */
moveBlock(el,direction){
let parent = el.parentElement;
if(direction=='up'){
let previousSibling = el.previousElementSibling;
parent.insertBefore(el,previousSibling);
}else{
//moving down
let nextSibling = el.nextSibling;
parent.insertBefore(nextSibling,el);
}
}//
/**
 * 
 * @param {HTMLElement} bc 
 */
deleteBlock(bc){
let spCol = bc.parentElement;
spCol.removeChild(bc);
}//func

//####### others ######
/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
getMostInnerElement(node){
let currentElement = node;
while (currentElement && currentElement.firstChild) {
currentElement = currentElement.firstChild ;
}
return currentElement;
}//

destroy(){
for(let subscription of this.subscriptions ){
if(subscription){
subscription();
}

}
}//

}//#class
