let data = []

fetch("http://localhost:3000/api/products") //récupération détails produits en vente
  .then(function (res) {
    return res.json()
  })
  .then(function (res) { data = res }) //stock des détails dans data
  .then(function () { //affichage produits
    let innerhtml = ""
    let parent = document.getElementById("items");
    for (let i = 0; i < data.length; i++) {
      innerhtml += `<a href="./product.html?id=${data[i]._id}">
            <article>
              <img src="${data[i].imageUrl}" alt="${data[i].altTxt}">
              <h3 class="productName">${data[i].name}</h3>
              <p class="productDescription">${data[i].description}</p>
            </article>
          </a>`
    }
    parent.innerHTML = innerhtml
  })



