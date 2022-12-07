let data = []
const queryString = window.location.search;  //récupération de l'ID du produit (dans le lien)
const urlParams = new URLSearchParams(queryString);
const productId = urlParams.get("id");

fetch("http://localhost:3000/api/products/" + productId) //récupération du produit concerné
  .then(function (res) {
    return res.json()
  })
  .then(function (res) { data = res }) //stock des détails du produit dans data
  .then(showTheProduct) //affichage



function showTheProduct() { //affichage détails du produit
  const img= document.querySelector(".item__img img")
  img.src=data.imageUrl;
  img.alt=data.altTxt;
  document.querySelector("#title").innerText=data.name
  document.querySelector("#price").innerText=data.price;
  document.querySelector("#description").innerText=data.description;
  const colorSelect= document.querySelector("#colors")

  for (let c = 0; data.colors.length > c; c++) {
    const colorOption=document.createElement("option")
    colorOption.value=data.colors[c]
    colorOption.innerText=data.colors[c]
    colorSelect.appendChild(colorOption)
  }


  const addToCart= document.querySelector("#addToCart")
  addToCart.addEventListener("click", quantityAndColorControl);
} //ajout contrôle sur le click addToCart

var myShoppingCart = [];




function quantityAndColorControl() { // s'assure que l'utilisateur a choisi une quantité et une couleur
  let colorCanape = document.getElementById("colors").value
  let quantityCanape = parseInt(document.getElementById("quantity").value)
  if (quantityCanape < 1 || quantityCanape > 100) { 
    alert("Il faut choisir une quantité (1-100)") } //controle quantité raté
  else if (colorCanape == "") { 
    alert("il faut choisir une couleur") }    //controle couleur raté
  else { 
    addToPanier(colorCanape, quantityCanape) } //controles ok
}



function addToPanier(colorCanape, quantityCanape) {  //met a jour le localStorage
  if (window.localStorage.getItem("KanapShoppingCart") != null) { // si il y a un localStorage KanapShoppingCart, on le met dans monPanier
    myShoppingCart = JSON.parse(window.localStorage.getItem("KanapShoppingCart"));
    myShoppingCart.filter((item) => item.color === colorCanape).find((item) => item.id == productId) == null ?
      // si dans monPanier il y a déjà un produit pareil, on change la quantité, sinon on crée un nouveau produit 
      createArticle(colorCanape, quantityCanape) : changeQuantity(quantityCanape, colorCanape);
    // si il n'y a pas le produit, on le crée
  }
  else { createArticle(colorCanape, quantityCanape) } // si il n'y a pas un localStorage KanapShoppingCart, on le crée 
}



function createArticle(colorCanape, quantityCanape) //crée un nouveau article
{
  let article = { id: productId, color: colorCanape, quantity: quantityCanape };
  myShoppingCart.push(article);
  localStorage.setItem("KanapShoppingCart", JSON.stringify(myShoppingCart));
  document.getElementById("quantity").value = 0;
  document.getElementById("colors").value = ""
}


function changeQuantity(quantityCanape, colorCanape) { //Contrôle  et met à jour la quantité
  let totAskedQuantity = parseInt(myShoppingCart.filter((item) => item.color === colorCanape).find((item) => item.id == productId).quantity) + parseInt(quantityCanape);
  if (totAskedQuantity > 100) //quantité tot >100: erreur
  { alert("Malheureusement, commander plus que 100 produits identiques est impossible. Veuillez nous excuser pour la gêne occasionnée ") }
  else { //mise à jour quantité
    myShoppingCart.filter((item) => item.color === colorCanape).find((item) => item.id == productId).quantity = totAskedQuantity;
    localStorage.setItem("KanapShoppingCart", JSON.stringify(myShoppingCart));
    document.getElementById("quantity").value = 0;
    document.getElementById("colors").value = ""
  }
}



