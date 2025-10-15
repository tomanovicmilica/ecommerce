import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Product, Category, ProductVariant, ProductType } from '../../../app/models/product';
import agent from '../../../app/api/agent';

interface AttributeValue {
    id: number;
    value: string;
    attributeId: number;
}

interface Attribute {
    id: number;
    name: string;
    type: string;
    values: AttributeValue[];
}

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    categoryId: z.number().min(1, 'Category is required'),
    productType: z.number(),
    digitalFileUrl: z.string().optional(),
    isInstantDelivery: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
    product?: Product;
    onSubmit: (data: ProductFormData & { images: File[], variants: ProductVariant[] }) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, loading = false }: Props) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product ? {
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            productType: product.productType || 0,
            digitalFileUrl: product.digitalFileUrl || '',
            isInstantDelivery: product.isInstantDelivery || false,
        } : {
            name: '',
            description: '',
            price: 0,
            categoryId: 0,
            productType: 0,
            digitalFileUrl: '',
            isInstantDelivery: false,
        }
    });

    // Watch product type to show/hide digital fields
    const selectedProductType = watch('productType');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await agent.Admin.getCategories();
                console.log('Categories loaded:', response);
                setCategories(response);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        const fetchAttributes = async () => {
            try {
                const response = await agent.Admin.getAttributes();
                setAttributes(response);
            } catch (error) {
                console.error('Failed to fetch attributes:', error);
            }
        };

        fetchCategories();
        fetchAttributes();

        // Set existing variants if editing
        if (product?.variants) {
            setVariants(product.variants);
        }
    }, [product]);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setSelectedImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        const newVariant: ProductVariant = {
            productVariantId: 0, // Will be set by backend
            productId: product?.productId || 0,
            price: watch('price'), // Use base product price
            quantityInStock: 0,
            attributeValueIds: [],
            attributes: []
        };
        setVariants(prev => [...prev, newVariant]);
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        setVariants(prev => prev.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        ));
    };

    const updateVariantAttributeValues = (variantIndex: number, attributeValueIds: number[]) => {
        setVariants(prev => prev.map((variant, i) => {
            if (i === variantIndex) {
                // Update the attributeValueIds array
                const updatedVariant = { ...variant, attributeValueIds };

                // Also update the attributes array for display purposes
                const attributeDetails = attributeValueIds.map(valueId => {
                    const attribute = attributes.find(attr =>
                        attr.values.some(val => val.id === valueId)
                    );
                    const value = attribute?.values.find(val => val.id === valueId);
                    return {
                        attributeName: attribute?.name || '',
                        attributeValue: value?.value || ''
                    };
                }).filter(attr => attr.attributeName && attr.attributeValue);

                updatedVariant.attributes = attributeDetails;
                return updatedVariant;
            }
            return variant;
        }));
    };

    const isAttributeValueSelected = (variantIndex: number, valueId: number): boolean => {
        return variants[variantIndex]?.attributeValueIds.includes(valueId) || false;
    };

    const toggleAttributeValue = (variantIndex: number, attributeId: number, valueId: number) => {
        const variant = variants[variantIndex];
        const currentValues = variant.attributeValueIds || [];

        // Remove any other values from the same attribute (since each attribute should have only one value per variant)
        const attribute = attributes.find(attr => attr.id === attributeId);
        const otherValuesFromSameAttribute = attribute?.values
            .filter(val => val.id !== valueId)
            .map(val => val.id) || [];

        const filteredValues = currentValues.filter(id => !otherValuesFromSameAttribute.includes(id));

        // Toggle the selected value
        const newValues = filteredValues.includes(valueId)
            ? filteredValues.filter(id => id !== valueId)
            : [...filteredValues, valueId];

        updateVariantAttributeValues(variantIndex, newValues);
    };

    const onFormSubmit = (data: ProductFormData) => {
        onSubmit({ ...data, images: selectedImages, variants });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onCancel}
                        className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter product name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Base Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    {...register('price', { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                {...register('categoryId', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option key="default" value={0}>Select category</option>
                                {categories.map((category, index) => (
                                    <option key={`category-${category.categoryId || index}`} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Type *
                            </label>
                            <select
                                {...register('productType', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value={0}>Physical Product</option>
                                <option value={1}>Digital Product</option>
                            </select>
                            {errors.productType && (
                                <p className="mt-1 text-sm text-red-600">{errors.productType.message}</p>
                            )}
                        </div>

                        {/* Digital Product Fields - Only show for digital products */}
                        {selectedProductType === 1 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Digital File URL
                                    </label>
                                    <input
                                        {...register('digitalFileUrl')}
                                        type="url"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="https://example.com/download-link"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        URL where customers can download the digital product
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        {...register('isInstantDelivery')}
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 mr-2"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Enable instant delivery after payment
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter product description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>

                    <div className="space-y-4">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900">Upload product images</p>
                                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                <button
                                    type="button"
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Choose Files
                                </button>
                            </label>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={`preview-${index}-${preview.slice(-10)}`} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Variants */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variant
                        </button>
                    </div>

                    {/* Helpful note based on product type */}
                    <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-sm text-blue-800">
                            {selectedProductType === 1
                                ? "💾 Digital products: Create variants for different license types, subscription periods, or feature tiers (e.g., Basic, Pro, Enterprise)."
                                : "📦 Physical products: Create variants for different sizes, colors, materials, or other physical attributes."
                            }
                        </p>
                    </div>

                    {variants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No variants added yet. Click "Add Variant" to create product variations.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Variant {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price Override
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.quantityInStock}
                                                onChange={(e) => updateVariant(index, 'quantityInStock', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Attributes
                                            </label>
                                            <div className="space-y-4">
                                                {attributes.map(attribute => (
                                                    <div key={attribute.id} className="border border-gray-200 rounded-lg p-4">
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                                                            {attribute.name}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {attribute.values.map(value => (
                                                                <button
                                                                    key={value.id}
                                                                    type="button"
                                                                    onClick={() => toggleAttributeValue(index, attribute.id, value.id)}
                                                                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                                                        isAttributeValueSelected(index, value.id)
                                                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    {value.value}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {attributes.length === 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        No attributes available. Create attributes first in the Attributes section.
                                                    </p>
                                                )}
                                                {variant.attributes && variant.attributes.length > 0 && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Selected:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {variant.attributes.map((attr, attrIndex) => (
                                                                <span
                                                                    key={`${attr.attributeName}-${attr.attributeValue}-${attrIndex}`}
                                                                    className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                                                                >
                                                                    {attr.attributeName}: {attr.attributeValue}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}