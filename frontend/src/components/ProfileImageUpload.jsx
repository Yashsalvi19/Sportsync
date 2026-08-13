import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import apiClient from '../api/apiClient';

export default function ProfileImageUpload({ user, onUploadSuccess, onError }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Update Supabase Auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { profile_pic_url: publicUrl }
      });
      if (updateError) throw updateError;

      // Update Backend
      await apiClient.put('/users/profile-picture', { url: publicUrl });

      onUploadSuccess(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
      <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/20 border-2 border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF] font-extrabold text-xl overflow-hidden transition-all duration-300 group-hover:border-[#6C63FF] shadow-sm group-hover:shadow-[#6C63FF]/30">
        {user?.user_metadata?.profile_pic_url ? (
          <img src={user.user_metadata.profile_pic_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isUploading ? <Loader2 className="w-5 h-5 text-foreground animate-spin" /> : <Camera className="w-5 h-5 text-foreground" />}
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
