'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  Package, 
  Plus, 
  X, 
  Save, 
  ArrowLeft,
  Image as ImageIcon,
  IndianRupee,
  Tag,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

interface ProductFormData {
  title: string; // ✅ Changed from 'name' to 'title' to match API
  description: string;
  price: number;
  category: string;
  images: string[]; // ✅ Changed from imageUrl to images array
  inStock: boolean;
  inventory: number;
  tags: string[];
  features: string[];
  specifications: Record<string, string>;
}

const categories = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Books',
  'Beauty & Personal Care',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Accessories'
];

export default function CreateProductPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  
  // All useState hooks must be at the top
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [currentFeature, setCurrentFeature] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState(categories);
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    inStock: true,
    inventory: 0,
    tags: [],
    features: [],
    specifications: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            const categoryNames = data.data.map((cat: { name: string }) => cat.name);
            setAvailableCategories([...new Set([...categories, ...categoryNames])]);
          }
        }
      } catch {
        console.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);
  
  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to create products. Please sign in to continue.
          </p>
          <div className="space-y-3">
            <SignInButton mode="modal">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Sign In
              </Button>
            </SignInButton>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Product title is required'; // ✅ Changed from 'name' to 'title'
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'; // ✅ Changed validation
    if (formData.inventory < 0) newErrors.inventory = 'Inventory cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (keyToRemove: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[keyToRemove];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleImageUrlChange = (url: string) => {
    setCurrentImageUrl(url);
  };

  const addImage = () => {
    if (!currentImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    
    if (formData.images.includes(currentImageUrl)) {
      toast.error('This image URL is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, currentImageUrl]
    }));
    setCurrentImageUrl('');
    toast.success('Image added successfully');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const product = await response.json();
        toast.success('Product created successfully!');
        router.push(`/products/${product.data.id}`);
      } else {
        const error = await response.text();
        toast.error(`Failed to create product: ${error}`);
      }
    } catch {
      toast.error('An error occurred while creating the product');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // In a real app, save to localStorage or draft API
    localStorage.setItem('productDraft', JSON.stringify(formData));
    toast.success('Draft saved locally');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('productDraft');
    if (draft) {
      const draftData = JSON.parse(draft);
      setFormData(draftData);
      toast.success('Draft loaded');
    } else {
      toast.error('No draft found');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create New Product</h1>
            <p className="text-gray-600">Add a new product to your LiveShop catalog</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter product title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your product in detail"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      {!isCreatingNewCategory ? (
                        <div className="space-y-2">
                          <Select value={formData.category} onValueChange={(value) => {
                            if (value === 'CREATE_NEW') {
                              setIsCreatingNewCategory(true);
                              setFormData(prev => ({ ...prev, category: '' }));
                            } else {
                              handleInputChange('category', value);
                            }
                          }}>
                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="CREATE_NEW">
                                <span className="flex items-center">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create New Category
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new category name"
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              className={errors.category ? 'border-red-500' : ''}
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                if (customCategory.trim()) {
                                  const newCategory = customCategory.trim();
                                  handleInputChange('category', newCategory);
                                  setAvailableCategories(prev => 
                                    prev.includes(newCategory) 
                                      ? prev 
                                      : [...prev, newCategory]
                                  );
                                  setIsCreatingNewCategory(false);
                                  setCustomCategory('');
                                }
                              }}
                              disabled={!customCategory.trim()}
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsCreatingNewCategory(false);
                                setCustomCategory('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Product Images ({formData.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="imageUrl">Add Image URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        value={currentImageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addImage();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addImage}
                        disabled={!currentImageUrl.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.images && (
                      <p className="text-sm text-red-500 mt-1">{errors.images}</p>
                    )}
                  </div>
                  
                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div>
                      <Label>Image Previews ({formData.images.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
                              <Image 
                                src={imageUrl} 
                                alt={`Preview ${index + 1}`} 
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                                style={{
                                  width: '100%',
                                  height: '100%'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-image.jpg';
                                }}
                              />
                            </div>
                            <div className="absolute top-2 right-2">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <Badge variant="secondary" className="text-xs">
                                {index === 0 ? 'Main' : `${index + 1}`}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        The first image will be used as the main product image.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Inventory & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="inStock">In Stock</Label>
                      <p className="text-sm text-gray-600">Product is available for purchase</p>
                    </div>
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inventory">Inventory Quantity</Label>
                    <Input
                      id="inventory"
                      type="number"
                      min="0"
                      value={formData.inventory || ''}
                      onChange={(e) => handleInputChange('inventory', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className={errors.inventory ? 'border-red-500' : ''}
                    />
                    {errors.inventory && (
                      <p className="text-sm text-red-500 mt-1">{errors.inventory}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags & Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          className="ml-1 cursor-pointer hover:text-red-500"
                          onClick={(e) => {
                            e.preventDefault();
                            removeTag(tag);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={`feature-${index}`} className="flex items-center justify-between p-2 border rounded">
                        <span>{feature}</span>
                        <button
                          type="button"
                          className="cursor-pointer hover:text-red-500"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFeature(feature);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      placeholder="Specification name"
                    />
                    <Input
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder="Value"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                    />
                  </div>
                  <Button type="button" onClick={addSpecification} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>

                  <div className="space-y-2">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={`spec-${key}`} className="flex items-center justify-between p-2 border rounded">
                        <span><strong>{key}:</strong> {value}</span>
                        <button
                          type="button"
                          className="cursor-pointer hover:text-red-500"
                          onClick={(e) => {
                            e.preventDefault();
                            removeSpecification(key);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      'Creating...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="w-full"
                  >
                    Save Draft
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadDraft}
                    className="w-full"
                  >
                    Load Draft
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    {formData.images.length > 0 && (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <Image 
                          src={formData.images[0]} 
                          alt="Preview" 
                          width={300} 
                          height={300} 
                          className="object-cover w-full h-full"
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    )}
                    <h3 className="font-semibold mb-1">{formData.title || 'Product Title'}</h3>
                    <p className="text-sm text-gray-600 mb-2">{formData.category || 'Category'}</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(formData.price || 0)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}