let file=null;

// note: don't destructure PDFDocument at load-time because PDFLib may not
// be available when the script executes (e.g. if the CDN is blocked).  The
// functions below grab it on demand and abort with a user-friendly alert
// if the library failed to load.

document.getElementById("file").addEventListener("change",(e)=>{
    console.log("file input changed", e.target.files);
    file=e.target.files[0];
document.getElementById("preview").innerHTML=`

<div class="fileCard">

<img src="https://cdn-icons-png.flaticon.com/512/337/337946.png">

<p>${file.name}</p>

<p>${(file.size/1024).toFixed(1)} KB</p>

</div>

`;

});

async function compressPDF(){
    console.log("compressPDF() called", { file });

    if(!window.PDFLib){
        alert("PDF library failed to load. Make sure you are online or have a local copy of pdf-lib.js and that you're serving the page over HTTP.");
        return;
    }

    const { PDFDocument } = PDFLib;

    if(!file){
        alert("Select PDF");
        return;
    }

    const buffer=await file.arrayBuffer();
    const pdf=await PDFDocument.load(buffer);
    const newPdf=await PDFDocument.create();
    const pages=await newPdf.copyPages(pdf,pdf.getPageIndices());
    pages.forEach(p=>newPdf.addPage(p));
    const bytes=await newPdf.save({useObjectStreams:true});
    const newSize=(bytes.length/1024).toFixed(1);
    document.getElementById("sizeInfo").innerHTML=
        `Before: ${(file.size/1024).toFixed(1)} KB <br>
After: ${newSize} KB`;
    download(bytes,"compressed.pdf");
}


function download(data,name){

const blob=new Blob([data],{type:"application/pdf"});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download=name;

a.click();

}
