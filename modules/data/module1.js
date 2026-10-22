// =====================================
// NAVIGAIT MODULE ENGINE
// MODULE 1
// =====================================



// ================================
// MODULE SETTINGS
// ================================


const moduleName = "module1";


const totalSections = 7;




let user;

let currentSection = 0;






// ================================
// INITIALISE
// ================================


window.addEventListener(

"DOMContentLoaded",

()=>{


    user = getUserData();


    loadProgress();


    setupButtons();


    updateModule();



}

);







// ================================
// LOAD SAVED PROGRESS
// ================================


function loadProgress(){


    const module =

    user.modules[moduleName];



    if(module){


        currentSection =
        module.currentSection || 0;


    }


}







// ================================
// UPDATE PAGE
// ================================


function updateModule(){



    showSection();


    updateProgressBar();


    updateNavigation();


}








// ================================
// SHOW CURRENT SECTION
// ================================


function showSection(){



    document
    .querySelectorAll(
        ".module-section"
    )
    .forEach(section=>{


        section.style.display =
        "none";


    });



    const active =

    document.getElementById(

        `section-${currentSection}`

    );



    if(active){


        active.style.display =
        "block";


    }


}








// ================================
// PROGRESS BAR
// ================================


function updateProgressBar(){



    const progress =

    Math.round(

        (currentSection /

        (totalSections-1))

        *100

    );



    const bar =

    document.getElementById(
        "moduleProgress"
    );



    const text =

    document.getElementById(
        "progressText"
    );



    if(bar){


        bar.style.width =
        progress + "%";


    }



    if(text){


        text.textContent =
        progress + "% Complete";


    }




    updateModuleProgress(

        moduleName,

        progress,

        currentSection

    );


}








// ================================
// BUTTONS
// ================================


function setupButtons(){



    const nextButtons =

    document.querySelectorAll(

        ".next-section"

    );



    nextButtons.forEach(button=>{


        button.addEventListener(

        "click",

        ()=>{


            completeCurrentSection();


        });


    });




}








// ================================
// COMPLETE SECTION
// ================================


function completeCurrentSection(){



    completeLesson(

        moduleName,

        currentSection

    );



    addXP(

        25,

        "Completed module section"

    );




    if(currentSection < totalSections-1){



        currentSection++;



        updateModuleProgress(

            moduleName,

            calculateProgress(),

            currentSection

        );



        updateModule();


    }


    else{


        finishModule();


    }



}








// ================================
// CALCULATE PROGRESS
// ================================


function calculateProgress(){



    return Math.round(

        (currentSection /

        (totalSections-1))

        *100

    );


}







// ================================
// FINISH MODULE
// ================================


function finishModule(){



    updateModuleProgress(

        moduleName,

        100,

        totalSections-1

    );



    unlockBadge(

        "AI Foundations"

    );



    alert(

        "Module Complete! You earned your AI Foundations badge."

    );



}







// ================================
// NAVIGATION
// ================================


function updateNavigation(){



    document

    .querySelectorAll(

        ".module-nav-item"

    )

    .forEach((item,index)=>{



        if(index <= currentSection){


            item.classList.add(
                "unlocked"
            );


        }


        else{


            item.classList.remove(
                "unlocked"
            );


        }



    });


}







// ================================
// QUIZ SUPPORT
// ================================


function answerQuestion(

    correct

){



    if(correct){



        addXP(

            10,

            "Correct quiz answer"

        );



    }


}