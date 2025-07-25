import {create} from 'zustand';
import toast from 'react-hot-toast';
import {axiosInstance} from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';
export const useChatStore = create((set,get) => ({
   messages:[],
   users:[],
   selectedUser: null,
   isUsersLoading: false,
   isMessagesLoading: false,

   getUsers: async () => {
         set({ isUsersLoading: true });
         try {
              const res = await axiosInstance.get('/messages/users');
              set({ users: res.data });
         } catch (error) {
              console.error('Error fetching users:', error);
              toast.error('Failed to load users');
         }finally{
                set({ isUsersLoading: false });

         }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser,messages } = get();
        if (!selectedUser?._id) {
            toast.error('No user selected');
            return;
        }
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
            // toast.success('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }


    },

subscribeToMessages:()=>{
    const {selectedUser} = get();
    if (!selectedUser?._id) {
        // console.error('No user selected for message subscription');
        return;
    }
    const socket=useAuthStore.getState().socket;

   socket.on("newMessage" , (newMessage) => {
    const rightUser=newMessage.senderId === selectedUser._id;
    if(!rightUser) {
        return;
    }

    set({
        messages: [...get().messages, newMessage],
    });
   });
},
unsubscribeToMessages:()=>{
    const socket=useAuthStore.getState().socket;
    socket.off("newMessage");
},
        
    setSelectedUser: (selectedUser) => set({ selectedUser}),

}));