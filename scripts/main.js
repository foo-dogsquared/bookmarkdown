// setup for the page elements
const urlInput = document.getElementById("inputLink"),
    nameInput = document.getElementById("inputName"),
    button = document.getElementById("addLink"),
    status_space = document.getElementById("status_space"),
    list = document.getElementById("list"),
    savedLinks = document.getElementById("savedLinks");

urlInput.value = '';
nameInput.value = '';
urlInput.focus();

// we set up a database for the links using IndexedDB
var db;

/* the whole function of the asynchronous event
meaning this will load after the page style 
(such as HTML and CSS) has been loaded so no
more staring at a blank screen each time you're
loading the page */
function pushData(e) {
    
    // setting up a database
    let setDB = window.indexedDB.open("linksDB", 1);
    
    // a Promise object for opening of the database
    new Promise(function(resolve, reject) {
        setDB.onsuccess = resolve;
        setDB.onerror = reject;
    })
    .then(function() {
        status_space.textContent = "Bookmarks loaded.";
        console.log("Database opening is successful.");

        // setting the database to be more accessible 
        db = setDB.result;

        // it will display the data from the database once it opens
        displayData();
    })
    .catch(function() {
        status_space.textContent = "There is something wrong with the database.";
        console.log("Database has failed to load.");
    });
    

    setDB.onupgradeneeded = function(e) {

        // the reference to the opened database
        let db = e.target.result;

        // creating the link object store to store our data in
        let objectStore = db.createObjectStore('links', { keyPath: 'id', autoIncrement:true });

        // creating the index of our needed data
        let linkData = objectStore.createIndex('url', 'url', {unique: true});
        let nameData = objectStore.createIndex('name', 'name', {unique: false});

        // just for checking
        console.log("Database setup complete.");
    };

    // 'click' event handler and its function for the button
    button.addEventListener("click", createDBData);
    urlInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {createDBData()}
    })
    nameInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {createDBData()}
    })

    function createDBData(e) {

        const urlRegex = /(?:[http]{1}s?[:]\/\/)?[\w|\W|\d]+[.][\w]+/gi;
        if ((urlInput.value.match(urlRegex))) {
            // constructing the object
            if (!(urlInput.value.match(/http+s?[:]\/\//))) urlInput.value = "http://" + urlInput.value;

            let newData = {
                url: urlInput.value,
                name: nameInput.value
            }

            // setting the transaction up to access and write the data
            let transaction = db.transaction(["links"], 'readwrite');

            // transaction is created and we open an objectStore
            let objectStore = transaction.objectStore("links");

            // making request to add the newData object into to the object store
            let request = objectStore.add(newData);

            // clearing the form
            request.onsuccess = function() {
                urlInput.value = '';
                nameInput.value = '';
            }

            // reporting the success if the process is done
            transaction.oncomplete = function() {
                status_space.textContent = "Bookmark added.";

                // displaying the data once again to update
                displayData();
            }

            transaction.onerror = function() {
                status_space.innerHTML = "Transaction not completed due to some error. <br> Check if there is a duplicate URL in your list.";
            }
        } else if (!urlInput.value) {
            status_space.textContent = "URL is empty.";
            urlInput.focus();
            e.preventDefault();
        } else if (!(urlInput.value.match(urlRegex))) {
            status_space.textContent = "URL inputted has invalid format.";
            urlInput.focus();
            e.preventDefault();
        }
    }

    function displayData(e) {
        /* this block of code is needed when we are going to update
        the list since if we don't do that, we will see duplicates
        of the list with the updated value being added each time 
        we are going to display the list of bookmarks on the page */
        while(list.firstChild) {
            list.removeChild(list.firstChild);
        }

        /* next, we will open the object store again then get a cursor
        that will iterate through each data that is stored on the database.
        In each data the cursor goes through, then that's where we create
        the list similar to the resulted screen */
        let objectStore = db.transaction(["links"]).objectStore("links");
        
        objectStore.openCursor().onsuccess = function (e) {
            
            // a reference to the cursor
            let cursor = e.target.result;

            // the cursor will iterate through data items until there's no more
            // left after the last data item
            if (cursor) {
                let listItem = document.createElement("li"),
                    link = document.createElement("a"),
                    closeButton = document.createElement("p");

                // adding the required items
                closeButton.setAttribute("class", "closeBtn");
                // closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" width="16"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>`;
                closeButton.innerHTML = `X`;
                closeButton.onclick = deleteItem;

                link.setAttribute("href", cursor.value.url);
                link.setAttribute("target", "_blank");

                /* checking if the user has entered a name for their bookmark
                if it does, the name will appear on the list, instead */
                (cursor.value.name) ? link.textContent = cursor.value.name : link.textContent = cursor.value.url;

                // setting up the <li> to have id numbers to easily refer to them
                listItem.setAttribute("data-link-id", cursor.key);

                // adding the elements inside of the list item
                listItem.appendChild(link);
                listItem.appendChild(closeButton);

                // list item adding to the list
                list.appendChild(listItem);

                cursor.continue();
            } else {
                // checks if the list is empty
                isEmptyList();
                }
            }
        }


    function deleteItem(e) {
        // referring back to the data-link-id value
        let linkId = Number(e.target.parentNode.getAttribute("data-link-id"));

        // opening up a transaction to be able to delete the item
        let transaction = db.transaction(["links"], "readwrite");

        // request to open up an object store/record
        let objectStore = transaction.objectStore("links");

        // deleting that particular item
        let request = objectStore.delete(linkId);

        // checks if the list is empty
        isEmptyList();
    
        // updates the database and display as appropriate
        displayData();
    }

    function isEmptyList() {
        if(!list.firstChild) {
            status_space.textContent = "No links are stored.";
    }
}

    // A service worker will save the page allowing you to run it offline (in case, this came from online)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/bookmarkdown/service-worker.js', { scope: './' }).then(function(reg) {
      
          if(reg.installing) {
            console.log('Service worker installing');
          } else if(reg.waiting) {
            console.log('Service worker installed');
          } else if(reg.active) {
            console.log('Service worker active');
          }
      
        }).catch(function(error) {
          // registration failed
          console.log('Registration failed with ' + error);
        });
      }
};

// an asynchronous function that will load when the whole page is finished
window.addEventListener('load', pushData);