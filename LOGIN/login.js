function updateDateTime(){

    const now = new Date();

    const date = now.toLocaleDateString("en-IN",{
        weekday:"long",
        day:"2-digit",
        month:"long",
        year:"numeric"
    });

    const time = now.toLocaleTimeString("en-IN",{
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit",
        hour12:true
    });

    document.getElementById("currentDate").textContent = date;
    document.getElementById("currentTime").textContent = time;
}

updateDateTime();

setInterval(updateDateTime,1000);

/*userpass */
const users = [

    {
        username: "admin",
        password: "Admin@123",
        name: "Administrator"
    },

    {
        username: "deepak",
        password: "Deepak@123",
        name: "Deepak Mehta"
    },

    {
        username: "investigator",
        password: "PBI@2026",
        name: "Investigation Officer"
    }

];

function login(){

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let user = users.find(u =>
        u.username === username &&
        u.password === password
    );

    if(user){

        localStorage.setItem("loggedIn","true");
        localStorage.setItem("userName",user.name);

        window.location.href="index.html";

    }else{

        document.getElementById("message").innerHTML =
        "Invalid Username or Password";

    }

}


//login button scroll down

const username = document.getElementById("username");
const password = document.getElementById("password");


username.addEventListener("keydown", function(event){

    if(event.key === "Enter"){
        event.preventDefault();
        password.focus();
    }

});


password.addEventListener("keydown", function(event){

    if(event.key === "Enter"){
        event.preventDefault();
        login();
    }

});
