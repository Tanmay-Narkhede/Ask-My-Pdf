import AWS from 'aws-sdk';

export async function uploadToS3(file: File){
    try{  // Initialize the S3 client with credentials
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        });
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            },
            region: 'ap-south-1', // Adjust the region as needed

    })

// Generate a unique file key using the current timestamp and the original file name
    const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ', '_');

    const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
        Body: file
    }

    const upload =s3.putObject(params).on('httpUploadProgress', evt =>{
        console.log('uploading to s3...', parseInt(((evt.loaded*100)/evt.total).toString()) + '%')
    }).promise()

    await upload.then(data =>{
        console.log('File uploaded successfully to s3!', data);

    })
    
    return Promise.resolve({
        file_key,
        file_name: file.name,
    })

} 
catch (error) {
    console.error('Error uploading file to S3:', error);
    return Promise.reject(error);
  }
}


export function getS3FileUrl(file_key: string) {
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazinaws.com/${file_key}`;
    return url;
};