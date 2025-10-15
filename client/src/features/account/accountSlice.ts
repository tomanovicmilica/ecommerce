import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { User } from "../../app/models/user";
interface LoginCredentials {
  email: string;
  password: string;
}
import { setBasket } from "../basket/basketSlice";
import agent from "../../app/api/agent";
import { router } from "../../app/router/Routes";
import { toast } from "react-toastify";

interface AccountState {
    user: User | null
}

const initialState: AccountState = {
    user: null
}

// Try to load user from localStorage on initial state creation
const getInitialUser = (): User | null => {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            // Basic validation - check if it has required fields
            if (user && user.token && user.email) {
                return user;
            }
        }
    } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('user'); // Clean up corrupted data
    }
    return null;
};

const initialStateWithUser: AccountState = {
    user: getInitialUser()
}

export const signInUser = createAsyncThunk<User, LoginCredentials>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            const userDto = await agent.Account.login(data);
            const {basket, ...user} = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async(_, thunkAPI) => {
        // First, set user from localStorage immediately for UI responsiveness
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            thunkAPI.dispatch(setUser(JSON.parse(storedUser)));
        }

        try {
            // Then validate with server and get fresh data
            const userDto = await agent.Account.currentUser();
            const {basket, ...user} = userDto;
            if(basket) thunkAPI.dispatch(setBasket(basket));
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
{
    condition: () => {
        // Only run if user exists in localStorage
        return !!localStorage.getItem('user');
    }
}
)

export const accountSlice = createSlice({
    name: 'account',
    initialState: initialStateWithUser,
    reducers: {
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            router.navigate('/home');
        },
        setUser: (state, action) => {
            if (action.payload.token) {
                let claims = JSON.parse(atob(action.payload.token.split('.')[1]));
                let roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                state.user = {...action.payload, roles: typeof(roles) === 'string' ? [roles] : roles};
            } else {
                // Update user data without token (e.g., profile updates)
                state.user = {...state.user, ...action.payload};
            }
            // Always persist user data to localStorage
            if (state.user) {
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Session expired - please login again');
            router.navigate('/home');
        })
        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            let claims = JSON.parse(atob(action.payload.token.split('.')[1])); 
            let roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            state.user = {...action.payload, roles: typeof(roles) === 'string' ? [roles] : roles};  
        });
        builder.addMatcher(isAnyOf(signInUser.rejected), (state, action) => {
            // Don't throw here - let the Login component handle the error
            console.log('Login rejected:', action.payload);
        })
    })
})

export const {signOut, setUser} = accountSlice.actions;