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
    
    // in case opening of the database has failed
    setDB.onerror = function() {
        status_space.textContent = "Something is wrong from the database.";
        console.log("Database failed to open.");
    }

    // in case the database is found
    setDB.onsuccess = function() {
        status_space.textContent = "Bookmarks loaded.";
        console.log("Database opening is successful.");

        // putting the values on the db variable
        db = setDB.result;

        // displays the data
        displayData();
    }

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

    function createDBData(e) {

        if ((urlInput.value.match(/\w/gi))) {
            // constructing the object
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
                status_space.textContent = "Transaction not completed due to some error.";
            }
        } else {
            status_space.textContent = "URL is empty/valid.";
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
                closeButton.textContent = "X";
                closeButton.onclick = deleteItem;

                link.setAttribute("href", cursor.value.url);

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
    
        displayData();
    }

        function isEmptyList() {
            if(!list.firstChild) {
                status_space.textContent = "No links are stored.";
        }
    }

    // A service worker will save the page allowing you to run it offline (in case, this came from online)
    if('serviceWorker' in navigator) {
        navigator.serviceWorker
                 .register('./sw.js')
                 .then(function() { console.log('Service Worker Registered'); })
                 .catch(function() { console.log("Service Worker Failed")});
      }
};

// an asynchronous function that will load when the whole page is finished
window.addEventListener('load', pushData);