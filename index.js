
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
const dropBtn = document.querySelector(".dropbtn");
const dropMenu = document.querySelector(".dropdown-content");

dropBtn.addEventListener("click", function(e){
    e.preventDefault();
    dropMenu.classList.toggle("show");
});

document.addEventListener("click", function(e){
    if(!e.target.closest(".dropdown")){
        dropMenu.classList.remove("show");
    }
});


