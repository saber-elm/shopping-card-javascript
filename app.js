const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const productsDom = document.querySelector(".products-list");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");

const cartContent = document.querySelector(".cart-content");

const clearCart = document.querySelector(".clear-cart");

import { productsData } from "./products.js";

let cart = [];

// 1. --------------- get products ---------------

class Products {
  //get from api endpoint
  getProducts() {
    return productsData;
  }
}

let buttonsDOM = [];
// 2. --------------- display products ---------------
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<div class="product">
      <div class="img-container">
      <img src=${item.imageUrl} alt="product-image" class="product-img"/>
      </div>
      <div class="product-desc">
      <p class="product-price">$${item.price}</p>
      <p class="product-title">${item.title}</p>
      </div>
      <button class="btn add-to-cart" data-id=${item.id}>
      <!-- <i class="fas fa-shopping-cart"></i> -->
      add to cart
      </button>
      </div>`;
      productsDom.innerHTML = result;
    });
  }
  getAddToCartBtn() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    // const buttonsDOM = [addToCartBtns;
    // console.log(buttonsDOM);]
    buttonsDOM = addToCartBtns;
    // console.log(buttonsDOM);
    // console.log(addToCartBtn);
    // const buttons = [...addToCartBtns];
    // console.log(buttons);
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      //   console.log(id);
      //* check if this product id is in cart or not
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // console.log(event.target.dataset.id);
        // get product from products:
        // const addedProduct = Storage.getProduct(id); // changed to better code
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };

        // console.log(addedProduct);
        // add to cart
        // cart = [...cart, { ...addedProduct, quantity: 1 }]; // changed to better code in below
        cart = [...cart, addedProduct];

        // save cart to local storage
        Storage.saveCart(cart);
        //update cart value
        this.setCartValue(cart);
        // add to cat item
        this.addCartItem(addedProduct);
        // get cart from storage!
      });
    });
  }
  setCartValue(cart) {
    // 1. calculate num of cart items:
    // 2. calculate cart total price:
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
    cartItems.innerText = tempCartItems;
    // console.log(tempCartItems);
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img
    class="cart-item-img" 
    src=${cartItem.imageUrl}
    alt="Product Image"
    />
    <div class="cart-item-desc">
    <h4 class="cart-item-title">${cartItem.title}</h4>
    <h5 class="cart-item-price">$${cartItem.price}</h5>
    </div>
    <div class="cart-item-counter">
    <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
    <p>${cartItem.quantity}</p>
    <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
    </div>
    <i class="fas fa-trash-alt remove-item" data-id=${cartItem.id}></i>
    `;
    cartContent.appendChild(div);
  }
  setupApp() {
    // get cart from storage:
    // solution1
    // cart = Storage.getCart() || [];
    // solution2
    cart = Storage.getCart();

    // addCartItem and show in modal
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    // setvalues: price + items
    this.setCartValue(cart);
  }
  cartLogic() {
    // clear cart:
    clearCart.addEventListener("click", () => this.clearCart());
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      //   console.log(event.target);
      if (event.target.classList.contains("fa-chevron-up")) {
        console.log(event.target.dataset.id);
        const addQuantity = event.target;
        // get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id === parseInt(addQuantity.dataset.id)
        );
        addedItem.quantity++;
        // update cart value
        this.setCartValue(cart);
        // save cart
        Storage.saveCart(cart);
        // update cart item in UI:
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-alt")) {
        const removeItem = event.target;
        // remove child from cartItem
        const removedItem = cart.find(
          (cItem) => cItem.id === parseInt(removeItem.dataset.id)
        );
        // call remove method
        this.removeItem(removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const substractedItem = cart.find(
          (cItem) => cItem.id === parseInt(subQuantity.dataset.id)
        );
        // console.log(substractedItem.quantity);
        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        substractedItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        // console.log(subQuantity.parentElement);
        // console.log(subQuantity.parentElement.parentElement);
        // console.log(subQuantity.previousElementSibling);
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }
  clearCart() {
    //   console.log("clear");
    // remove:
    //* DRY: Dont repeat yourself
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove cart content children:
    // console.log(cartContent.children);
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunc();
  }
  removeItem(id) {
    // console.log(id);
    // update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // update total price and cart items
    this.setCartValue(cart);
    // update storage
    Storage.saveCart(cart);
    // get add to cart btns => update text and disable status
    // buttons !!

    // console.log(buttonsDOM);
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "add to cart";
    button.disabled = false;
  }
}
// 3. --------------- LocalStorage ---------------
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    // solution1 depends on solution no of setupApp func in get cart
    // return JSON.parse(localStorage.getItem("cart"));
    // solution2 depends on solution no of setupApp func in get cart
    return JSON.parse(localStorage.getItem("cart"))
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
  //   static clearCart(cart) {
  //     localStorage.setItem("cart", JSON.stringify(cart));
  //   }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  // set up: get cart and set up app:
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtn();
  ui.cartLogic();
  Storage.saveProducts(productsData);
  //   console.log(productsData);
  //   console.log("loaded");
});

// --------------- Cart Item Modal ---------------

function showModalFunc() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "30%";
}

function closeModalFunc() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunc);
backDrop.addEventListener("click", closeModalFunc);
closeModal.addEventListener("click", closeModalFunc);
