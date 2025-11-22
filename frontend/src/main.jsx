import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import UserContext from "./context/UserContext.jsx";
import ProductContext from "./context/ProductContext.jsx";
import ItemContext from "./context/ItemContext.jsx";
import CartContext from "./context/CartContext.jsx";

createRoot(document.getElementById("root")).render( 
      <ProductContext>
    <UserContext>
        <ItemContext>
          <CartContext>

          <App />
          </CartContext>
        </ItemContext>
    </UserContext>
      </ProductContext>
);
