// /app/api/upload/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                resource_type: 'auto',
                timeout: 60000 // NEW: Increase timeout to 60 seconds
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('images');

        if (files.length === 0) {
            return NextResponse.json({ error: 'No files were provided.' }, { status: 400 });
        }

        const uploadPromises = files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return uploadToCloudinary(buffer);
        });

        const results = await Promise.all(uploadPromises);
        
        const uploadedImageDetails = results.map(result => ({
            secure_url: result.secure_url,
            public_id: result.public_id,
        }));

        return NextResponse.json({ images: uploadedImageDetails });

    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return NextResponse.json({ error: 'Failed to upload images.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { publicId } = await request.json();

        if (!publicId) {
            return NextResponse.json({ error: 'Image publicId is required.' }, { status: 400 });
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return NextResponse.json({ message: 'Image deleted successfully from Cloudinary.' });
        } else {
            return NextResponse.json({ error: 'Failed to delete image from Cloudinary.', details: result }, { status: 500 });
        }

    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}