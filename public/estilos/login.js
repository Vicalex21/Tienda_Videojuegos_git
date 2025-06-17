var attempt=3;
function validate(){
    var usuar=document.getElementById("usuar").value;
    var password=document.getElementById("password").value;
    if(usuar=="Vicho21"&& password=="12345"){
        alert("ingreso exitoso");
        window.location.href = "Menu.html";
        return false;
        
    } if (usuar==""&& password==""){
        alert("ingreso exitoso");
        window.location.href = "Menu.html";
        return false;
    }
    else{
        attempt--;
    }
    alert("Te Quedan "+attempt+" Intentos")
    if(attempt==0){
    document.getElementById("usuar").disable=true;
    document.getElementById("password").disable=true;
    document.getElementById("submit").disable=true;
    }
}