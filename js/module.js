// ====================================
// NAVIGAIT MODULE ENGINE
// ====================================


let currentSection = 0;

let completedSections = [];





window.onload=function(){


document.getElementById("moduleTitle").innerHTML =
module1.title;


document.getElementById("moduleDescription").innerHTML =
module1.description;



loadSavedProgress();


createLessonNavigation();


loadSection(currentSection);


};







// ===============================
// LOAD SAVED DATA
// ===============================


function loadSavedProgress(){


const user =
getUserData();



const module =
user.modules.module1;



currentSection =
module.currentSection || 0;



for(let i=0;i<currentSection;i++){


completedSections.push(i);


}


}









// ===============================
// LOAD SECTION
// ===============================


function loadSection(index){


currentSection=index;


const section =
module1.sections[index];



const container =
document.getElementById(
"lessonContent"
);



container.innerHTML = "";


let html = `

<h2>
${section.title}
</h2>

`;



section.blocks.forEach(block=>{


html += renderBlock(block);


});



html += `

<button 
class="continue-btn"
onclick="completeSection()">

Complete Lesson →

</button>

`;



container.innerHTML =
html;



updateProgress();


}









// ===============================
// COMPLETE SECTION
// ===============================


function completeSection(){



if(
!completedSections.includes(currentSection)
){


completedSections.push(
currentSection
);


}



if(
currentSection <
module1.sections.length-1
){


currentSection++;


}



saveProgress();



createLessonNavigation();



loadSection(currentSection);



}








// ===============================
// SAVE PROGRESS
// ===============================


function saveProgress(){



let progress =
Math.round(

(completedSections.length /
module1.sections.length)
*100

);



updateModuleProgress(

"module1",

progress,

currentSection

);



}







// ===============================
// PROGRESS BAR
// ===============================


function updateProgress(){



let progress =
Math.round(

(completedSections.length /
module1.sections.length)
*100

);



document.getElementById(
"progressText"
).innerHTML =
progress+"%";



document.getElementById(
"progressFill"
).style.width =
progress+"%";



}









// ===============================
// NAVIGATION
// ===============================


function createLessonNavigation(){



const list =
document.getElementById(
"lessonList"
);



list.innerHTML="";



module1.sections.forEach(
(section,index)=>{


let button =
document.createElement(
"button"
);



button.className =
"lesson-item";



let unlocked =
index <= completedSections.length;



button.innerHTML = `

${unlocked ? "✓" : "🔒"}

${section.title}

`;



button.disabled =
!unlocked;



button.onclick=function(){


loadSection(index);


};



list.appendChild(button);



});



}









// ===============================
// BLOCK SYSTEM
// ===============================


function renderBlock(block){



if(block.type==="text"){


return `

<div class="content-block">

<h3>
${block.title}
</h3>

<p>
${block.content}
</p>

</div>

`;

}



if(block.type==="question"){



let html = `

<div class="question-block">

<h3>
${block.question}
</h3>

`;



block.options.forEach(
(option,index)=>{


html += `

<button class="answer-btn"

onclick="
checkAnswer(
${index},
${block.answer},
this
)
">

${option}

</button>

`;



});



html += `

<p class="feedback"></p>

</div>


`;



return html;


}


return "";

}









// ===============================
// QUESTIONS
// ===============================


function checkAnswer(
selected,
correct,
button
){



const feedback =
button.parentElement
.querySelector(
".feedback"
);



if(selected===correct){


feedback.innerHTML =
"✅ Correct!";


feedback.style.color =
"#059669";


}


else{


feedback.innerHTML =
"❌ Try again";


feedback.style.color =
"#dc2626";


}



}
