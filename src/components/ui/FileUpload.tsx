'use client';
import { useRouter } from 'next/navigation';
import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import { Inbox, Loader2 } from 'lucide-react';
import React from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios';
import toast from 'react-hot-toast';

const FileUpload = () => {
  const router = useRouter()
  const[uploading, setUploading] = React.useState(false);
  const{mutate, isPending}= useMutation({
    mutationFn: async ( {file_key, file_name}: {
      file_key: string;
      file_name: string;
    } ) => {
      const response = await axios.post('/api/create-chat', {file_key, file_name});
      return response.data;
    },
    
  })

  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if(file.size > 10 * 1024 * 1024) { // 10 MB limit
          toast.error('File size exceeds 10 MB, Please upload a smaller file.');
          return;
        }
        // You can handle the file upload here, e.g., send it to a server or process it
        try{
          setUploading(true);
          const data = await uploadToS3(file);
          if (!data?.file_key || !data?.file_name) {
            toast.error('something went wrong');
            return;
          }
          console.log('File uploaded successfully:', data);
          mutate(data,{
            onSuccess: ({chat_id}) =>{
              toast.success("Chat created");
              router.push(`/chat/${chat_id}`)
            },
            onError: () =>{
              toast.error("Error Creating Chat");
            },
          })
        }
        catch(error) {
          console.error( error);
        } finally{
          setUploading(false);
        }
  },
});

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
      {...getRootProps({
        className: 'border-dashed border-2 rounded-xl cursor-pointer bg-zinc-100 py-8 flex justify-center item-center',
      })}>
        <input {...getInputProps()} />
        {(uploading || isPending ) ?(
          <>
          {/* loading state */}
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className ="mt-2 text-sm text-slate-400">
            your file is being uploaded, please wait...
          </p>
          </>
        ):(
        <>
        <Inbox className="w-10 h-10 text-sky-300" />
        <p className ="mt-2.5 ml-3 text-sm text-slate-400">Drop your PDF Here</p>
        </>
        )}
      </div>
    </div>
  )
}

export default FileUpload