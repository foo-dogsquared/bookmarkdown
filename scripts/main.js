// jshint esversion:6
// setup for the page elements
var urlInput = document.getElementById("inputLink"),
    nameInput = document.getElementById("inputName"),
    button = document.getElementById("addLink"),
    errorSpace = document.getElementById("errorSpace"),
    list = document.getElementById("list"),
    savedLinks = document.getElementById("savedLinks");

urlInput.value = '';
nameInput.value = '';
urlInput.focus();


// list of links that the user saved
var links = [];

// adding links from the "Add Links" button
function addLinks(e) {
    let list_item = document.createElement("li"),
        list_links = document.createElement("a"),
        list_closeBtn = document.createElement("p");
    
    window.localStorage.setItem("links", urlInput.value);

    list_links.setAttribute("href", urlInput.value);
    (nameInput.value) ? list_links.textContent = nameInput.value : list_links.textContent = urlInput.value;

    list_closeBtn.setAttribute("class", "closeBtn");
    list_closeBtn.textContent = "X";

    list_item.appendChild(list_links);
    list_item.appendChild(list_closeBtn);
    list.appendChild(list_item);

    pushObject()
    urlInput.value = '';
    nameInput.value = '';
}

// function for each of the closeBtn, also an event delegation for the <ul>
function close(e) {
    if (e.target && e.target.matches(".closeBtn")) {
        savedLinks.removeChild(e.target);
    }
} 

// creating the links as objects through a constructor
function LinkValues(url, name) {
    this.url = url;
    this.name = name;
}

// pushing the object to the array that the browser will parse through when 
// the page reloads or loads on another time
function pushObject() {
    // the new object to be pushed
    let linkObject = new LinkValues(urlInput.value, nameInput.value);
        localStorage.setItem("object1", linkObject);

    links.push(linkObject);
}

// making the button do its intended work
button.addEventListener("click", addLinks);

savedLinks.addEventListener("click", close);