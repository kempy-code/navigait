// =====================================
// NAVIGAIT DASHBOARD ENGINE
// =====================================


window.onload = function(){


    loadDashboard();


};





function loadDashboard(){


    const user =
    getUserData();



    // NAME

    const name =
    document.getElementById("studentName");


    if(name){

        name.innerHTML =
        user.name;

    }




    // XP

    const xp =
    document.getElementById("xp");


    if(xp){

        xp.innerHTML =
        user.xp;

    }




    // BADGES

    const badges =
    document.getElementById("badges");


    if(badges){

        badges.innerHTML =
        user.badges.length;

    }






    // MODULE PROGRESS


    const module =
    user.modules.module1;



    const progress =
    document.getElementById(
        "moduleProgress"
    );


    if(progress){

        progress.innerHTML =
        module.progress + "%";

    }




    const progressBar =
    document.getElementById(
        "progressFill"
    );


    if(progressBar){

        progressBar.style.width =
        module.progress + "%";

    }






    // CURRENT LESSON


    const lesson =
    document.getElementById(
        "currentLesson"
    );


    if(lesson){


        const section =
        module.currentSection + 1;



        lesson.innerHTML =
        "Section " + section +
        " of 7";


    }





}







function continueLearning(){


    window.location.href =
    "modules/module1.html";


}