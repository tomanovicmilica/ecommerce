import type { Basket } from "./basket";

export interface User {
    email: string;
    token: string;
    basket?: Basket;
    roles?: string[];
    name?: string;
    lastName?: string;
    phoneNumber?: string;
}

export interface Role {
    id: number;
    name: string;
    userCount: number;
}

export interface AdminUser {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    joinDate: string;
    orderCount: number;
    totalSpent: number;
    isActive: boolean;
}