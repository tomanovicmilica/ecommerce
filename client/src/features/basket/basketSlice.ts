import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { Basket } from "../../app/models/basket";
import agent from "../../app/api/agent";
import { getCookie } from "../../app/util/util";
import type { RootState } from "../../app/store/configureStore";

interface BasketState {
    basket: Basket | null;
    status: string;
}

const initialState: BasketState = {
    basket: null,
    status: 'idle'
}

export const fetchBasketAsync = createAsyncThunk<Basket>(
    'basket/fetchBasketAsync',
    async (_, thunkAPI) => {
        try {
            return await agent.Basket.get();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data});
        }
    },
    {
        condition: () => {
            if (!getCookie('buyerId')) return false;
        }
    }
)

export const addBasketItemAsync = createAsyncThunk<
  Basket, 
  { productId: number; quantity?: number; attributeValueIds?: number[] },
  { state: RootState }
>(
    'basket/addBasketItemAsync',
    async({productId, quantity = 1, attributeValueIds}, thunkAPI) => {
        try {
            
            return await agent.Basket.addItem(productId, quantity, attributeValueIds ?? []);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

export const removeBasketItemAsync = createAsyncThunk<void, { productId: number; attributeValueIds?: number[]; quantity: number; },
  { state: RootState }
>(
        'basket/removeBasketItemASync',
    async ({productId, attributeValueIds, quantity }, thunkAPI) => {
        try {
            await agent.Basket.removeItem(productId, attributeValueIds ?? [], quantity);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

export const basketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {
        setBasket: (state, action) => {
            state.basket = action.payload
        },
        clearBasket: (state) => {
            state.basket = null;
        }
    },
    extraReducers: builder => {
        builder.addCase(addBasketItemAsync.pending, (state, action) => {
            const ids = action.meta.arg.attributeValueIds?.join('-') ?? '';
            state.status = 'pendingAddItem' + action.meta.arg.productId + ids;
        });
        
        builder.addCase(removeBasketItemAsync.pending, (state, action) => {
    const ids = action.meta.arg.attributeValueIds?.join('-') ?? '';
    state.status = 'pendingRemoveItem' + action.meta.arg.productId + ids;
});
        builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
    const { productId, attributeValueIds, quantity } = action.meta.arg;
    const itemIndex = state.basket?.items.findIndex(i =>
        i.productId === productId &&
        (
            // Try to match by attributeValueIds first
            (attributeValueIds?.length && i.attributeValueIds?.length &&
             JSON.stringify(i.attributeValueIds.sort()) === JSON.stringify(attributeValueIds.sort())) ||
            // Fallback: if both have empty/undefined attributeValueIds, they match
            (!attributeValueIds?.length && !i.attributeValueIds?.length)
        )
    );
    if (itemIndex === -1 || itemIndex === undefined) return;
    state.basket!.items[itemIndex].quantity -= quantity;
    if (state.basket!.items[itemIndex].quantity <= 0)
        state.basket!.items.splice(itemIndex, 1);
    state.status = 'idle';
        });
        builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
        builder.addMatcher(isAnyOf(addBasketItemAsync.fulfilled, fetchBasketAsync.fulfilled), (state, action) => {
            state.basket = action.payload;
            state.status = 'idle';
        });
        builder.addMatcher(isAnyOf(addBasketItemAsync.rejected, fetchBasketAsync.rejected), (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
    }
})

export const {setBasket, clearBasket} = basketSlice.actions;