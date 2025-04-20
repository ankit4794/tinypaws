import * as React from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export interface WishlistItem {
  _id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  addedAt: string;
  inStock?: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

interface WishlistContextType extends WishlistState {
  addItem: (item: Omit<WishlistItem, '_id' | 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  toggleWishlist: (item: Omit<WishlistItem, '_id' | 'addedAt'>) => void;
  isInWishlist: (productId: string) => boolean;
  syncWishlist: () => Promise<void>;
}

type WishlistAction =
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_LOADING'; payload: boolean };

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      };
    
    case 'ADD_ITEM': {
      // Check if item already exists
      const existingItem = state.items.find(
        item => item.productId === action.payload.productId
      );

      if (existingItem) {
        return state; // Item already in wishlist
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload),
      };
    }

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    isLoading: false,
  });

  // Load wishlist from local storage on initial load
  useEffect(() => {
    const loadWishlistFromStorage = () => {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        try {
          const parsedWishlist = JSON.parse(storedWishlist);
          dispatch({ type: 'SET_ITEMS', payload: parsedWishlist });
        } catch (error) {
          console.error('Failed to parse wishlist from local storage:', error);
          localStorage.removeItem('wishlist');
        }
      }
    };

    loadWishlistFromStorage();
  }, []);

  // Save wishlist to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  }, [state.items]);

  // Fetch user's wishlist when logged in
  useEffect(() => {
    if (user) {
      syncWishlist();
    }
  }, [user]);

  const syncWishlist = async (): Promise<void> => {
    try {
      if (!user) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      // First sync local wishlist to server
      if (state.items.length > 0) {
        await apiRequest('POST', '/api/wishlist/sync', {
          items: state.items.map(item => ({
            productId: item.productId,
          })),
        });
      }

      // Then get latest wishlist from server
      const res = await apiRequest('GET', '/api/wishlist');
      const serverWishlist = await res.json();
      
      if (serverWishlist && Array.isArray(serverWishlist.items)) {
        dispatch({ type: 'SET_ITEMS', payload: serverWishlist.items });
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      toast({
        title: 'Error syncing wishlist',
        description: 'Failed to sync your wishlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addItem = async (item: Omit<WishlistItem, '_id' | 'addedAt'>) => {
    const newItem: WishlistItem = {
      ...item,
      _id: `local_${Date.now()}_${item.productId}`,
      addedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        await apiRequest('POST', '/api/wishlist/add', {
          productId: item.productId,
        });
      } catch (error) {
        console.error('Error adding item to wishlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to add item to wishlist on server',
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Added to wishlist',
      description: `${item.name} has been added to your wishlist`,
    });
  };

  const removeItem = async (productId: string) => {
    const itemToRemove = state.items.find(item => item.productId === productId);
    
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        await apiRequest('DELETE', `/api/wishlist/${productId}`);
      } catch (error) {
        console.error('Error removing item from wishlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove item from wishlist on server',
          variant: 'destructive',
        });
      }
    }

    if (itemToRemove) {
      toast({
        title: 'Removed from wishlist',
        description: `${itemToRemove.name} has been removed from your wishlist`,
      });
    }
  };

  const clearWishlist = async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    
    // If user is logged in, sync with server
    if (user) {
      try {
        await apiRequest('DELETE', '/api/wishlist');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear wishlist on server',
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Wishlist cleared',
      description: 'All items have been removed from your wishlist',
    });
  };

  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  const toggleWishlist = async (item: Omit<WishlistItem, '_id' | 'addedAt'>) => {
    if (isInWishlist(item.productId)) {
      await removeItem(item.productId);
    } else {
      await addItem(item);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        clearWishlist,
        toggleWishlist,
        isInWishlist,
        syncWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}