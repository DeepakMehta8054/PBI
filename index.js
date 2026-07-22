if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

function logout(){

    if(confirm("Are you sure you want to logout?")){

        localStorage.removeItem("loggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");

        window.location.href = "login.html";
    }

}
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


