import {create} from 'zustand';
import toast from 'react-hot-toast';
import {axiosInstance} from '../lib/axios.js';

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
            set({ messsage: res.data });
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
            set({ messsage: [...messages, res.data] });
            toast.success('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }


    },
        
    setSelectedUser: (selectedUser) => set({ selectedUser}),

}));