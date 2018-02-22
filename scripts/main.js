// jshint esversion:6
// setup for the page elements
var urlInput = document.getElementById("inputLink"),
    nameInput = document.getElementById("inputName"),
    button = document.getElementById("addLink"),
    errorSpace = document.getElementById("errorSpace"),
    list = document.getElementById("list"),
    savedLinks = document.getElementById("savedLinks");

urlInput.value = '';
urlInput.focus();

// adding links from the "Add Links" button
function addLinks(e) {
    let list_item = document.createElement("li"),
        list_links = document.createElement("a");
    
    window.localStorage.setItem("links", urlInput.value);
    list_links.setAttribute("href", urlInput.value);
    list_links.textContent = urlInput.value;

    list_item.appendChild(list_links);
    list.appendChild(list_item);
}

button.addEventListener("click", addLinks);