import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { RootState } from "../../app/store/configureStore";
import type { Category } from "../../app/models/category";

interface CategoryState {
    categoriesLoaded: boolean;
    status: string;
}

const categoryAdapter = createEntityAdapter<Category, number>({
  selectId: (category) => category.categoryId,
});

export const fetchCategoriesAsync = createAsyncThunk<Category[], void, {state: RootState}>(
    'brand/fetchCategoriesAsync',
    async (_, thunkAPI) => {
        try {
            return await agent.Category.list();
           
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

export const categorySlice = createSlice({
    name: 'categories',
    initialState: categoryAdapter.getInitialState<CategoryState>({
        categoriesLoaded: false,
        status: 'idle'
    }),
    reducers: {
       
        setCategory: (state, action) => {
            categoryAdapter.upsertOne(state, action.payload);
            state.categoriesLoaded = false;
        },
        removeCategory: (state, action) => {
            categoryAdapter.removeOne(state, action.payload);
            state.categoriesLoaded = false;
        }
    },
    extraReducers: 
        (builder => {
            builder.addCase(fetchCategoriesAsync.pending, (state, action) => {
                state.status = 'pendingFetchCategories'
            });
            builder.addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
                categoryAdapter.setAll(state, action.payload);
                state.status = 'idle';
                state.categoriesLoaded = true;
            });
            builder.addCase(fetchCategoriesAsync.rejected, (state, action) => {
                console.log(action.payload);
                state.status = 'idle';
            });
    })
})

export const categorySelectors = categoryAdapter.getSelectors((state: RootState) => state.category);

export const {setCategory, removeCategory} = categorySlice.actions;