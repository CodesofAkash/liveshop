// API route for image proxy
import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitizeImageUrl } from '@/lib/image-validation';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    // Validate the image URL
    const validation = await validateAndSanitizeImageUrl(imageUrl);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Optional: Download and re-upload to your own storage
    // This gives you complete control over the images
    const response = await fetch(validation.sanitizedUrl!);
    const buffer = await response.arrayBuffer();
    
    // Here you could upload to AWS S3, Cloudinary, etc.
    // For now, we'll just validate and return the original URL
    
    return NextResponse.json({
      success: true,
      imageUrl: validation.sanitizedUrl,
      size: buffer.byteLength
    });
    
  } catch {
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
