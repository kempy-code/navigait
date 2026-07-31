// =====================================
// NAVIGAIT USER DATA
// =====================================


const defaultUser = {

    name:"Joshua",

    xp:0,

    badges:[],

    modules:{

        module1:{

            completed:false,

            progress:0,

            currentSection:0

        }

    }

};





function getUserData(){


    let data =
    localStorage.getItem(
        "navigaitUser"
    );


    if(!data){


        localStorage.setItem(
            "navigaitUser",
            JSON.stringify(defaultUser)
        );


        return defaultUser;

    }



    return JSON.parse(data);


}







function saveUserData(data){


    localStorage.setItem(

        "navigaitUser",

        JSON.stringify(data)

    );


}







function updateModuleProgress(
module,
progress,
section
){


    let user =
    getUserData();



    user.modules[module].progress =
    progress;


    user.modules[module].currentSection =
    section;



    saveUserData(user);


}







function completeModule(module){


    let user =
    getUserData();



    user.modules[module].completed =
    true;



    user.xp += 500;



    user.badges.push(
        "AI Foundations"
    );



    saveUserData(user);


}