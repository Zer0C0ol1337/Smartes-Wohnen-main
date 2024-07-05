//////////////////////////////////
/////Temperatur ANFANG
//////////////////////////////////

document.addEventListener('DOMContentLoaded', (event) => {
    const temperatureDisplay = document.querySelector('#current-temp'); // Korrigiert den Selektor

    async function updateTemperature() {
        try {
            const response = await fetch('http://localhost:8000/get_temperature');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                console.log('Received data:', data);
                if (data && data.temperature) { // Vereinfachte Bedingung
                    temperatureDisplay.textContent = `${data.temperature} °C`; // Direkter Zugriff auf data.temperature
                } else {
                    console.error('Unexpected response format:', data);
                }
            }
        } catch (error) {
            console.error('Error with request:', JSON.stringify(error, null, 2));
        }
    }

    updateTemperature();
    setInterval(updateTemperature, 60000);
});
/////////////////////////////////////
/////Temperatur ENDE
/////////////////////////////////////

/////////////////////////////////////
/////Uhrzeit | ANFANG
/////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
    function updateTime() {
        const currentTime = new Date();
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        let seconds = currentTime.getSeconds();

        hours = (hours < 10 ? "0" : "") + hours;
        minutes = (minutes < 10 ? "0" : "") + minutes;
        seconds = (seconds < 10 ? "0" : "") + seconds;

        const timeString = `${hours}:${minutes}:${seconds}`;

        const currentTimeElement = document.getElementById('current-time');
        currentTimeElement.textContent = timeString;

        setTimeout(updateTime, 1000);
    }

    updateTime();
});

//////////////////////////////////////
/////Uhrzeit | ENDE
//////////////////////////////////////

//////////////////////////////////////
/////Produkt hinzufügen Popup | ANFANG
//////////////////////////////////////

const products = [
    {name: 'Milch', icon: '/icons/milk.png'},
    {name: 'Eier', icon: '/icons/egg.png'},
    {name: 'Cola', icon: '/icons/cola.png'}, 
    {name: 'Jogurt', icon: '/icons/yogurt.png'},
];

const productList = document.getElementById('product-list');
productList.style.listStyleType = 'none';

products.forEach(function(product, index) {
    const listItem = document.createElement('li');
    const img = document.createElement('img');
    img.src = product.icon;
    img.alt = product.name;
    img.style.width = '50px';
    img.style.height = '50px';
    listItem.appendChild(img);

    const productName = document.createElement('span');
    productName.textContent = product.name;
    productName.style.marginRight = '10px';
    listItem.appendChild(productName);

    listItem.addEventListener('click', function() {
        selectedProduct = index;

        const allIcons = document.querySelectorAll('#product-list img');
        allIcons.forEach(function(icon) {
            icon.classList.remove('highlighted');
        });

        img.classList.add('highlighted');
    });

    productList.appendChild(listItem);
});

document.getElementById('add-product-btn').addEventListener('click', function() {
    document.getElementById('product-popup').style.display = 'block';
});

window.addEventListener('click', function(event) {
    const popup = document.getElementById('product-popup');
    if (event.target == popup) {
        popup.style.display = 'none';
    }
});

let selectedProduct = null;

const closePopupBtn = document.getElementById('close-popup-btn');

closePopupBtn.addEventListener('click', function() {
    document.getElementById('product-popup').style.display = 'none';
});

//////////////////////////////////////
/////Produkt hinzufügen Popup | ENDE
//////////////////////////////////////

//////////////////////////////////////
/////SQL INJECTION Produkt hinzufügen | ANFANG     /////
//////////////////////////////////////

document.getElementById('add-to-cart-btn').addEventListener('click', async function() {
    if (selectedProduct !== null) {
        const quantityInput = document.getElementById('quantity');
        const productData = {
            product_name: products[selectedProduct].name,
            quantity: quantityInput.value,
        };
        try {
            const response = await fetch('http://localhost:8000/add_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                alert(`Produkt ${products[selectedProduct].name} wurde mit der Menge ${quantityInput.value} dem Kühlschrank hinzugefügt.`);
            }
        } catch (error) {
            console.error('Request failed', error);
        }
        selectedProduct = null;
        const allIcons = document.querySelectorAll('#product-list img');
        allIcons.forEach(function(icon) {
            icon.classList.remove('highlighted');
        });
    }
});

////////////////////////////////////// 
/////SQL INJECTION | ENDE     /////
//////////////////////////////////////

////////////////////////////////////// 
/////PDFreader | ANFANG     /////
//////////////////////////////////////


var btn = document.getElementById("pdfbtn");
var modal = document.getElementById('pdfreader');
var object = document.getElementById('pdfObject');
var kwInput = document.getElementById('kwInput'); // Eingabefeld für die Kalenderwoche

btn.onclick = function() {
  var basePdfVersion = 'DE_de_KDZ_6100_D';  
  var kw = kwInput.value; // Wert aus dem Eingabefeld lesen

  // Überprüfen, ob eine Kalenderwoche eingegeben wurde
  if(kw) {
    var pdfVersion = basePdfVersion + kw; // URL mit der eingegebenen Kalenderwoche aktualisieren
    var url = 'https://leaflets.kaufland.com/de-DE/' + pdfVersion + '/ar/6100';
    object.data = url;
    modal.style.display = "block";
  } else {
    alert("Bitte geben Sie eine Kalenderwoche ein.");
  }
}

var span = document.getElementsByClassName("close")[0];

// Wenn der Benutzer auf <span> (x) klickt, schließt sich das Modal
span.onclick = function() {
  modal.style.display = "none";
  modal.reload(modal);
}

///////////////////////////////////////
// REZEPTE ANFANG/////////////////
///////////////////////////////////////

var box = document.querySelector('.recipes');
var popup = document.querySelector('#recipes-popup');

box.onclick = function() {
    popup.style.display = "block";
}

var closeBtn = document.querySelector('#close-recipes-popup-btn');

closeBtn.onclick = function() {
    popup.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == popup) {
        popup.style.display = "none";
    }
}

var recipes = ["Spaghetti mit Tomatensoße"];

var recipesList = document.querySelector('#recipes-list');
var recipesPopup = document.querySelector('#recipes-popup');

recipesPopup.style.height = (recipes.length * 200) + 'px';

for (var i = 0; i < recipes.length; i++) {
    var listItem = document.createElement('li');

    listItem.textContent = recipes[i];

    listItem.addEventListener('click', function() {
        var recipe = this.textContent;
        fetch(`/checkIngredients/${recipe}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Fehler:', data.error);
                } else if (data.status === 'rot') {
                    alert('Fehlende Zutaten: ' + data.missing_ingredients.join(', '));
                } else {
                    alert('Alle Produkte sind vorrätig');
                }
            })
            .catch((error) => {
                console.error('Fehler:', error);
            });
    });

    recipesList.appendChild(listItem);
}

///////////////////////////////////////
// REZEPTE ENDE/////////////////
///////////////////////////////////////


///////////////////////////////////////
// Produkt Entfernen ANFANG////////////
///////////////////////////////////////

document.getElementById('remove-product-btn').addEventListener('click', function() {
    fetch('/get_products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('product-list-delete-product');
            productList.innerHTML = ''; // Clear list
            data.products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.textContent = `${product.product_name} - Menge: ${product.quantity}`;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Löschen';
                deleteButton.onclick = function() {
                    fetch(`/delete_product/${product.product_name}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(data => {
                            alert('Produkt gelöscht');
                            // Update product list
                            deleteButton.parentElement.remove();
                        })
                        .catch(error => console.error('Fehler:', error));
                };
                productElement.appendChild(deleteButton);
                productList.appendChild(productElement);
            });
            // Show the modal
            document.getElementById('productModal').style.display = 'block';
        })
        .catch(error => console.error('Fehler:', error));
});

// Close the modal
document.querySelector('.modal-close-btn').addEventListener('click', function() {
    document.getElementById('productModal').style.display = 'none';
});
///////////////////////////////////////
// Produkt Entfernen ENDE//////////////
///////////////////////////////////////

///////////////////////////////////////
// Einkafufsliste ANFANG//////////////
///////////////////////////////////////


document.addEventListener('DOMContentLoaded', function() {
    // Referenz auf den Einkaufslisten-Button
    var shoppingListBtn = document.getElementById('shopping-list-btn');
    
    // Referenz auf das Popup-Element
    var shoppingListPopup = document.getElementById('shopping-list-popup');
    
    // Funktion, um das Popup zu öffnen
    function openPopup() {
        shoppingListPopup.style.display = 'block';
    }
    
    // Funktion, um das Popup zu schließen
    function closePopup() {
        shoppingListPopup.style.display = 'none';
    }
    
    // Event-Listener, um das Popup zu öffnen
    shoppingListBtn.addEventListener('click', openPopup);
    
    // Event-Listener, um das Popup zu schließen
    // Statt direkt auf den Button zu binden, binden wir das Event auf das Dokument und prüfen, ob das geklickte Element der Schließen-Button ist
    document.addEventListener('click', function(event) {
        var isCloseButton = event.target.id === 'close-popup-btn';
        if (isCloseButton) {
            closePopup();
        }
    });
});

///////////////////////////////////////
// Einkafufsliste ENDE////////////////
///////////////////////////////////////