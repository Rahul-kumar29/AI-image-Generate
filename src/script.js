const promptForm = document.querySelector('.prompt-form');
const promptInput = document.querySelector('.prompt-input');
const promptButton = document.querySelector('.prompt-btn');
const modelSelect = document.getElementById('model-select');
const countSelect = document.getElementById('count-select');
const ratioSelect = document.getElementById('ratio-select');
const gridGallery = document.querySelector('.gallery-grid');
const API_KEY = "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";

const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushroom",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "A witch's cottage in fall with magic herbs in the garden"
];

const getImageDimension = (aspectRatio, baseSize = 512)=>{
    const[width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width*scaleFactor);
    let calculatedHeight = Math.round(height*scaleFactor);

    calculatedWidth  = Math.floor(calculatedWidth/16) * 16;
    calculatedHeight  = Math.floor(calculatedHeight/16) * 16;

    return {width: calculatedWidth, height:calculatedHeight};
};
//Replace Loading Spinner with actual image 
const updateImageCards = (imgIndex, imgurl)=>{
    const imageCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imageCard) return;

    imageCard.classList.remove("loading");
    imageCard.innerHTML = ` <img src="${imgurl}" alt="test images" class="result-img  object-cover">
                 <div class="img-overlay absolute bottom-0 right-0 left-0 p-6 justify-end flex pointer-events-none opacity-0 transition-all ease-in duration-100 group-hover:opacity-100 group-hover:pointer-events-auto "> 
                   <a href="${imgurl}" class="img-download-btn h-8 w-8 text-white backdrop-blur-md rounded-full border-none cursor-pointer" download = "${Date.now()}.png">
                    <i class="fa-solid fa-download"></i>
                  </a>
                </div>`;
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText)=>{
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    // const MODEL_URL = `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev`;
   const{width, height} =  getImageDimension(aspectRatio);

   const ImagePromise = Array.from({length: imageCount}, async(_, i)=> {
    try{
        const response = await fetch(MODEL_URL, {
            headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
                "x-use-cache": "false",
			},
			method: "POST",
			body: JSON.stringify({
                inputs: promptText,
                parameters: {width, height},
            }),
        });

        if(!response.ok) throw new Error((await response.json())?.error);
        // convert response into to an image url  and update the image card
        const result = await response.blob();
        updateImageCards(i, URL.createObjectURL(result))
    }
    catch(e)
    {
        console.log(e.message)
    }

   })

    await Promise.allSettled(ImagePromise);

}

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) =>{
    gridGallery.innerHTML = "";

    for(let i=0; i<= imageCount; i++){
        gridGallery.innerHTML += `
        <div class="img-card relative overflow-hidden rounded-md border-sky-100 bg-sky-100 h-64
         group hover:translate-y-2" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}"> 
                
              </div>`
        
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
}

const handleFormSubmit = (e)=>{
 e.preventDefault();

 const selectedModel = modelSelect.value;
 const imageCount = parseInt(countSelect.value) || 1;
 const aspectRatio = ratioSelect.value || "1/1";
 const promptText = promptInput.value.trim();

 createImageCards(selectedModel, imageCount, aspectRatio, promptText);
}
promptForm.addEventListener('submit', handleFormSubmit);
promptButton.addEventListener('click', ()=>{
    const prompt =examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});