import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  authUser:null,
  isSigningUp:false,
isLoggingIn:false,
isUpdatingProfile:false,
  isCheckingAuth:true,
  onlineUsers: [],

 checkAuth :async()=>{
    try{
       const res= await axiosInstance.get("http://localhost:5001/api/auth/check");
       set({authUser:res.data})
    }catch(error){
        console.error("Error checking auth:", error);
        set({authUser:null})
    }finally{ 
        set({isCheckingAuth:false})
    }

 },

 signup:async(data)=>{
  set({isSigningUp:true});
  try{
    const res= await axiosInstance.post("http://localhost:5001/api/auth/signup",data);
    set({authUser:res.data});
    toast.success("Account created successfully");
  }catch(error){
console.error("Signup failed:", error.response?.data?.message || error.message);
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "Failed to create account"
    );
    
  }finally{
    set({isSigningUp:false});
  }

 },

 logout:async()=>{  
  try{
    await axiosInstance.post("/auth/logout");
    set({authUser:null});
    toast.success("Logged out succesfully");

  }catch(error){
    toast.error(error.response.data.message);
}
 },

 login:async (data)=>{
  set({isLoggingIn:true});
  try{
    const res= await axiosInstance.post("http://localhost:5001/api/auth/login",data);
    set({authUser:res.data});
    toast.success("Logged in successfully");
  }catch(error){
    console.error("Login failed:", error.response?.data?.message || error.message);
    toast.error(
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "Failed to login"
    );
  }finally{
    set({isLoggingIn:false});
  }
 },
 updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));