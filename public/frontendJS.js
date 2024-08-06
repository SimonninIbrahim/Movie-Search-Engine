
//global variables 
let froalaEditor;
let arabicfroalaEditor;

// Get the textarea elements and their values
const ContentTextArea = document.getElementById("content");




function initForm() {
    // let froalaEditor;
    // let arabicfroalaEditor;

    // Get the textarea elements and their values
    // const ContentTextArea = document.getElementById("content");
    if (ContentTextArea != null) {
        const initialContent = ContentTextArea.value;
        const arabicContentTextArea = document.getElementById("arabicContent");
        const initialArabicContent = arabicContentTextArea.value;

        // Create new div elements and give them IDs
        const theFroalaEditor = document.createElement("div");
        theFroalaEditor.id = "theFroalaEditor";
        const theArabicFroalaEditor = document.createElement("div");
        theArabicFroalaEditor.id = "theArabicFroalaEditor";

        // Replace the textareas with the new div elements
        const ContentTextAreaParent = ContentTextArea.parentNode;
        ContentTextAreaParent.replaceChild(theFroalaEditor, ContentTextArea);
        const arabicContentTextAreaParent = arabicContentTextArea.parentNode;
        arabicContentTextAreaParent.replaceChild(theArabicFroalaEditor, arabicContentTextArea);

        // Initialize the Froala editors on the new div elements and set their initial HTML content
        froalaEditor = new FroalaEditor('#theFroalaEditor', {
            imageUpload: true,
            fileUpload: true,
            imageUploadURL: '/upload',
            fileUploadURL: '/upload'
        }, () => {
            froalaEditor.html.set(initialContent);
        });



        arabicfroalaEditor = new FroalaEditor('#theArabicFroalaEditor', {
            // Set the image upload parameter.
            imageUploadParam: 'file',

            // Set the image upload URL.
            imageUploadURL: '/upload',

            // Additional upload params.
            imageUploadParams: { id: 'my_editor' },

            // Set request type.
            imageUploadMethod: 'POST',

            // Set max image size to 5MB.
            imageMaxSize: 5 * 1024 * 1024,

            // Allow to upload PNG and JPG.
            imageAllowedTypes: ['jpeg', 'jpg', 'png'],

            events: {
                'image.beforeUpload': function (images) {
                    // Return false if you want to stop the image upload.
                },
                'image.uploaded': function (response) {
                    // Image was uploaded to the server.
                },
                'image.inserted': function ($img, response) {
                    // Image was inserted in the editor.
                },
                'image.replaced': function ($img, response) {
                    // Image was replaced in the editor.
                },
                'image.error': function (error, response) {
                    // Bad link.
                    if (error.code == 1) { }

                    // No link in upload response.
                    else if (error.code == 2) { }

                    // Error during image upload.
                    else if (error.code == 3) { }

                    // Parsing response failed.
                    else if (error.code == 4) { }

                    // Image too text-large.
                    else if (error.code == 5) { }

                    // Invalid image type.
                    else if (error.code == 6) { }

                    // Image can be uploaded only to same domain in IE 8 and IE 9.
                    else if (error.code == 7) { }

                    // Response contains the original server response to the request if available.
                }
            }
        }, () => {
            arabicfroalaEditor.html.set(initialArabicContent);
        });

        validateCharacters(froalaEditor, arabicfroalaEditor);



    }
}

document.addEventListener("DOMContentLoaded", initForm())


console.log('script src"></script> was evoked');

async function deleteItem(article_id) {
    // const response = await fetch(`/article.html/${article_id}/delete`, {
    //     method: 'DELETE'
    // });

    // const data = await response.text();

    // console.log(data);

    const ajax = new XMLHttpRequest();

    ajax.open("DELETE", `/article.html/${article_id}/delete`, false);


    ajax.send();


}

// Add an event listener to the delete button


Array.from(document.getElementsByClassName('Delete Button')).forEach((each) => {
    each.addEventListener('click', (event) => {
        if (confirm("are you sure you want to delete this article?")) {
            event.target.parentNode.parentNode.parentNode.parentNode.removeChild(event.target.parentNode.parentNode.parentNode);

            // console.log('Call the deleteItem function with the id of the item you want to delete');
            console.log(event.target.value)
            deleteItem(event.target.value);

        }
    })
});

async function likeArticle(article_id) {
    try {
        // Send a DELETE request to the server
        const ajax = new XMLHttpRequest();

        ajax.open("PUT", `/article.html/${article_id}/like`, false);


        ajax.send();

        // const response = await fetch(`/article.html/${article_id}/like`, {
        //     method: 'PUT'
        // });


        // const data = await response.text();

        // console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// Add an event listener to the delete button


Array.from(document.getElementsByClassName('FloatingLikeButton')).forEach((each) => {

    console.log("like button ittrator is called");
    each.addEventListener('click', (event) => {


        // console.log('Call the deleteItem function with the id of the item you want to delete');
        console.log(event.target.closest('.FloatingLikeButton').dataset.value)
        likeArticle(event.target.closest('.FloatingLikeButton').dataset.value);
        let numberOfLikes = (Number)(document.getElementById('numberOfLikes').innerHTML);
        console.log(numberOfLikes);
        document.getElementById('numberOfLikes').innerHTML = numberOfLikes + 1;


    })
});






// }

document.getElementById("selectLanguage").addEventListener("change", function (event) {

    // localStorage.setItem("alreadyRedirected", "false");
    setLanguage(event)
    // location.reload();

})


var languageSelected;
languageSelected = String(localStorage.getItem("languageSelection"));

function setLanguage(event) {

    let ajax = new XMLHttpRequest();
    console.log("funcion setLanguage called!")

    console.log(event.target.value);
    // localStorage.removeItem("languageSelection");
    localStorage.setItem("languageSelection", event.target.value);
    console.log("localstorage item is:", localStorage.getItem("languageSelection"));
    languageSelected = String(localStorage.getItem("languageSelection"));
    if (languageSelected == 'Arabic') {
        ajax.open("GET", '/lang?lang=ar', true);
        // document.getElementById('stylesheet').href = '/index-ar.css';
        configureCssFromEnglishToArabic();
    } else {
        ajax.open("GET", '/lang?lang=en', true);
        // document.getElementById('stylesheet').href = '/index.css';
        configureCssFromArabicToEnglish();
    }



    ajax.send();
    console.log("var language selected is", languageSelected);


}

// when first open the main page 

document.addEventListener("DOMContentLoaded", () => {

    let retrivedLanguage = localStorage.getItem("languageSelection")
    console.log(`language detected in localStorage is ${retrivedLanguage}`)


    if (retrivedLanguage == 'Arabic') {
        document.getElementById('stylesheet').href = '/index.css';
        selectLanguage.value = 'Arabic';
        setUpCssSheetForLanguageSelected('Arabic');
        // document.getElementById('articleContentDiv').innerHTML = '{{article.arabicContent | safe }}';


    } else {
        document.getElementById('stylesheet').href = '/index.css';
        selectLanguage.value = 'English';
        setUpCssSheetForLanguageSelected('English');
        // document.getElementById('articleContentDiv').innerHTML = '{{article.content | safe }}';
    }

})



//validate the length/number of characters
function validateCharacters(froalaEditor, arabicfroalaEditor) {

    document.getElementsByClassName("ElementOfArticleCreation Button")[0].addEventListener("click", function (Event) {
        Event.preventDefault();

        if (froalaEditor.charCounter.count() < 10) {

            console.log("you cannot submit this article because your charactesare less then 10");
            Event.preventDefault();
            alert("you cannot submit this article because your charactes are less then 10")
            // submitButtonClicked (Event);
            // Event.target.submit();
        }


        else if (arabicfroalaEditor.charCounter.count() < 10) {

            console.log("you cannot submit this article because your arabic content charactes are less then 10 ");
            Event.preventDefault();
            alert("you cannot submit this article because your arabic content charactes are less then 10 ")
            // Event.target.submit();
        }
        else if (froalaEditor.charCounter.count() >= 10 && arabicfroalaEditor.charCounter.count() >= 10) {


            submitButtonClicked(Event);

        }

    })


    // else  {


    //     console.log("article submitted");
    // }


    function submitButtonClicked(Event) {

        alert("your article is being submitted");

    }



    function getIndexCssPath() {



        return path.join(__dirname, './public/index.css');

    }

}


function getIdFromUrl() {

    let URL = (window.location.href).split("/");

    let articleId = URL[URL.length - 1];

    return articleId;

}
if (ContentTextArea != null) {

    async function checkIfItsAnEdit() {
        if (document.getElementById('title').value != '') {
            document.getElementById('topText').innerHTML = 'Edit an article';
            document.getElementById('submitButton').innerHTML = 'Edit';
            document.getElementById('submitButton').value = getIdFromUrl();
            document.getElementById('articleForm').method = 'post';
            document.getElementById('submitButton').addEventListener('click', async (event) => {
                event.preventDefault();
                await editPOSTfunction();
            });
        }
        else {

            console.log('second submit button listener invoked!')
            handleSumbitionForNewArticles();

        }
    }

    checkIfItsAnEdit();


}
function constructObjectFromForm() {

    console.log('constructObjectFromForm()')

    const title = document.getElementById("title").value;

    const author = document.getElementById("author").value;

    const description = document.getElementById("description").value;

    const content = froalaEditor.html.get();

    const arabicContent = arabicfroalaEditor.html.get();

    const data = {

        title: title,
        author: author,
        description: description,
        content: content,
        arabicContent: arabicContent


    }

    console.log("extracted data object is ");
    console.log(data)
    return data;

}

function handleSumbitionForNewArticles() {

    console.log('handleSumbitionForNewArticles()')
    document.getElementById('submitButton').addEventListener('click', async (event) => {
        if (froalaEditor.charCounter.count() >= 10 && arabicfroalaEditor.charCounter.count() >= 10) {
            console.log('handleSumbitionForNewArticles() part 2 ');

            event.preventDefault();

            data = constructObjectFromForm();

            console.log(data);

            var response = await fetch('/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        };


    });
}

// handleSumbitionForNewArticles();


async function editPOSTfunction() {
    if (froalaEditor.charCounter.count() >= 10 && arabicfroalaEditor.charCounter.count() >= 10) {
        const response = await fetch(`/edit/ ${getIdFromUrl()} `, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(constructObjectFromForm())
        });
        const data = await response.json();
        // handle the response data
    }
}



function configureCssFromEnglishToArabic() {

    //delete the english rules

    let stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(0);
    stylesheet.deleteRule(0);


    //add the arabic rules
    let rule = "#nonBaseStuff, section { direction: rtl; }";
    stylesheet.insertRule(rule, 0);
    rule = "#articleContentDiv {display:none; }";
    stylesheet.insertRule(rule, 0);
    rule = "    .FloatingLikeButton {        display: flex; width: 100px; height: 100px; background-color: #313042;       border-style:solid;        border-radius: 1rem;        border-color: #6d64ff;        position: fixed;        min-width: 1em;        bottom: 10px;         left : 10px;         padding: 0em;         max-height: 20em; min-width: 7em; }";
    stylesheet.insertRule(rule, 0);

}

function configureCssFromArabicToEnglish() {

    //delete the arabic rules 
    let stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(0);
    stylesheet.deleteRule(0);
    stylesheet.deleteRule(0);


    //add the english rules 

    let rule = "#articleArabicContentDiv { display: none;}";
    stylesheet.insertRule(rule, 0);
    rule = ".FloatingLikeButton {display: flex;  width: 100px;  height: 100px; background-color: #313042; border-style: solid;  border-radius: 1rem;     border-color: #6d64ff;        position: fixed;    min - width: 1em;   bottom: 10px; right: 10px;    padding: 0em;    max - height: 20em;    min - width: 7em;}";
    stylesheet.insertRule(rule, 0);



}


function setUpCssSheetForLanguageSelected(LanguageRequested) {

    if (LanguageRequested == "ar" || LanguageRequested == "Arabic") {

        let stylesheet = document.styleSheets[0];
        let rule = "#nonBaseStuff, section { direction: rtl; }";
        stylesheet.insertRule(rule, 0);
        rule = "#articleContentDiv {display:none; }";
        stylesheet.insertRule(rule, 0);
        rule = "    .FloatingLikeButton {        display: flex; width: 100px; height: 100px; background-color: #313042;       border-style:solid;        border-radius: 1rem;        border-color: #6d64ff;        position: fixed;        min-width: 1em;        bottom: 10px;         left : 10px;         padding: 0em;         max-height: 20em; min-width: 7em; }";
        stylesheet.insertRule(rule, 0);


    }


    else if (LanguageRequested == "en" || LanguageRequested == "English") {

        let stylesheet = document.styleSheets[0];
        let rule = "#articleArabicContentDiv { display: none;}";
        stylesheet.insertRule(rule, 0);
        rule = ".FloatingLikeButton {display: flex;  width: 100px;  height: 100px; background-color: #313042; border-style: solid;  border-radius: 1rem;     border-color: #6d64ff;        position: fixed;    min - width: 1em;   bottom: 10px; right: 10px;    padding: 0em;    max - height: 20em;    min - width: 7em;}";
        stylesheet.insertRule(rule, 0);



    }


}