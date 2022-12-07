let data = []

let myShoppingCart = JSON.parse(window.localStorage.getItem("KanapShoppingCart")); //myShoppingCart= localStorage


// Définition d'une fonction qui retourne une promesse pouvant être éxécutées plusieurs fois
// une fois pour chaque produit du panier dont on veut récupérer les infos...
const fetchGet = url => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(result => {
        resolve(result);
      });
  })
};


// Chargement des produits sous la forme de promesses multiples
let promises = [];
if(myShoppingCart==null){ //pour eviter bug affichage si panier n'existe pas (ligne28)
  showShoppingCart()
}
myShoppingCart.forEach(items => {//info dans promises[]
  promises.push(fetchGet("http://localhost:3000/api/products/" + items.id));
});

Promise.all(promises).then((values) => {//pour remplir data[]
  data = values;
  showShoppingCart(); //affiche détails
  quantityLogic() //ajout logique changement quantité
});


function quantityLogic() { //logique du changement de quantité
  let productColorQ; let productIdQ; let quantityButtons
  quantityButtons = document.querySelectorAll(".itemQuantity")
  quantityButtons.forEach(quantityButton => quantityButton.addEventListener("click", () => { //changement au click
      productColorQ = quantityButton.parentElement.parentElement.parentElement.parentElement.dataset.color; //couleur produit
      productIdQ = quantityButton.parentElement.parentElement.parentElement.parentElement.dataset.id//id produit
      changeQuantity(productColorQ, productIdQ, quantityButton)
    }))
  quantityButtons.forEach(quantityButton => quantityButton.addEventListener("focusout", () => { //controle et changement au clavier
    if (quantityButton.value < 100 && quantityButton.value > 0) {
      productColorQ = quantityButton.parentElement.parentElement.parentElement.parentElement.dataset.color;
      productIdQ = quantityButton.parentElement.parentElement.parentElement.parentElement.dataset.id
      changeQuantity(productColorQ, productIdQ, quantityButton)
    }
    else {
      alert("Le nombre de produits identiques commandés doit être compris entre 1 et 100.");
      showShoppingCart()
      quantityLogic()
    }
  }

  ))
}
function changeQuantity(productColorQ, productIdQ, quantityButton) { //change quantité dans le localstorage
  let stockQuantityArrayFiltred = myShoppingCart.filter(function (q) {
    return q.id == productIdQ && q.color == productColorQ;//on trouve le seul element stocké qui match (filtres id et couleur)
  });
  stockQuantityArrayFiltred[0].quantity = (parseInt(quantityButton.value)) //quantité de l'article stocké mis à jour
  localStorage.setItem("KanapShoppingCart", JSON.stringify(myShoppingCart));
  totalRefresh()
}


let total=0;
let idList = []
let cartArticle = ""
function showShoppingCart() { //crée et affiche les articles sur la page
  document.getElementById("cart__items").innerHTML = "";
  if (myShoppingCart==null|| myShoppingCart.length == 0 ) {
    document.getElementById("totalPrice").textContent = 0;
    document.getElementById("totalQuantity").textContent = 0;
  }
  const cartItem= document.getElementById("cart__items")
  for (let i = 0; i < myShoppingCart.length; i++) {
    const article=document.createElement("article")
    article.className="cart__item"
    article.dataset.id=myShoppingCart[i].id
    article.dataset.color=myShoppingCart[i].color
    cartItem.appendChild(article)

    const cartItemImage=document.createElement("div")
    cartItemImage.className="cart__item__img"
    article.appendChild(cartItemImage)

    const img = document.createElement("img")
    img.src=data[i].imageUrl
    img.alt=data[i].altTxt
    cartItemImage.appendChild(img)

    const cartItemContent=document.createElement("div")
    cartItemContent.className="cart__item__content"
    article.appendChild(cartItemContent)

    const cartItemContentDescription=document.createElement("div")
    cartItemContentDescription.className="cart__item__content__description"
    cartItemContent.appendChild(cartItemContentDescription)

    const h2Name = document.createElement("h2")
    h2Name.innerText=data[i].name
    cartItemContentDescription.appendChild(h2Name)

    const pColor = document.createElement("p")
    pColor.innerText=myShoppingCart[i].color
    cartItemContentDescription.appendChild(pColor)

    const pPrice = document.createElement("p")
    pPrice.innerText=data[i].price+"€"
    cartItemContentDescription.appendChild(pPrice)

    const cartItemContentSettings=document.createElement("div")
    cartItemContentSettings.className="cart__item__content__settings"
    cartItemContent.appendChild(cartItemContentSettings)

    const cartItemContentSettingsQuantity=document.createElement("div")
    cartItemContentSettingsQuantity.className="cart__item__content__settings__quantity"
    cartItemContentSettings.appendChild(cartItemContentSettingsQuantity)

    const pQte = document.createElement("p")
    pQte.innerText="Qté : "
    cartItemContentSettingsQuantity.appendChild(pQte)

    const inputQuantity = document.createElement("input")
    inputQuantity.type="number"
    inputQuantity.className="itemQuantity"
    inputQuantity.name="itemQuantity"
    inputQuantity.min=1
    inputQuantity.max=100
    inputQuantity.value=myShoppingCart[i].quantity
    cartItemContentSettingsQuantity.appendChild(inputQuantity)

    const cartItemContentSettingsDelete=document.createElement("div")
    cartItemContentSettingsDelete.className="cart__item__content__settings__delete"
    cartItemContentSettings.appendChild(cartItemContentSettingsDelete)

    const deleteP=document.createElement("p")
    deleteP.className="deleteItem"
    deleteP.innerText="Supprimer"
    deleteP.addEventListener("click", ()=>{
      const itemToDeleteIndex = myShoppingCart.findIndex((panierItem)=>{
        return panierItem.color==article.dataset.color && panierItem.id==article.dataset.id
      })
      myShoppingCart.splice(itemToDeleteIndex, 1)
      localStorage.setItem("KanapShoppingCart", JSON.stringify(myShoppingCart))
      article.remove()
      totalRefresh()
})
    cartItemContentSettingsDelete.appendChild(deleteP)
    console.log(data[i].price)
    total+=parseInt(inputQuantity.value*data[i].price)
  }

  document.getElementById("totalPrice").textContent = total;
  document.getElementById("totalQuantity").textContent = myShoppingCart.length;
 
}

function totalRefresh(){ //mise à jour total et n articles
  let total=0;
  if (myShoppingCart.length==0){    
    document.getElementById("totalPrice").textContent = total;
    document.getElementById("totalQuantity").textContent = myShoppingCart.length;
  }
  for (let i = 0; i < myShoppingCart.length; i++){
  total = total + data[i].price * parseInt(myShoppingCart[i].quantity);
  if (i == myShoppingCart.length - 1) {
    document.getElementById("totalPrice").textContent = total;
    document.getElementById("totalQuantity").textContent = myShoppingCart.length;
  }
}
}









//formulaire
//si le formulaire est valide, submit nous porte a confirmation.html
document.getElementById("order").addEventListener("click", testFormulaire)

function testFormulaire(event) { /*tous les champs sont bien remplis? 
  si les reggex n'affichent pas d'erreurs et les champs ne sont pas vides, oui, sinon erreur*/
  event.preventDefault();
  errors=cityError+addressError+firstNameError+lastNameError+emailError 
  if (errors==0 && document.getElementById("city").value != "" &&
    document.getElementById("firstName").value != "" &&
    document.getElementById("lastName").value != "" &&
    document.getElementById("address").value != "" &&
    document.getElementById("email").value != "") {
    goToConfirmation()
  }
  else {
    alert("Pour valider est necessaire completer le formulaire")
  }

}
const formulaireElements = document.querySelectorAll(".cart__order__form__question input");
formulaireElements.forEach((formulaireElement) => { //on passe ce qu'on tape au clavier aux functions concernées
  formulaireElement.addEventListener("input", (e) => {
    switch (e.target.id) {
      case "firstName": prenomf(e.target.value)
        break;
      case "lastName": nomf(e.target.value)
        break;
      case "address": adressef(e.target.value)
        break;
      case "city": villef(e.target.value)
        break;
      case "email": emailf(e.target.value)
        break;
      default: null;
    }
  })
})
let errors=0
let cityError=0
let firstNameError=0
let lastNameError=0
let addressError=0
let emailError=0
function prenomf(value) { //reggex prenom
  if (value.match(/^[a-zA-Z-. êèé\.]+$/) == null) {
    document.getElementById("firstNameErrorMsg").innerHTML = "Le prénom peut contenir que des lettres"
    firstNameError=1
  }
  else {
    document.getElementById("firstNameErrorMsg").innerHTML = ""
    firstNameError=0
  }
}

function nomf(value) {//reggex nom
  if (value.match(/^[a-zA-Z-. êèé\.]+$/) == null) {
    document.getElementById("lastNameErrorMsg").innerHTML = "Le nom peut contenir que des lettres"
    lastNameError=1
  }
  else {
    document.getElementById("lastNameErrorMsg").innerHTML = ""
    lastNameError=0
  } //nom ok
}

function adressef(value) {//reggex adresse
  if (value.match(/^[a-zA-Z0-9-. êèé\.]{4,}$/) == null) {
    document.getElementById("addressErrorMsg").innerHTML = "L'adresse ne semble pas valide"
    addressError=1
  }
  else {
    document.getElementById("addressErrorMsg").innerHTML = ""
    addressError=0
  }
}

function villef(value) {//reggex ville
  if (value.match(/^[a-zA-Z-. êèé\.]{2,}$/) == null) {
    document.getElementById("cityErrorMsg").innerHTML = "Le nom de la ville doit contenir que des lettres; 2 minimum"
    cityError=1
  }
  else {
    document.getElementById("cityErrorMsg").innerHTML = ""
    cityError=0
  }

}
function emailf(value) {//reggex mail
  if (value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/) == null) {
    document.getElementById("emailErrorMsg").innerHTML = "L'email semble incorrecte ou incomplete"
    emailError=1
  }
  else {
    document.getElementById("emailErrorMsg").innerHTML = ""
    emailError=0
  }
}





function goToConfirmation(event) { //prépare et effectue la requete post et prend la réponse



  const order = { //info pour requete
    contact: {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      email: document.getElementById("email").value
    },
    products: idList //res attendu id1, id2, ..

  }
  const headers = new Headers() //pour envoyer requete post 
  headers.append("content-type", "application/json")
  const reqInit = {
    method: "post",
    body: JSON.stringify(order),
    headers: headers
  }
  fetch("http://localhost:3000/api/products/order", reqInit)  
    .then(function (res) {
      return res.json()
    })
    .then(function (res) { //récupere réponse et  order id
      const orderId = res.orderId;
      console.log(res)
      // window.location.href = "http://127.0.0.1:5501/front/html/confirmation.html?orderId=" + orderId;
      window.location.href = "./confirmation.html?orderId=" + orderId; //order id dans le lien de la nouvelle page (confirmation)

    })
}




