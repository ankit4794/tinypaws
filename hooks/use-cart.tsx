import * as React from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  weight?: string;
  pack?: string;
  variant?: string;
  maxQuantity?: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  tax: number;
}

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setDeliveryCharge: (charge: number) => void;
  syncCart: () => Promise<void>;
}

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DELIVERY_CHARGE'; payload: number };

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.salePrice ?? item.price;
    return total + price * item.quantity;
  }, 0);
};

const calculateTax = (subtotal: number): number => {
  // Apply 18% GST or your tax rate
  return subtotal * 0.18;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      const subtotal = calculateSubtotal(action.payload);
      const tax = calculateTax(subtotal);
      const total = subtotal + state.deliveryCharge + tax;
      
      return {
        ...state,
        items: action.payload,
        subtotal,
        tax,
        total,
      };
    
    case 'ADD_ITEM': {
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
               item.weight === action.payload.weight &&
               item.pack === action.payload.pack &&
               item.variant === action.payload.variant
      );

      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        // Update existing item quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
        };

        // Ensure quantity doesn't exceed max quantity if specified
        if (newItems[existingItemIndex].maxQuantity && 
            newItems[existingItemIndex].quantity > newItems[existingItemIndex].maxQuantity) {
          newItems[existingItemIndex].quantity = newItems[existingItemIndex].maxQuantity;
        }
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      const subtotal = calculateSubtotal(newItems);
      const tax = calculateTax(subtotal);
      const total = subtotal + state.deliveryCharge + tax;

      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }

    case 'UPDATE_ITEM': {
      const { itemId, quantity } = action.payload;
      
      // Find item and update quantity
      const newItems = state.items.map(item => {
        if (item._id === itemId) {
          // Ensure quantity is at least 1 and doesn't exceed max if specified
          let newQuantity = Math.max(1, quantity);
          
          if (item.maxQuantity) {
            newQuantity = Math.min(newQuantity, item.maxQuantity);
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      const subtotal = calculateSubtotal(newItems);
      const tax = calculateTax(subtotal);
      const total = subtotal + state.deliveryCharge + tax;

      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item._id !== action.payload);
      const subtotal = calculateSubtotal(newItems);
      const tax = calculateTax(subtotal);
      const total = subtotal + state.deliveryCharge + tax;

      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        subtotal: 0,
        tax: 0,
        total: state.deliveryCharge, // Keep delivery charge
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_DELIVERY_CHARGE': {
      const total = state.subtotal + action.payload + state.tax;
      
      return {
        ...state,
        deliveryCharge: action.payload,
        total,
      };
    }

    default:
      return state;
  }
};

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
    subtotal: 0,
    deliveryCharge: 0,
    tax: 0,
    total: 0,
  });

  // Load cart from local storage on initial load
  useEffect(() => {
    const loadCartFromStorage = () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          dispatch({ type: 'SET_ITEMS', payload: parsedCart });
        } catch (error) {
          console.error('Failed to parse cart from local storage:', error);
          localStorage.removeItem('cart');
        }
      }
    };

    loadCartFromStorage();
  }, []);

  // Save cart to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Fetch user's cart when logged in
  useEffect(() => {
    if (user) {
      syncCart();
    }
  }, [user]);

  const syncCart = async (): Promise<void> => {
    try {
      if (!user) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      // First sync local cart to server
      if (state.items.length > 0) {
        await apiRequest('POST', '/api/cart/sync', {
          items: state.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            weight: item.weight,
            pack: item.pack,
            variant: item.variant,
          })),
        });
      }

      // Then get latest cart from server
      const res = await apiRequest('GET', '/api/cart');
      const serverCart = await res.json();
      
      if (serverCart && Array.isArray(serverCart.items)) {
        dispatch({ type: 'SET_ITEMS', payload: serverCart.items });
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast({
        title: 'Error syncing cart',
        description: 'Failed to sync your cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addItem = async (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        await apiRequest('POST', '/api/cart/add', {
          productId: item.productId,
          quantity: item.quantity,
          weight: item.weight,
          pack: item.pack,
          variant: item.variant,
        });
      } catch (error) {
        console.error('Error adding item to cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to add item to cart on server',
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    });
  };

  const updateItem = async (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { itemId, quantity } });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        const cartItem = state.items.find(item => item._id === itemId);
        if (cartItem) {
          await apiRequest('PATCH', `/api/cart/${itemId}`, {
            quantity,
          });
        }
      } catch (error) {
        console.error('Error updating item quantity:', error);
        toast({
          title: 'Error',
          description: 'Failed to update cart item on server',
          variant: 'destructive',
        });
      }
    }
  };

  const removeItem = async (itemId: string) => {
    const itemToRemove = state.items.find(item => item._id === itemId);
    
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        await apiRequest('DELETE', `/api/cart/${itemId}`);
      } catch (error) {
        console.error('Error removing item from cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove item from cart on server',
          variant: 'destructive',
        });
      }
    }

    if (itemToRemove) {
      toast({
        title: 'Removed from cart',
        description: `${itemToRemove.name} has been removed from your cart`,
      });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        await apiRequest('DELETE', '/api/cart');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear cart on server',
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    });
  };

  const setDeliveryCharge = (charge: number) => {
    dispatch({ type: 'SET_DELIVERY_CHARGE', payload: charge });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        setDeliveryCharge,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}