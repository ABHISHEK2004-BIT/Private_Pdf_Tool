let files=[];

// don't assume PDFLib is available instantly; check when the user clicks the
// merge button.  If the library is missing the initial script will throw and
// none of the event listeners would be installed.

document.getElementById("files").addEventListener("change",(e)=>{
    console.log("files input changed", e.target.files);
    files=Array.from(e.target.files);
    showFiles();
});

function showFiles(){

const preview=document.getElementById("preview");

preview.innerHTML="";

files.forEach(file=>{

const div=document.createElement("div");

div.className="fileCard";

div.innerHTML=`

<img src="https://cdn-icons-png.flaticon.com/512/337/337946.png">

<p>${file.name}</p>

<p>${(file.size/1024).toFixed(1)} KB</p>

`;

preview.appendChild(div);

});

}

async function mergePDF(){
    console.log("mergePDF() called", { files });
    if(!window.PDFLib){
        alert("PDF library failed to load. Make sure you are online or have a local copy of pdf-lib.js and that you're serving the page over HTTP.");
        return;
    }
    const { PDFDocument } = PDFLib;

    if(files.length<2){
        alert("Select at least 2 PDFs");
        return;
    }

    const mergedPdf=await PDFDocument.create();

    for(let file of files){
        const buffer=await file.arrayBuffer();
        const pdf=await PDFDocument.load(buffer);
        const pages=await mergedPdf.copyPages(pdf,pdf.getPageIndices());
        pages.forEach(p=>mergedPdf.addPage(p));
    }

    const bytes=await mergedPdf.save();
    download(bytes,"merged.pdf");
}


function download(data,name){

const blob=new Blob([data],{type:"application/pdf"});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download=name;

a.click();

}